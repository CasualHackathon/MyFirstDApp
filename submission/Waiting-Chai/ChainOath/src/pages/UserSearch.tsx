import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as EmojiEventsIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { contractService, CompletionStatus } from '../services/contractService';
import type { Oath, UserStats, Achievement } from '../services/contractService';
import { ACHIEVEMENT_CONFIG, AchievementType } from '../types/nft';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserSearch: React.FC = () => {
  const navigate = useNavigate();
  
  // 搜索类型状态
  const [searchType, setSearchType] = React.useState<'user' | 'oath'>('user');
  
  // 搜索状态
  const [searchAddress, setSearchAddress] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  
  // 用户数据状态
  const [userStats, setUserStats] = React.useState<UserStats | null>(null);
  const [userOaths, setUserOaths] = React.useState<Oath[]>([]);
  const [userAchievements, setUserAchievements] = React.useState<Achievement[]>([]);
  const [currentUser, setCurrentUser] = React.useState<string>('');
  
  // 誓约搜索结果状态
  const [oathSearchResults, setOathSearchResults] = React.useState<Oath[]>([]);
  
  // 搜索历史
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  
  // Tab状态
  const [tabValue, setTabValue] = React.useState(0);
  
  // 加载搜索历史
  React.useEffect(() => {
    const history = localStorage.getItem('userSearchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);
  
  // 保存搜索历史
  const saveSearchHistory = (address: string) => {
    const newHistory = [address, ...searchHistory.filter(addr => addr !== address)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('userSearchHistory', JSON.stringify(newHistory));
  };
  
  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('userSearchHistory');
  };
  
  // 验证地址格式
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  // 搜索用户
  const handleUserSearch = async () => {
    if (!searchAddress.trim()) {
      setSearchError('请输入钱包地址');
      return;
    }
    
    if (!isValidAddress(searchAddress.trim())) {
      setSearchError('请输入有效的钱包地址格式');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const address = searchAddress.trim();
      
      // 获取用户统计数据
      const stats = await contractService.getUserStats(address);
      setUserStats(stats);
      
      // 获取用户誓约
      const userRelatedOaths = await contractService.getUserRelatedOaths(address);
      // 合并所有相关誓约
      const allOaths = [
        ...userRelatedOaths.created,
        ...userRelatedOaths.committed
      ];
      // 去重
      const uniqueOaths = allOaths.filter((oath, index, self) => 
        index === self.findIndex(o => o.id === oath.id)
      );
      setUserOaths(uniqueOaths);
      
      // 获取用户成就
      const achievements = await contractService.checkMyAchievements(address);
      // 将成就对象转换为数组格式
      const achievementArray = Object.entries(achievements).map(([type, data]) => ({
        tokenId: 0, // 临时值
        achievementType: parseInt(type) as AchievementType,
        name: data.info.name,
        description: data.info.description,
        imageURI: '',
        mintedAt: 0,
        rarity: data.info.rarity,
        hasAchievement: data.hasAchievement
      }));
      setUserAchievements(achievementArray);
      
      setCurrentUser(address);
      saveSearchHistory(address);
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError(error instanceof Error ? error.message : '搜索失败，请重试');
    } finally {
      setIsSearching(false);
    }
  };
  
  // 搜索誓约
  const handleOathSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('请输入搜索关键词');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const query = searchQuery.trim().toLowerCase();
      
      // 获取所有誓约（分批获取以避免一次性加载过多数据）
      const allOathIds: number[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 10) { // 限制最多10页，避免无限循环
        const result = await contractService.getAllOaths(page, 50);
        allOathIds.push(...result.items);
        hasMore = result.hasMore;
        page++;
      }
      
      // 获取所有誓约详情并进行标题匹配
      const matchingOaths: Oath[] = [];
      
      for (const oathId of allOathIds) {
        try {
          const oath = await contractService.getOath(oathId);
          if (oath.title.toLowerCase().includes(query)) {
            matchingOaths.push(oath);
          }
        } catch (error) {
          console.warn(`Failed to get oath ${oathId}:`, error);
          // 继续处理其他誓约
        }
      }
      
      setOathSearchResults(matchingOaths);
      
      if (matchingOaths.length === 0) {
        setSearchError('未找到匹配的誓约');
      }
      
    } catch (error) {
      console.error('Oath search failed:', error);
      setSearchError(error instanceof Error ? error.message : '搜索失败，请重试');
    } finally {
      setIsSearching(false);
    }
  };
  
  // 统一搜索处理
  const handleSearch = async () => {
    if (searchType === 'user') {
      await handleUserSearch();
    } else {
      await handleOathSearch();
    }
  };
  
  // 处理Tab切换
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // 格式化时间
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
  };
  
  // 获取状态文本
  const getStatusText = (status: CompletionStatus) => {
    switch (status) {
      case CompletionStatus.PENDING: return '进行中';
      case CompletionStatus.COMPLETED: return '已完成';
      case CompletionStatus.FAILED: return '已失败';
      case CompletionStatus.EXPIRED: return '已过期';
      default: return '未知';
    }
  };
  
  // 获取状态颜色
  const getStatusColor = (status: CompletionStatus) => {
    switch (status) {
      case CompletionStatus.PENDING: return 'warning';
      case CompletionStatus.COMPLETED: return 'success';
      case CompletionStatus.FAILED: return 'error';
      case CompletionStatus.EXPIRED: return 'default';
      default: return 'default';
    }
  };
  
  // 过滤誓约
  const getFilteredOaths = (status: CompletionStatus) => {
    return userOaths.filter(oath => oath.status === status);
  };
  
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            用户搜索
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 搜索区域 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ mr: 1 }} />
            {searchType === 'user' ? '搜索用户' : '搜索誓约'}
          </Typography>
          
          {/* 搜索类型选择器 */}
          <Box sx={{ mb: 2 }}>
            <Tabs value={searchType} onChange={(_, newValue) => {
              setSearchType(newValue);
              setSearchError(null);
              // 清空搜索结果
              if (newValue === 'user') {
                setOathSearchResults([]);
              } else {
                setUserStats(null);
                setUserOaths([]);
                setUserAchievements([]);
                setCurrentUser('');
              }
            }}>
              <Tab label="用户搜索" value="user" />
              <Tab label="誓约搜索" value="oath" />
            </Tabs>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {searchType === 'user' ? (
              <TextField
                fullWidth
                label="钱包地址"
                placeholder="输入用户的钱包地址 (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                error={!!searchError}
                helperText={searchError}
              />
            ) : (
              <TextField
                fullWidth
                label="誓约标题"
                placeholder="输入誓约标题关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                error={!!searchError}
                helperText={searchError}
              />
            )}
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isSearching}
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 120 }}
            >
              {isSearching ? '搜索中' : '搜索'}
            </Button>
          </Box>
          
          {/* 搜索历史 */}
          {searchHistory.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  搜索历史
                </Typography>
                <Button
                  size="small"
                  onClick={clearSearchHistory}
                  startIcon={<ClearIcon />}
                >
                  清除
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchHistory.map((addr, index) => (
                  <Chip
                    key={index}
                    label={formatAddress(addr)}
                    size="small"
                    onClick={() => {
                      setSearchAddress(addr);
                      handleSearch();
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
        
        {/* 誓约搜索结果展示 */}
        {searchType === 'oath' && oathSearchResults.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ mr: 1 }} />
              搜索结果 ({oathSearchResults.length})
            </Typography>
            <Grid container spacing={3}>
              {oathSearchResults.map((oath) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={oath.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => navigate(`/oath/${oath.id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {oath.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {oath.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={getStatusText(oath.status)} 
                          color={getStatusColor(oath.status) as any} 
                          size="small" 
                        />
                        <Typography variant="caption" color="text.secondary">
                          截止: {formatDate(oath.deadline)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          创建者: {formatAddress(oath.creater)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          质押: {parseFloat(oath.amount) / 1e18} ETH
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* 誓约搜索空状态 */}
        {searchType === 'oath' && !isSearching && oathSearchResults.length === 0 && searchQuery && (
          <Paper sx={{ p: 6, textAlign: 'center', mb: 3 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              未找到相关誓约
            </Typography>
            <Typography variant="body2" color="text.secondary">
              尝试使用其他关键词搜索
            </Typography>
          </Paper>
        )}

        {/* 用户信息展示 */}
        {currentUser && searchType === 'user' && (
          <>
            {/* 用户基本信息 */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                用户信息
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{formatAddress(currentUser)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        钱包地址
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Grid container spacing={2}>
                    <Grid size={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4" color="primary">
                            {userStats?.totalOaths || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            总誓约数
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4" color="success.main">
                            {userStats?.completedOaths || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            已完成
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={4}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4" color="error.main">
                            {userStats?.totalUpvotes || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            获赞数
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
            
            {/* 详细信息Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label={`誓约列表 (${userOaths.length})`} />
                  <Tab label={`成就墙 (${userAchievements.length})`} />
                </Tabs>
              </Box>
              
              {/* 誓约列表Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  {/* 已完成的誓约 */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      已完成 ({getFilteredOaths(CompletionStatus.COMPLETED).length})
                    </Typography>
                    <List>
                      {getFilteredOaths(CompletionStatus.COMPLETED).map((oath) => (
                        <ListItem key={oath.id} sx={{ px: 0 }}>
                          <Card sx={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(`/oath/${oath.id}`)}>
                            <CardContent>
                              <Typography variant="subtitle1" noWrap>
                                {oath.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {oath.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Chip label={getStatusText(oath.status)} color={getStatusColor(oath.status) as any} size="small" />
                                <Typography variant="caption">
                                  {formatDate(oath.deadline)}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </ListItem>
                      ))}
                      {getFilteredOaths(CompletionStatus.COMPLETED).length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          暂无已完成的誓约
                        </Typography>
                      )}
                    </List>
                  </Grid>
                  
                  {/* 进行中的誓约 */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                      <ScheduleIcon sx={{ mr: 1 }} />
                      进行中 ({getFilteredOaths(CompletionStatus.PENDING).length})
                    </Typography>
                    <List>
                      {getFilteredOaths(CompletionStatus.PENDING).map((oath) => (
                        <ListItem key={oath.id} sx={{ px: 0 }}>
                          <Card sx={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(`/oath/${oath.id}`)}>
                            <CardContent>
                              <Typography variant="subtitle1" noWrap>
                                {oath.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {oath.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Chip label={getStatusText(oath.status)} color={getStatusColor(oath.status) as any} size="small" />
                                <Typography variant="caption">
                                  {formatDate(oath.deadline)}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </ListItem>
                      ))}
                      {getFilteredOaths(CompletionStatus.PENDING).length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          暂无进行中的誓约
                        </Typography>
                      )}
                    </List>
                  </Grid>
                  
                  {/* 已失败的誓约 */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                      <CancelIcon sx={{ mr: 1 }} />
                      已失败 ({getFilteredOaths(CompletionStatus.FAILED).length + getFilteredOaths(CompletionStatus.EXPIRED).length})
                    </Typography>
                    <List>
                      {[...getFilteredOaths(CompletionStatus.FAILED), ...getFilteredOaths(CompletionStatus.EXPIRED)].map((oath) => (
                        <ListItem key={oath.id} sx={{ px: 0 }}>
                          <Card sx={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(`/oath/${oath.id}`)}>
                            <CardContent>
                              <Typography variant="subtitle1" noWrap>
                                {oath.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {oath.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Chip label={getStatusText(oath.status)} color={getStatusColor(oath.status) as any} size="small" />
                                <Typography variant="caption">
                                  {formatDate(oath.deadline)}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </ListItem>
                      ))}
                      {(getFilteredOaths(CompletionStatus.FAILED).length + getFilteredOaths(CompletionStatus.EXPIRED).length) === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          暂无失败的誓约
                        </Typography>
                      )}
                    </List>
                  </Grid>
                </Grid>
              </TabPanel>
              
              {/* 成就墙Tab */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmojiEventsIcon sx={{ mr: 1 }} />
                  成就墙
                </Typography>
                
                {userAchievements.length > 0 ? (
                  <Grid container spacing={3}>
                    {Object.entries(ACHIEVEMENT_CONFIG).map(([type, config]) => {
                      const achievementType = parseInt(type) as AchievementType;
                      const userAchievement = userAchievements.find(a => a.achievementType === achievementType);
                      const isOwned = !!userAchievement;
                      
                      // 根据成就类型计算实际进度
                      let progress = 0;
                      if (userStats) {
                        switch (achievementType) {
                          case AchievementType.FIRST_OATH: // 首次誓约 - 创建誓约数量
                            progress = userStats.totalOaths;
                            break;
                          case AchievementType.OATH_KEEPER: // 守约达人 - 完成誓约数量
                            progress = userStats.completedOaths;
                            break;
                          case AchievementType.TRUSTED_CREATOR: // 信任创建者 - 获得点赞数
                            progress = userStats.totalUpvotes;
                            break;
                          case AchievementType.COMMUNITY_STAR: // 社区之星 - 获得点赞数
                            progress = userStats.totalUpvotes;
                            break;
                          case AchievementType.MILESTONE_MASTER: // 里程碑大师 - 创建誓约数量
                            progress = userStats.totalOaths;
                            break;
                          case AchievementType.EARLY_ADOPTER: // 早期采用者 - 创建誓约数量
                            progress = userStats.totalOaths;
                            break;
                          default:
                            progress = 0;
                        }
                      }
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievementType}>
                          <Card 
                            sx={{ 
                              opacity: isOwned ? 1 : 0.5,
                              border: isOwned ? '2px solid' : '1px solid',
                              borderColor: isOwned ? 'primary.main' : 'divider'
                            }}
                          >
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Avatar
                                sx={{ 
                                  width: 64, 
                                  height: 64, 
                                  mx: 'auto', 
                                  mb: 2,
                                  bgcolor: isOwned ? 'primary.main' : 'grey.300'
                                }}
                              >
                                <EmojiEventsIcon sx={{ fontSize: 32 }} />
                              </Avatar>
                              <Typography variant="h6" gutterBottom>
                                {config.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {config.description}
                              </Typography>
                              <Chip 
                                label={isOwned ? '已获得' : '未获得'}
                                color={isOwned ? 'success' : 'default'}
                                size="small"
                              />
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                进度: {progress}/{config.threshold}
                              </Typography>
                              {isOwned && (
                                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                                  ✓ 已解锁
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    暂无成就数据
                  </Typography>
                )}
              </TabPanel>
            </Paper>
          </>
        )}
        
        {/* 空状态 */}
        {!currentUser && !isSearching && oathSearchResults.length === 0 && !searchQuery && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              {searchType === 'user' ? '搜索用户' : '搜索誓约'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchType === 'user' 
                ? '输入钱包地址来查看用户的誓约情况和成就'
                : '输入誓约标题关键词来搜索相关誓约'
              }
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default UserSearch;