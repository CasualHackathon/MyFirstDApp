import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  AppBar,
  Toolbar,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Wallet as WalletIcon
} from '@mui/icons-material';
import { contractService } from '../services/contractService';
import { walletService } from '../services/walletService';
import { AchievementType, ACHIEVEMENT_CONFIG } from '../types/nft';
import type { AchievementInfo } from '../types/nft';
import ProgressDialog from '../components/ProgressDialog';
import type { ProgressStep } from '../components/ProgressDialog';

interface AchievementDisplay {
  type: AchievementType;
  info: AchievementInfo;
  hasAchievement: boolean;
  canMint: boolean;
  progress: number;
  config: {
    name: string;
    description: string;
    imageUrl: string;
    threshold: number;
    rarity: string;
  };
}

const Achievement: React.FC = () => {
  const navigate = useNavigate();
  const [currentUserAddress, setCurrentUserAddress] = useState<string>('');
  const [achievements, setAchievements] = useState<AchievementDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingAchievement, setMintingAchievement] = useState<AchievementType | null>(null);
  const [openMintDialog, setOpenMintDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDisplay | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // 进度对话框状态
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 连接钱包
  const connectWallet = async () => {
    console.log('[Achievement] 开始连接钱包');
    try {
      console.log('[Achievement] 调用walletService.connect()');
      await walletService.connect();
      
      console.log('[Achievement] 获取钱包地址');
      const address = await walletService.getCurrentAddress();
      if (address) {
        console.log('[Achievement] 钱包地址获取成功:', address);
        setCurrentUserAddress(address);
        sessionStorage.setItem('currentUserAddr', address);
        return address;
      }
      console.log('[Achievement] 钱包连接成功');
    } catch (error) {
      console.error('[Achievement] 钱包连接失败:', error);
      showSnackbar('连接钱包失败', 'error');
    }
    return null;
  };

  // 显示提示消息
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 加载成就数据
  const loadAchievements = React.useCallback(async (userAddress: string) => {
    try {
      setLoading(true);
      
      // 获取用户成就状态
      const achievementStatus = await contractService.checkMyAchievements(userAddress);
      
      // 获取用户统计数据
      const userStats = await contractService.getUserStats(userAddress);
      
      // 转换为显示格式
      const achievementDisplays: AchievementDisplay[] = [];
      
      for (const [typeKey, status] of Object.entries(achievementStatus)) {
        const achievementType = parseInt(typeKey) as AchievementType;
        const config = ACHIEVEMENT_CONFIG[achievementType];
        
        if (config) {
          // 根据成就类型计算实际进度
          let currentProgress = 0;
          switch (achievementType) {
            case AchievementType.FIRST_OATH: // 首次誓约 - 创建誓约数量
              currentProgress = userStats.totalOaths;
              break;
            case AchievementType.OATH_KEEPER: // 守约达人 - 完成誓约数量
              currentProgress = userStats.completedOaths;
              break;
            case AchievementType.TRUSTED_CREATOR: // 信任创建者 - 获得点赞数
              currentProgress = userStats.totalUpvotes;
              break;
            case AchievementType.COMMUNITY_STAR: // 社区之星 - 获得点赞数
              currentProgress = userStats.totalUpvotes;
              break;
            case AchievementType.MILESTONE_MASTER: // 里程碑大师 - 创建誓约数量
              currentProgress = userStats.totalOaths;
              break;
            case AchievementType.EARLY_ADOPTER: // 早期采用者 - 创建誓约数量
              currentProgress = userStats.totalOaths;
              break;
            default:
              currentProgress = 0;
          }
          
          achievementDisplays.push({
            type: achievementType,
            info: config,
            hasAchievement: status.hasAchievement,
            // 简化判断逻辑，如果没有成就就可以铸造
            canMint: !status.hasAchievement,
            progress: currentProgress,
            config: config
          });
        }
      }
      
      setAchievements(achievementDisplays);
    } catch (error) {
      console.error('加载成就数据失败:', error);
      showSnackbar('加载成就数据失败', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // 铸造成就NFT
  const handleMintAchievement = async (achievement: AchievementDisplay) => {
    if (!currentUserAddress) {
      showSnackbar('请先连接钱包', 'error');
      return;
    }

    // 初始化进度步骤
    const steps: ProgressStep[] = [
      { id: '1', label: '验证成就资格', status: 'pending', description: '检查用户是否符合铸造条件' },
      { id: '2', label: '准备铸造数据', status: 'pending', description: '生成NFT元数据和图片' },
      { id: '3', label: '提交铸造交易', status: 'pending', description: '向区块链提交铸造请求' },
      { id: '4', label: '等待交易确认', status: 'pending', description: '等待区块链网络确认交易' },
      { id: '5', label: '完成铸造', status: 'pending', description: '更新本地数据并显示结果' }
    ];

    setProgressSteps(steps);
    setCurrentStepIndex(0);
    setProgressOpen(true);
    setMintingAchievement(achievement.type);

    try {
      // 步骤1: 验证成就资格
      setProgressSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'running' as const } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgressSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(1);

      // 步骤2: 准备铸造数据
      setProgressSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'running' as const } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgressSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(2);

      // 步骤3: 提交铸造交易
      setProgressSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'running' as const } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgressSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(3);

      // 步骤4: 等待交易确认
      setProgressSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'running' as const } : step
      ));
      
      // 调用合约铸造成就
      await contractService.mintAchievement(
        0, // oathId - 使用0作为默认值
        achievement.type,
        achievement.info.imageUrl
      );
      
      setProgressSteps(prev => prev.map((step, index) =>
        index === 3 ? { ...step, status: 'running' as const } : step
      ));
      setCurrentStepIndex(4);

      // 步骤5: 完成铸造
      setProgressSteps(prev => prev.map((step, index) => 
        index === 4 ? { ...step, status: 'running' as const } : step
      ));
      
      // 重新加载成就数据
      await loadAchievements(currentUserAddress);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgressSteps(prev => prev.map((step, index) => 
        index === 4 ? { ...step, status: 'completed' } : step
      ));
      
      showSnackbar('成就NFT铸造成功！', 'success');
      
      // 延迟关闭进度对话框
      setTimeout(() => {
        setProgressOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error('铸造成就失败:', error);
      
      // 将当前步骤标记为失败
      setProgressSteps(prev => prev.map((step, index) => 
        index === currentStepIndex ? { ...step, status: 'error', description: `${step.description} - 失败: ${error instanceof Error ? error.message : '未知错误'}` } : step
      ));
      
      showSnackbar('铸造成就失败', 'error');
      
      // 延迟关闭进度对话框
      setTimeout(() => {
        setProgressOpen(false);
      }, 3000);
    } finally {
      setMintingAchievement(null);
      setOpenMintDialog(false);
    }
  };

  // 打开铸造确认对话框
  const openMintConfirmDialog = (achievement: AchievementDisplay) => {
    setSelectedAchievement(achievement);
    setOpenMintDialog(true);
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9E9E9E';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  // 获取稀有度文本
  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return '普通';
      case 'rare': return '稀有';
      case 'epic': return '史诗';
      case 'legendary': return '传说';
      default: return '普通';
    }
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      // 检查是否已连接钱包
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if ((accounts as string[]).length > 0) {
          setCurrentUserAddress((accounts as string[])[0]);
          await loadAchievements((accounts as string[])[0]);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    init();
  }, [loadAchievements]);

  // 当用户地址变化时重新加载数据
  useEffect(() => {
    if (currentUserAddress) {
      loadAchievements(currentUserAddress);
    }
  }, [currentUserAddress, loadAchievements]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <TrophyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1,
              color: 'text.primary',
              fontWeight: 'bold'
            }}
          >
            成就中心
          </Typography>
          
          {!currentUserAddress && (
            <Button
              variant="contained"
              startIcon={<WalletIcon />}
              onClick={connectWallet}
              sx={{ ml: 2 }}
            >
              连接钱包
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : !currentUserAddress ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <TrophyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              请连接钱包查看您的成就
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<WalletIcon />}
              onClick={connectWallet}
              sx={{ mt: 2 }}
            >
              连接钱包
            </Button>
          </Box>
        ) : (
          <>
            {/* 成就统计 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                我的成就
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                已获得 {achievements.filter(a => a.hasAchievement).length} / {achievements.length} 个成就
              </Typography>
              
              <LinearProgress
                variant="determinate"
                value={(achievements.filter(a => a.hasAchievement).length / achievements.length) * 100}
                sx={{ height: 8, borderRadius: 4, mb: 4 }}
              />
            </Box>

            {/* 成就列表 */}
            <Grid container spacing={3}>
              {achievements.map((achievement) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.type}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      border: achievement.hasAchievement ? `2px solid ${getRarityColor(achievement.info.rarity)}` : '1px solid #e0e0e0',
                      opacity: achievement.hasAchievement ? 1 : 0.7,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {/* 成就状态标识 */}
                    {achievement.hasAchievement && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1
                        }}
                      >
                        <CheckIcon sx={{ color: 'success.main', fontSize: 24 }} />
                      </Box>
                    )}
                    
                    {!achievement.hasAchievement && !achievement.canMint && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1
                        }}
                      >
                        <LockIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
                      </Box>
                    )}

                    {/* 成就图片 */}
                    <CardMedia
                      component="img"
                      height="200"
                      image={achievement.info.imageUrl}
                      alt={achievement.info.name}
                      sx={{
                        objectFit: 'contain',
                        bgcolor: 'grey.100',
                        filter: achievement.hasAchievement ? 'none' : 'grayscale(100%)'
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* 稀有度标签 */}
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          icon={<StarIcon />}
                          label={getRarityText(achievement.info.rarity)}
                          size="small"
                          sx={{
                            bgcolor: getRarityColor(achievement.info.rarity),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>

                      {/* 成就名称和描述 */}
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {achievement.info.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {achievement.info.description}
                      </Typography>

                      {/* 进度条 */}
                      {!achievement.hasAchievement && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              进度
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {achievement.progress} / {achievement.info.threshold}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((achievement.progress / achievement.info.threshold) * 100, 100)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      )}

                      {/* 操作按钮 */}
                      {achievement.hasAchievement ? (
                        <Chip
                          icon={<CheckIcon />}
                          label="已获得"
                          color="success"
                          variant="filled"
                        />
                      ) : achievement.canMint ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => openMintConfirmDialog(achievement)}
                          disabled={mintingAchievement === achievement.type}
                          startIcon={mintingAchievement === achievement.type ? <CircularProgress size={16} /> : <TrophyIcon />}
                        >
                          {mintingAchievement === achievement.type ? '铸造中...' : '铸造NFT'}
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          disabled
                          startIcon={<LockIcon />}
                        >
                          未达成
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      {/* 铸造确认对话框 */}
      <Dialog
        open={openMintDialog}
        onClose={() => setOpenMintDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrophyIcon sx={{ mr: 1, color: 'primary.main' }} />
            铸造成就NFT
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAchievement && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <img
                src={selectedAchievement.info.imageUrl}
                alt={selectedAchievement.info.name}
                style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 16 }}
              />
              <Typography variant="h6" gutterBottom>
                {selectedAchievement.info.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedAchievement.info.description}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                铸造成就NFT需要支付少量Gas费用，确认要继续吗？
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMintDialog(false)}>
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => selectedAchievement && handleMintAchievement(selectedAchievement)}
            disabled={mintingAchievement !== null}
          >
            {mintingAchievement !== null ? '铸造中...' : '确认铸造'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* 进度对话框 */}
      <ProgressDialog
        open={progressOpen}
        steps={progressSteps}
        currentStepIndex={currentStepIndex}
        title="铸造成就NFT"
      />
    </Box>
  );
};

export default Achievement;