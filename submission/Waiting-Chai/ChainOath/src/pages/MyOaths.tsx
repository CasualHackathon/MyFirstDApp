import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Typography,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { walletService } from "../services/walletService";
import { contractService, CompletionStatus } from "../services/contractService";
import type { Oath } from "../services/contractService";

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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const MyOaths: React.FC = () => {
  const navigator = useNavigate();

  // 钱包状态管理
  const [openConnectWalletWarn, setOpenConnectWalletWarn] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState("");
  const [currentUserAddress, setCurrentUserAddress] = React.useState<string>("");
  const pleaseConnectWallet = "请连接数字钱包";

  // 我的誓约状态
  const [myOathsTab, setMyOathsTab] = React.useState(0);
  const [myOaths, setMyOaths] = React.useState<{
    created: Oath[];
    committed: Oath[];
    liked: Oath[];
    commented: Oath[];
  }>({ created: [], committed: [], liked: [], commented: [] });
  const [myOathsLoading, setMyOathsLoading] = React.useState(false);

  const handleConnectWalletSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenConnectWalletWarn(false);
    setWarningMessage("");
  };

  // 初始化服务
  const initializeServices = async () => {
    try {
      await contractService.initialize();
    } catch (error) {
      console.error("合约服务初始化失败:", error);
    }
  };

  // 检查钱包连接状态
  const checkWalletConnection = async () => {
    try {
      if (walletService.isConnected()) {
        const address = await walletService.getCurrentAddress();
        if (address) {
          setCurrentUserAddress(address);
        }
      }
    } catch (error) {
      console.error("检查钱包连接状态失败:", error);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    try {
      await walletService.connect();
      const address = await walletService.getCurrentAddress();
      if (address) {
        setCurrentUserAddress(address);
        sessionStorage.setItem("currentUserAddr", address);
      }
      console.log("钱包连接成功");
    } catch (error) {
      console.error("钱包连接失败:", error);
      setWarningMessage(error instanceof Error ? error.message : pleaseConnectWallet);
      setOpenConnectWalletWarn(true);
    }
  };

  // 加载我的誓约
  const loadMyOaths = React.useCallback(async () => {
    if (!currentUserAddress) return;
    
    setMyOathsLoading(true);
    try {
      const relatedOaths = await contractService.getUserRelatedOaths(currentUserAddress);
      setMyOaths(relatedOaths);
    } catch (error) {
      console.error("加载我的誓约失败:", error);
    } finally {
      setMyOathsLoading(false);
    }
  }, [currentUserAddress]);

  React.useEffect(() => {
    initializeServices();
    checkWalletConnection();
  }, []);

  React.useEffect(() => {
    if (currentUserAddress) {
      loadMyOaths();
    }
  }, [currentUserAddress, loadMyOaths]);

  // 格式化时间
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
  };

  // 获取完成状态文本
  const getStatusText = (status: CompletionStatus) => {
    switch (status) {
      case CompletionStatus.PENDING: return "进行中";
      case CompletionStatus.COMPLETED: return "已完成";
      case CompletionStatus.FAILED: return "已失败";
      case CompletionStatus.EXPIRED: return "已过期";
      default: return "未知";
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: CompletionStatus) => {
    switch (status) {
      case CompletionStatus.PENDING: return "warning";
      case CompletionStatus.COMPLETED: return "success";
      case CompletionStatus.FAILED: return "error";
      case CompletionStatus.EXPIRED: return "default";
      default: return "default";
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Snackbar
        open={openConnectWalletWarn}
        autoHideDuration={6000}
        onClose={handleConnectWalletSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleConnectWalletSnackbarClose} severity="warning" variant="filled" sx={{ width: "100%" }}>
          {warningMessage}
        </Alert>
      </Snackbar>

      <Container maxWidth="lg">
        {/* 面包屑导航 */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigator('/');
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            首页
          </Link>
          <Typography color="text.primary">我的誓约</Typography>
        </Breadcrumbs>

        {/* 页面标题 */}
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          我的誓约
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          查看和管理您创建、承诺、点赞和评论的所有誓约
        </Typography>

        {/* 主要内容 */}
        {!currentUserAddress ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              请连接钱包查看您的誓约
            </Typography>
            <Button variant="contained" onClick={connectWallet} sx={{ mt: 2 }}>
              连接钱包
            </Button>
          </Box>
        ) : (
          <Box>
            <Tabs value={myOathsTab} onChange={(_, newValue) => setMyOathsTab(newValue)} sx={{ mb: 3 }}>
              <Tab label={`创建的 (${myOaths.created.length})`} />
              <Tab label={`承诺的 (${myOaths.committed.length})`} />
              <Tab label={`点赞的 (${myOaths.liked.length})`} />
              <Tab label={`评论的 (${myOaths.commented.length})`} />
            </Tabs>
            
            {myOathsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <TabPanel value={myOathsTab} index={0}>
                  {myOaths.created.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        您还没有创建任何誓约
                      </Typography>
                    </Box>
                  ) : (
                    myOaths.created.map((oath) => (
                      <Card key={oath.id} sx={{ mb: 2, cursor: 'pointer' }} 
                            onClick={() => navigator(`/oath/${oath.id}`)}>
                        <CardContent>
                          <Typography variant="h6" noWrap>{oath.title}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {oath.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Chip 
                              label={getStatusText(oath.status)} 
                              color={getStatusColor(oath.status) as any}
                              size="small" 
                            />
                            <Typography variant="caption" sx={{ ml: 2 }}>
                              {formatDate(oath.deadline)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabPanel>
                
                <TabPanel value={myOathsTab} index={1}>
                  {myOaths.committed.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        您还没有承诺任何誓约
                      </Typography>
                    </Box>
                  ) : (
                    myOaths.committed.map((oath) => (
                      <Card key={oath.id} sx={{ mb: 2, cursor: 'pointer' }} 
                            onClick={() => navigator(`/oath/${oath.id}`)}>
                        <CardContent>
                          <Typography variant="h6" noWrap>{oath.title}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {oath.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Chip 
                              label={getStatusText(oath.status)} 
                              color={getStatusColor(oath.status) as any}
                              size="small" 
                            />
                            <Typography variant="caption" sx={{ ml: 2 }}>
                              {formatDate(oath.deadline)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabPanel>
                
                <TabPanel value={myOathsTab} index={2}>
                  {myOaths.liked.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        您还没有点赞任何誓约
                      </Typography>
                    </Box>
                  ) : (
                    myOaths.liked.map((oath) => (
                      <Card key={oath.id} sx={{ mb: 2, cursor: 'pointer' }} 
                            onClick={() => navigator(`/oath/${oath.id}`)}>
                        <CardContent>
                          <Typography variant="h6" noWrap>{oath.title}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {oath.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Chip 
                              label={getStatusText(oath.status)} 
                              color={getStatusColor(oath.status) as any}
                              size="small" 
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                              <FavoriteIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption">{oath.likeCount || 0}</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabPanel>
                
                <TabPanel value={myOathsTab} index={3}>
                  {myOaths.commented.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        您还没有评论任何誓约
                      </Typography>
                    </Box>
                  ) : (
                    myOaths.commented.map((oath) => (
                      <Card key={oath.id} sx={{ mb: 2, cursor: 'pointer' }} 
                            onClick={() => navigator(`/oath/${oath.id}`)}>
                        <CardContent>
                          <Typography variant="h6" noWrap>{oath.title}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {oath.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Chip 
                              label={getStatusText(oath.status)} 
                              color={getStatusColor(oath.status) as any}
                              size="small" 
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                              <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption">已评论</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabPanel>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MyOaths;