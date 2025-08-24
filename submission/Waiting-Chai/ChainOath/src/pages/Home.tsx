import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  Fab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Link as LinkIcon,
  List as ListIcon,
  Wallet as WalletIcon,
  GitHub as GitHubIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { walletService } from "../services/walletService";
import { contractService, CompletionStatus } from "../services/contractService";
import type { Oath } from "../services/contractService";
import { TOKEN_OPTIONS } from "../contracts/config";
import ProgressDialog from '../components/ProgressDialog';
import type { ProgressStep } from '../components/ProgressDialog';



const Home: React.FC = () => {
  const navigator = useNavigate();

  // 钱包状态管理
  const [openConnectWalletWarn, setOpenConnectWalletWarn] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState("");
  const [currentUserAddress, setCurrentUserAddress] = React.useState<string>("");
  const [isContractServiceInitialized, setIsContractServiceInitialized] = React.useState(false);

  const [loadingError, setLoadingError] = React.useState<string | null>(null);
  const pleaseConnectWallet = "请连接数字钱包";

  // 创建誓约对话框状态
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    title: "",
    description: "",
    committer: "",
    tokenAddress: "",
    amount: "",
    deadline: "",
    checkpoints: [""],
  });
  const [isCreating, setIsCreating] = React.useState(false);

  // 进度对话框状态
  const [progressOpen, setProgressOpen] = React.useState(false);
  const [progressSteps, setProgressSteps] = React.useState<ProgressStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  // 移除我的誓约状态管理，已迁移到MyOaths页面

  // 展示窗状态
  const [allOaths, setAllOaths] = React.useState<Oath[]>([]);
  const [currentOathIndex, setCurrentOathIndex] = React.useState(0);
  const [oathsLoading, setOathsLoading] = React.useState(false);
  const [oathsPage, setOathsPage] = React.useState(1);
  
  // 评论数量状态
  const [oathCommentCounts, setOathCommentCounts] = React.useState<{[key: string]: number}>({});

  // 点赞排行榜状态
  const [topOaths, setTopOaths] = React.useState<Oath[]>([]);
  const [topOathsLoading, setTopOathsLoading] = React.useState(false);

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

  // 加载需要钱包连接的私有数据
  const loadPrivateData = React.useCallback(async () => {
    console.log("[Home] 开始加载私有数据");
    console.log("[Home] 当前合约服务初始化状态:", isContractServiceInitialized);
    console.log("[Home] 钱包连接状态:", walletService.isConnected());
    
    // 检查钱包连接状态而不是依赖状态变量
    if (!walletService.isConnected()) {
      console.log("[Home] 钱包未连接，跳过私有数据加载");
      return;
    }
    
    try {
      await Promise.all([
        loadAllOaths(),
        loadTopOaths(),
      ]);
      console.log("[Home] 私有数据加载完成");
    } catch (error) {
      console.error("[Home] 私有数据加载失败:", error);
      // 如果加载失败，可能是合约服务未初始化，尝试重新初始化
      if (error instanceof Error && error.message.includes('Contract service not initialized')) {
        console.log("[Home] 检测到合约服务未初始化，尝试重新初始化");
        try {
          await initializeServices();
          // 重新尝试加载数据
          await Promise.all([
            loadAllOaths(),
            loadTopOaths(),
          ]);
          console.log("[Home] 重新初始化后私有数据加载完成");
        } catch (retryError) {
          console.error("[Home] 重新初始化后仍然失败:", retryError);
        }
      }
    }
  }, [isContractServiceInitialized]);

  // 检查钱包连接状态
  const checkWalletConnection = React.useCallback(async () => {
    console.log("[Home] 检查钱包连接状态");
    try {
      if (walletService.isConnected()) {
        console.log("[Home] 钱包已连接，获取地址");
        const address = await walletService.getCurrentAddress();
        if (address) {
          console.log("[Home] 获取到钱包地址:", address);
          setCurrentUserAddress(address);
          sessionStorage.setItem("currentUserAddr", address);
          // 钱包连接成功后初始化合约服务
        await initializeServices();
        // 初始化完成后加载私有数据
        console.log("[Home] 合约服务初始化完成，开始加载私有数据");
        await loadPrivateData();
        }
      } else {
        console.log("[Home] 钱包未连接");
      }
    } catch (error) {
      console.error("[Home] 检查钱包连接失败:", error);
    }
  }, [loadPrivateData]);

  React.useEffect(() => {
    console.log("[Home] 组件初始化开始");
    checkWalletConnection();
    // 只加载不需要钱包连接的公共数据
    loadPublicData();
  }, [checkWalletConnection]);

  // 移除我的誓约相关的useEffect，已迁移到MyOaths页面

  // 初始化服务
  const initializeServices = async () => {
    console.log("[Home] 开始初始化合约服务");
    try {
      if (!walletService.isConnected()) {
        console.log("[Home] 钱包未连接，跳过合约服务初始化");
        return;
      }
      
      console.log("[Home] 调用contractService.initialize()");
      await contractService.initialize();
      setIsContractServiceInitialized(true);
      console.log("[Home] 合约服务初始化成功");
    } catch (error) {
      console.error("[Home] 合约服务初始化失败:", error);
      setIsContractServiceInitialized(false);
    }
  };

  // 加载公共数据（不需要钱包连接）
  const loadPublicData = async () => {
    console.log("[Home] 开始加载公共数据");
    // 目前所有数据都需要合约服务，所以这里暂时不加载任何数据
    // 等钱包连接后再加载
    console.log("[Home] 公共数据加载完成（暂无公共数据）");
  };

  // 连接钱包
  const connectWallet = async () => {
    console.log("[Home] 开始连接钱包");
    try {
      console.log("[Home] 调用walletService.connect()");
      await walletService.connect();
      
      console.log("[Home] 获取钱包地址");
      const address = await walletService.getCurrentAddress();
      if (address) {
        console.log("[Home] 钱包地址获取成功:", address);
        setCurrentUserAddress(address);
        sessionStorage.setItem("currentUserAddr", address);
        
        // 钱包连接成功后初始化合约服务
        console.log("[Home] 钱包连接成功，开始初始化合约服务");
        await initializeServices();
        // 初始化完成后加载私有数据
        console.log("[Home] 合约服务初始化完成，开始加载私有数据");
        await loadPrivateData();
      }
      console.log("[Home] 钱包连接完成");
    } catch (error) {
      console.error("[Home] 钱包连接失败:", error);
      setWarningMessage(error instanceof Error ? error.message : pleaseConnectWallet);
      setOpenConnectWalletWarn(true);
    }
  };

  // 检查钱包是否已连接
  const checkWalletConnected = (): boolean => {
    return walletService.isConnected();
  };

  // 点击创建誓约
  const handleClickCreate = async (): Promise<void> => {
    if (!checkWalletConnected()) {
      setWarningMessage(pleaseConnectWallet);
      setOpenConnectWalletWarn(true);
      await connectWallet();
    } else {
      setOpenCreateDialog(true);
    }
  };

  // 创建誓约表单处理
  const handleCreateFormChange = (field: string, value: string) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckpointChange = (index: number, value: string) => {
    const newCheckpoints = [...createForm.checkpoints];
    newCheckpoints[index] = value;
    setCreateForm(prev => ({ ...prev, checkpoints: newCheckpoints }));
  };

  const addCheckpoint = () => {
    setCreateForm(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, ""]
    }));
  };

  const removeCheckpoint = (index: number) => {
    if (createForm.checkpoints.length > 1) {
      const newCheckpoints = createForm.checkpoints.filter((_, i) => i !== index);
      setCreateForm(prev => ({ ...prev, checkpoints: newCheckpoints }));
    }
  };

  const handleCreateOath = async () => {
    console.log("[Home] 开始创建誓约");
    console.log("[Home] 当前用户地址:", currentUserAddress);
    console.log("[Home] 合约服务初始化状态:", isContractServiceInitialized);
    console.log("[Home] 创建表单数据:", createForm);
    
    if (!currentUserAddress) {
      console.log("[Home] 用户地址为空，需要连接钱包");
      setWarningMessage("请先连接钱包");
      setOpenConnectWalletWarn(true);
      return;
    }

    if (!isContractServiceInitialized) {
      console.log("[Home] 合约服务未初始化，尝试重新初始化");
      try {
        await initializeServices();
        if (!isContractServiceInitialized) {
          console.error("[Home] 合约服务初始化失败");
          setWarningMessage("合约服务初始化失败，请重试");
          setOpenConnectWalletWarn(true);
          return;
        }
      } catch (error) {
        console.error("[Home] 重新初始化合约服务失败:", error);
        setWarningMessage("合约服务初始化失败，请重试");
        setOpenConnectWalletWarn(true);
        return;
      }
    }

    // 初始化进度步骤
    const steps: ProgressStep[] = [
      { id: '1', label: '验证表单数据', description: '检查输入的誓约信息是否完整', status: 'pending' },
      { id: '2', label: '初始化合约服务', description: '连接区块链网络和智能合约', status: 'pending' },
      { id: '3', label: '处理代币转换', description: '如需要，将ETH转换为WETH', status: 'pending' },
      { id: '4', label: '创建链上誓约', description: '在区块链上记录誓约信息', status: 'pending' },
      { id: '5', label: '完成创建', description: '誓约创建成功，跳转到详情页', status: 'pending' }
    ];
    
    setProgressSteps(steps);
    setCurrentStepIndex(0);
    setProgressOpen(true);
    setIsCreating(true);
    
    try {
      // 步骤1: 验证表单数据
      setProgressSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'running' as const } : step
      ));
      setCurrentStepIndex(0);
      
      console.log("[Home] 处理表单数据");
      const deadlineTimestamp = Math.floor(new Date(createForm.deadline).getTime() / 1000);
      const filteredCheckpoints = createForm.checkpoints.filter(cp => cp.trim() !== "");
      
      console.log("[Home] 处理后的数据:");
      console.log("  - 标题:", createForm.title);
      console.log("  - 描述:", createForm.description);
      console.log("  - 承诺者:", createForm.committer);
      console.log("  - 代币地址:", createForm.tokenAddress);
      console.log("  - 金额:", createForm.amount);
      console.log("  - 截止时间戳:", deadlineTimestamp);
      console.log("  - 检查点:", filteredCheckpoints);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟处理时间
      
      setProgressSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));
      
      // 步骤2: 初始化合约服务
      setProgressSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'running' as const } : step
      ));
      setCurrentStepIndex(1);
      
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟处理时间
      
      setProgressSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));
      
      // 步骤3: 处理代币转换
      setProgressSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'running' as const } : step
      ));
      setCurrentStepIndex(2);
      
      // 检查是否选择了WETH代币，如果是则显示转换提示
      const selectedToken = TOKEN_OPTIONS.find(token => token.address === createForm.tokenAddress);
      if (selectedToken?.symbol === 'WETH') {
        console.log("[Home] 检测到WETH代币，将自动处理ETH到WETH转换");
        setProgressSteps(prev => prev.map((step, index) => 
          index === 2 ? { ...step, description: '正在将ETH转换为WETH，请在钱包中确认交易...' } : step
        ));
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟转换时间
      } else {
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟处理时间
      }
      
      setProgressSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
      ));
      
      // 步骤4: 创建链上誓约
      setProgressSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'running' as const } : step
      ));
      setCurrentStepIndex(3);
      
      console.log("[Home] 调用contractService.createOath");
      const oathId = await contractService.createOath(
        createForm.title,
        createForm.description,
        createForm.committer,
        createForm.tokenAddress,
        createForm.amount,
        deadlineTimestamp,
        filteredCheckpoints
      );

      setProgressSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'completed' } : step
      ));
      
      // 步骤5: 完成创建
      setProgressSteps(prev => prev.map((step, index) => 
        index === 4 ? { ...step, status: 'running' as const } : step
      ));
      setCurrentStepIndex(4);
      
      console.log("[Home] 誓约创建成功，ID:", oathId);
      setOpenCreateDialog(false);
      setCreateForm({
        title: "",
        description: "",
        committer: "",
        tokenAddress: "",
        amount: "",
        deadline: "",
        checkpoints: [""]
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 让用户看到完成状态
      
      setProgressSteps(prev => prev.map((step, index) => 
        index === 4 ? { ...step, status: 'completed' } : step
      ));
      
      // 延迟关闭进度对话框并跳转
      setTimeout(() => {
        setProgressOpen(false);
        console.log("[Home] 跳转到誓约详情页:", `/oath/${oathId}`);
        navigator(`/oath/${oathId}`);
      }, 1500);
      
    } catch (error) {
      console.error("[Home] 创建誓约失败:", error);
      console.error("[Home] 错误详情:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // 标记当前步骤为失败
      setProgressSteps(prev => prev.map((step, index) => 
        index === currentStepIndex ? { ...step, status: 'error', description: error instanceof Error ? error.message : "操作失败" } : step
      ));
      
      setWarningMessage(error instanceof Error ? error.message : "创建誓约失败");
      setOpenConnectWalletWarn(true);
    } finally {
      setIsCreating(false);
      console.log("[Home] 创建誓约流程结束");
    }
  };


  // 加载所有誓约
  const loadAllOaths = async (page: number = 1) => {
    console.log('[Home] 开始加载所有誓约, page:', page);
    setOathsLoading(true);
    setLoadingError(null);
    
    try {
      console.log('[Home] 调用contractService.getAllOaths(page, 10)');
      const result = await contractService.getAllOaths(page, 10);
      console.log('[Home] 获取到誓约ID列表:', result);
      const oaths = await Promise.all(
        result.items.map(id => contractService.getOath(id))
      );
      console.log('[Home] 获取到誓约详细数据:', oaths);
      
      // 获取每个誓约的评论数量
      console.log('[Home] 开始获取评论数量');
      const commentCounts: {[key: string]: number} = {};
      await Promise.all(
        oaths.map(async (oath) => {
          try {
            const comments = await contractService.getOathComments(oath.id);
            commentCounts[oath.id.toString()] = comments.length;
          } catch (error) {
            console.error(`[Home] 获取誓约${oath.id}评论数量失败:`, error);
            commentCounts[oath.id.toString()] = 0;
          }
        })
      );
      console.log('[Home] 评论数量获取完成:', commentCounts);
      setOathCommentCounts(commentCounts);
      
      setAllOaths(oaths);
      setOathsPage(page);
      console.log('[Home] 所有誓约加载成功，数量:', oaths.length);
    } catch (error) {
      console.error('[Home] 加载誓约失败:', error);
      console.error('[Home] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      const errorMessage = error instanceof Error ? error.message : '加载誓约失败';
      setLoadingError(errorMessage);
      throw error; // 重新抛出错误以便上层处理
    } finally {
      setOathsLoading(false);
    }
  };

  // 加载点赞排行榜
  const loadTopOaths = async () => {
    console.log('[Home] 开始加载点赞排行榜');
    setTopOathsLoading(true);
    setLoadingError(null);
    
    try {
      console.log('[Home] 调用contractService.getTopLikedOaths(5)');
      const topOaths = await contractService.getTopLikedOaths(5);
      console.log('[Home] 获取到排行榜数据:', topOaths);
      setTopOaths(topOaths);
      console.log('[Home] 点赞排行榜加载成功，数量:', topOaths.length);
    } catch (error) {
      console.error('[Home] 加载排行榜失败:', error);
      console.error('[Home] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      const errorMessage = error instanceof Error ? error.message : '加载热门誓约失败';
      setLoadingError(errorMessage);
      throw error; // 重新抛出错误以便上层处理
    } finally {
      setTopOathsLoading(false);
    }
  };

  // 点赞誓约
  const handleLikeOath = async (oathId: number) => {
    console.log('[Home] 开始点赞誓约, oathId:', oathId);
    console.log('[Home] 当前用户地址:', currentUserAddress);
    
    if (!currentUserAddress) {
      console.log('[Home] 用户地址为空，显示错误提示');
      setWarningMessage("请先连接钱包");
      setOpenConnectWalletWarn(true);
      return;
    }

    // 初始化进度步骤
    const steps: ProgressStep[] = [
      { id: '1', label: '验证用户权限', description: '检查钱包连接状态', status: 'pending' },
      { id: '2', label: '提交点赞交易', description: '向区块链提交点赞请求', status: 'pending' },
      { id: '3', label: '等待交易确认', description: '等待区块链确认交易', status: 'pending' },
      { id: '4', label: '更新数据', description: '刷新页面数据', status: 'pending' },
      { id: '5', label: '完成点赞', description: '点赞操作已完成', status: 'pending' }
    ];

    setProgressSteps(steps);
    setCurrentStepIndex(0);
    setProgressOpen(true);

    try {
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
      console.log('[Home] 调用contractService.likeOath()', oathId);
      await contractService.likeOath(oathId);
      console.log('[Home] 点赞成功');
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
      
      // 步骤4: 更新数据
      setProgressSteps(prev => prev.map((step, index) =>
        index === 3 ? { ...step, status: 'running' as const } : step
      ));
      console.log('[Home] 重新加载数据');
      await Promise.all([
        loadAllOaths(oathsPage),
        loadTopOaths()
      ]);
      console.log('[Home] 数据重新加载完成');
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
      console.error('[Home] 点赞失败:', error);
      console.error('[Home] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // 将当前步骤标记为失败
      setProgressSteps(prev => prev.map((step, index) => 
        index === currentStepIndex ? { ...step, status: 'error', description: error instanceof Error ? error.message : '点赞失败' } : step
      ));
      
      setWarningMessage(error instanceof Error ? error.message : "点赞失败");
      setOpenConnectWalletWarn(true);
    }
  };

  // 展示窗导航
  const handlePrevOath = () => {
    setCurrentOathIndex(prev => 
      prev > 0 ? prev - 1 : allOaths.length - 1
    );
  };

  const handleNextOath = () => {
    setCurrentOathIndex(prev => 
      prev < allOaths.length - 1 ? prev + 1 : 0
    );
  };

  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Snackbar
        open={openConnectWalletWarn}
        autoHideDuration={8000}
        onClose={handleConnectWalletSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={handleConnectWalletSnackbarClose} 
          severity={warningMessage.includes('余额不足') ? 'error' : 'warning'} 
          variant="filled" 
          sx={{ 
            width: "100%",
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          {warningMessage}
        </Alert>
      </Snackbar>
      {/* Header */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1.5,
              }}
            >
              <LinkIcon sx={{ color: "white" }} />
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(90deg, #4F46E5, #6366F1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ChainOath
            </Typography>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            <Button color="inherit" sx={{ mx: 1 }} component={RouterLink} to="/search" startIcon={<SearchIcon />}>
              搜索用户
            </Button>
            <Button color="inherit" sx={{ mx: 1 }} component={RouterLink} to="/achievements">
              成就中心
            </Button>
            <Button color="inherit" sx={{ mx: 1 }} component={RouterLink} to="/notifications">
              通知中心
            </Button>
          </Box>

          <IconButton
            color="inherit"
            sx={{ mr: 1 }}
            component="a"
            href="https://github.com/Waiting-Chai/ChainOath"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </IconButton>

          <Button
            variant="contained"
            color="primary"
            startIcon={<WalletIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              boxShadow: 2,
              "&:hover": { boxShadow: 4 },
            }}
            onClick={connectWallet}
          >
            连接钱包
          </Button>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            background: "linear-gradient(135deg, #F8FAFC, #F1F5F9, #F8FAFC)",
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Box sx={{ mb: { xs: 5, lg: 0 }, maxWidth: "lg" }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                  }}
                >
                  链上誓约，可信履约
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: "md", mx: "auto" }}>
                  去中心化的链上誓约系统，让承诺可验证、可执行、可追溯。
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<AddIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      py: 1.5,
                      boxShadow: 4,
                      "&:hover": { boxShadow: 8 },
                    }}
                    onClick={handleClickCreate}
                  >
                    创建誓约
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<ListIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      py: 1.5,
                    }}
                    onClick={() => navigator('/my-oaths')}
                  >
                    查看我的誓约
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Main Content Area */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* 错误提示 */}
          {loadingError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setLoadingError(null)}
            >
              {loadingError}
            </Alert>
          )}
          
          {/* 主要功能区域 */}
          <Grid container spacing={4}>
            {/* 我的誓约功能已迁移到独立页面 MyOaths.tsx */}

            {/* 展示窗 */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ mx: 'auto' }}>
              <Paper sx={{ p: 3, height: '500px', position: 'relative' }}>
                <Typography variant="h5" gutterBottom>
                  誓约展示窗
                </Typography>
                {oathsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CircularProgress />
                  </Box>
                ) : loadingError ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="error" gutterBottom>
                      加载失败
                    </Typography>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {loadingError}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => loadPrivateData()}
                      sx={{ mt: 2 }}
                    >
                      重试
                    </Button>
                  </Box>
                ) : allOaths.length > 0 ? (
                  <Box sx={{ height: '400px', position: 'relative' }}>
                    <Card sx={{ height: '350px', cursor: 'pointer' }} 
                          onClick={() => navigator(`/oath/${allOaths[currentOathIndex]?.id}`)}>
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom noWrap>
                          {allOaths[currentOathIndex]?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, overflow: 'hidden' }}>
                          {allOaths[currentOathIndex]?.description}
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              <PersonIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="caption">
                              {formatAddress(allOaths[currentOathIndex]?.creater || '')}
                            </Typography>
                          </Box>
                          
                          <Chip 
                            label={getStatusText(allOaths[currentOathIndex]?.status || CompletionStatus.PENDING)} 
                            color={getStatusColor(allOaths[currentOathIndex]?.status || CompletionStatus.PENDING) as any}
                            size="small" 
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption">
                              {formatDate(allOaths[currentOathIndex]?.deadline || 0)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikeOath(allOaths[currentOathIndex]?.id || 0);
                                }}
                                disabled={!currentUserAddress}
                              >
                                <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <Typography variant="caption">
                                {allOaths[currentOathIndex]?.likeCount || 0}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CommentIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption">
                                {oathCommentCounts[allOaths[currentOathIndex]?.id?.toString()] || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    {/* 导航按钮 */}
                    <Fab 
                      size="small" 
                      onClick={handlePrevOath}
                      sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                    >
                      <ArrowBackIcon />
                    </Fab>
                    <Fab 
                      size="small" 
                      onClick={handleNextOath}
                      sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
                    >
                      <ArrowForwardIcon />
                    </Fab>
                    
                    {/* 页面指示器 */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Typography variant="caption">
                        {currentOathIndex + 1} / {allOaths.length}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      暂无誓约数据
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* 点赞排行榜 */}
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  点赞排行榜 TOP 5
                </Typography>
                {topOathsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : loadingError ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="error" gutterBottom>
                      加载热门誓约失败
                    </Typography>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {loadingError}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => loadTopOaths()}
                      sx={{ mt: 2 }}
                    >
                      重试
                    </Button>
                  </Box>
                ) : topOaths.length > 0 ? (
                  <Grid container spacing={2}>
                    {topOaths.map((oath, index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={oath.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: index === 0 ? '2px solid #gold' : index === 1 ? '2px solid #silver' : index === 2 ? '2px solid #bronze' : 'none',
                            position: 'relative'
                          }}
                          onClick={() => navigator(`/oath/${oath.id}`)}
                        >
                          {index < 3 && (
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                top: -10, 
                                left: -10, 
                                width: 30, 
                                height: 30, 
                                borderRadius: '50%', 
                                bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px'
                              }}
                            >
                              {index + 1}
                            </Box>
                          )}
                          <CardContent>
                            <Typography variant="h6" noWrap gutterBottom>
                              {oath.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {oath.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FavoriteIcon color="error" sx={{ fontSize: 20, mr: 0.5 }} />
                                <Typography variant="h6">{oath.likeCount || 0}</Typography>
                              </Box>
                              <Chip 
                                label={getStatusText(oath.status)} 
                                color={getStatusColor(oath.status) as any}
                                size="small" 
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      暂无热门誓约数据
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Create Oath Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            创建新誓约
            <IconButton
              aria-label="close"
              onClick={() => setOpenCreateDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="誓约标题"
                  value={createForm.title}
                  onChange={(e) => handleCreateFormChange('title', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="誓约描述"
                  multiline
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => handleCreateFormChange('description', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="承诺人地址"
                  value={createForm.committer}
                  onChange={(e) => handleCreateFormChange('committer', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>代币类型</InputLabel>
                  <Select
                    value={createForm.tokenAddress}
                    onChange={(e) => handleCreateFormChange('tokenAddress', e.target.value)}
                    label="代币类型"
                  >
                    {TOKEN_OPTIONS.map((token) => (
                      <MenuItem key={token.symbol} value={token.address}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Typography>{token.symbol}</Typography>
                          <Typography variant="body2" color="text.secondary">{token.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="抵押金额"
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => handleCreateFormChange('amount', e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="截止日期"
                  type="datetime-local"
                  value={createForm.deadline}
                  onChange={(e) => handleCreateFormChange('deadline', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle1" gutterBottom>
                  检查点
                </Typography>
                {createForm.checkpoints.map((checkpoint, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      label={`检查点 ${index + 1}`}
                      value={checkpoint}
                      onChange={(e) => handleCheckpointChange(index, e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      onClick={() => removeCheckpoint(index)}
                      disabled={createForm.checkpoints.length === 1}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addCheckpoint}
                  sx={{ mt: 1 }}
                >
                  添加检查点
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>取消</Button>
            <Button
              onClick={handleCreateOath}
              variant="contained"
              disabled={isCreating || !createForm.title || !createForm.description}
            >
              {isCreating ? <CircularProgress size={20} /> : '创建誓约'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Progress Dialog */}
        <ProgressDialog
          open={progressOpen}
          onClose={() => setProgressOpen(false)}
          steps={progressSteps}
          currentStepIndex={currentStepIndex}
          title="创建誓约"
        />

      </Box>
    </Box>
  );
};

export default Home;
