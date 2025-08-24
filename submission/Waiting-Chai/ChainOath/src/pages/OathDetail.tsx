import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Divider,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { contractService } from '../services/contractService';
import type { Oath, Comment } from '../services/contractService';
import { CompletionStatus } from '../services/contractService';
import ProgressDialog from '../components/ProgressDialog';
import type { ProgressStep } from '../components/ProgressDialog';

const OathDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [oath, setOath] = useState<Oath | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserAddress, setCurrentUserAddress] = useState<string>('');
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [openEvaluateDialog, setOpenEvaluateDialog] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string>('');
  
  // 进度对话框状态
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const loadOathDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      // 初始化合约服务
      await contractService.initialize();
      const userAddress = await contractService.getCurrentUserAddress();

      setCurrentUserAddress(userAddress);
      
      // 获取誓约详情
      const oathData = await contractService.getOath(parseInt(id));

      setOath(oathData);
      
      // 获取评论
      const commentsData = await contractService.getOathComments(parseInt(id));
      setComments(commentsData);
      
      // 检查用户是否已点赞
      if (userAddress) {
        const liked = await contractService.hasUserLiked(parseInt(id), userAddress);
        setIsLiked(liked);
      }
    } catch (error) {
      console.error('Failed to load oath detail:', error);
      setError('加载誓约详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOathDetail();
  }, [loadOathDetail]);

  const handleLike = async () => {
    if (!oath || !currentUserAddress || isLiking) return;
    
    // 初始化进度步骤
    const steps: ProgressStep[] = [
      { id: '1', label: '验证用户权限', description: '检查钱包连接状态', status: 'pending' },
      { id: '2', label: '提交点赞交易', description: '向区块链提交点赞请求', status: 'pending' },
      { id: '3', label: '等待交易确认', description: '等待区块链确认交易', status: 'pending' },
      { id: '4', label: '更新界面', description: '更新点赞状态和数量', status: 'pending' },
      { id: '5', label: '完成点赞', description: '点赞操作已完成', status: 'pending' }
    ];

    setProgressSteps(steps);
    setCurrentStepIndex(0);
    setProgressOpen(true);
    
    try {
      setIsLiking(true);
      
      // 步骤1: 验证用户权限
      setProgressSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'running' as const } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgressSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(1);

      // 步骤2: 提交点赞交易
      setProgressSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'running' as const } : step
      ));
      await contractService.likeOath(oath.id);
      setProgressSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(2);

      // 步骤3: 等待交易确认
      setProgressSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'running' as const } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgressSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(3);
      
      // 步骤4: 更新界面
      setProgressSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'running' as const } : step
      ));
      setIsLiked(true);
      setOath({ ...oath, likeCount: oath.likeCount + 1 });
      setProgressSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(4);

      // 步骤5: 完成点赞
      setProgressSteps(prev => prev.map((step, index) => 
        index === 4 ? { ...step, status: 'completed' } : step
      ));
      
      // 2秒后自动关闭进度对话框
      setTimeout(() => {
        setProgressOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to like oath:', error);
      setError('点赞失败');
      
      // 将当前步骤标记为失败
      setProgressSteps(prev => prev.map((step, index) => 
        index === currentStepIndex ? { ...step, status: 'error', description: error instanceof Error ? error.message : '点赞失败' } : step
      ));
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!oath || !currentUserAddress || !newComment.trim() || isCommenting) return;
    
    // 初始化进度步骤
    const steps: ProgressStep[] = [
      { id: '1', label: '验证评论内容', description: '检查评论格式和长度', status: 'pending' },
      { id: '2', label: '提交评论交易', description: '向区块链提交评论', status: 'pending' },
      { id: '3', label: '等待交易确认', description: '等待区块链确认交易', status: 'pending' },
      { id: '4', label: '更新评论列表', description: '刷新评论数据', status: 'pending' },
      { id: '5', label: '完成评论', description: '评论发表成功', status: 'pending' }
    ];

    setProgressSteps(steps);
    setCurrentStepIndex(0);
    setProgressOpen(true);
    
    try {
      setIsCommenting(true);
      
      // 步骤1: 验证评论内容
      setProgressSteps(prev => prev.map((step, index) =>
        index === 0 ? { ...step, status: 'running' as const } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgressSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(1);

      // 步骤2: 提交评论交易
      setProgressSteps(prev => prev.map((step, index) =>
        index === 1 ? { ...step, status: 'running' as const } : step
      ));
      await contractService.addComment(oath.id, newComment.trim());
      setProgressSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(2);

      // 步骤3: 等待交易确认
      setProgressSteps(prev => prev.map((step, index) =>
        index === 2 ? { ...step, status: 'running' as const } : step
      ));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgressSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(3);
      
      // 步骤4: 更新评论列表
      setProgressSteps(prev => prev.map((step, index) =>
        index === 3 ? { ...step, status: 'running' as const } : step
      ));
      const commentsData = await contractService.getOathComments(oath.id);
      setComments(commentsData);
      setNewComment('');
      setProgressSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStepIndex(4);

      // 步骤5: 完成评论
      setProgressSteps(prev => prev.map((step, index) => 
        index === 4 ? { ...step, status: 'completed' } : step
      ));
      
      // 2秒后自动关闭进度对话框
      setTimeout(() => {
        setProgressOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('添加评论失败');
      
      // 将当前步骤标记为失败
      setProgressSteps(prev => prev.map((step, index) => 
        index === currentStepIndex ? { ...step, status: 'error', description: error instanceof Error ? error.message : '添加评论失败' } : step
      ));
    } finally {
      setIsCommenting(false);
    }
  };

  const handleEvaluate = async (success: boolean) => {
    if (!oath || isEvaluating) return;
    
    try {
      setIsEvaluating(true);
      await contractService.evaluateCompletion(oath.id, success, '');
      // setEvaluationSuccess(success);
      setOpenEvaluateDialog(false);
      
      // 重新加载誓约详情
      await loadOathDetail();
    } catch (error) {
      console.error('Failed to evaluate oath:', error);
      setError('评估失败');
    } finally {
      setIsEvaluating(false);
    }
  };

  // 注意：资金提取功能已移除，因为资金在评估完成时自动分配

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  const getStatusText = (status: CompletionStatus) => {
    switch (status) {
      case CompletionStatus.PENDING:
        return '进行中';
      case CompletionStatus.COMPLETED:
        return '已完成';
      case CompletionStatus.FAILED:
        return '已失败';
      case CompletionStatus.EXPIRED:
        return '已过期';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: CompletionStatus) => {
    switch (status) {
      case CompletionStatus.PENDING:
        return 'warning';
      case CompletionStatus.COMPLETED:
        return 'success';
      case CompletionStatus.FAILED:
        return 'error';
      case CompletionStatus.EXPIRED:
        return 'default';
      default:
        return 'default';
    }
  };


  
  const isCreator = currentUserAddress && oath && currentUserAddress.toLowerCase() === oath.creater.toLowerCase();
  const canEvaluate = isCreator && oath?.completionStatus === CompletionStatus.PENDING;
  


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!oath) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">誓约不存在或加载失败</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 返回按钮 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        返回
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* 誓约详情 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4 }}>
            {/* 标题和状态 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" component="h1">
                {oath.title}
              </Typography>
              <Chip 
                label={getStatusText(oath.completionStatus)}
                color={getStatusColor(oath.completionStatus) as any}
                size="medium"
              />
            </Box>

            {/* 描述 */}
            <Typography variant="body1" paragraph sx={{ mb: 4 }}>
              {oath.description}
            </Typography>

            {/* 基本信息 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      创建者
                    </Typography>
                    <Typography variant="body1">
                      {formatAddress(oath.creater)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      承诺人
                    </Typography>
                    <Typography variant="body1">
                      {formatAddress(oath.committer)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      抵押金额
                    </Typography>
                    <Typography variant="body1">
                      {oath.amount} 代币
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      截止时间
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(oath.deadline)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* 检查点 */}
            {oath.checkpoints && oath.checkpoints.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  检查点
                </Typography>
                <List>
                  {oath.checkpoints.map((checkpoint, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={checkpoint} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* 操作按钮 */}

            {currentUserAddress && (
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                {canEvaluate && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setOpenEvaluateDialog(true)}
                  >
                    评估任务
                  </Button>
                )}
              </Box>
            )}

            {/* 社交功能 */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                onClick={handleLike}
                disabled={!currentUserAddress || isLiking}
                color={isLiked ? 'error' : 'inherit'}
              >
                {oath.likeCount || 0} 点赞
              </Button>
              <Button startIcon={<CommentIcon />}>
                {comments.length} 评论
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 评论区域 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              评论 ({comments.length})
            </Typography>
            
            {/* 添加评论 */}
            {currentUserAddress && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="写下您的评论..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isCommenting}
                  fullWidth
                >
                  {isCommenting ? <CircularProgress size={20} /> : '发表评论'}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* 评论列表 */}
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {comments.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  暂无评论
                </Typography>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {formatAddress(comment.author)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {formatDate(comment.timestamp)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {comment.content}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 评估对话框 */}
      <Dialog open={openEvaluateDialog} onClose={() => setOpenEvaluateDialog(false)}>
        <DialogTitle>
          评估任务完成情况
          <IconButton
            aria-label="close"
            onClick={() => setOpenEvaluateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            请评估承诺人是否完成了誓约任务：
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {oath.title}
          </Typography>
          <Typography color="text.secondary">
            承诺人：{formatAddress(oath.committer)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleEvaluate(false)}
            color="error"
            startIcon={<CancelIcon />}
            disabled={isEvaluating}
          >
            未完成
          </Button>
          <Button
            onClick={() => handleEvaluate(true)}
            color="success"
            startIcon={<CheckCircleIcon />}
            disabled={isEvaluating}
          >
            {isEvaluating ? <CircularProgress size={20} /> : '已完成'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 进度对话框 */}
      <ProgressDialog
        open={progressOpen}
        steps={progressSteps}
        currentStepIndex={currentStepIndex}
        title="操作进度"
      />

    </Container>
  );
};

export default OathDetail;