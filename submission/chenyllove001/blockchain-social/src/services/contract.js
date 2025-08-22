import { ethers } from 'ethers'

// 网络配置
const NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111的十六进制
    name: 'Sepolia测试网'
  },
  local: {
    chainId: '0x7a69', // 31337的十六进制
    name: '本地测试网',
    url: 'http://127.0.0.1:8545',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  }
}

// 合约ABI
const loginABI = [
  "function register(string memory _username, string memory _password, string memory _img, string memory _other) public",
  "function loginByAdd(address _address) public returns (tuple(string,string,string,string,address))",
  "function loginByUsername(string _username, string _password) public returns (tuple(string,string,string,string,address))",
  "function logout(string _username) public",
  "function users(address) returns (string)",
  "function userInfos(string) returns (string)",
  "function getNft(string memory _username) public"
]

const tieziABI = [
  "function publishtiezi(string memory _title, string memory _content,string memory _lx,string memory _username) public",
  "function tiezis(uint256) returns (uint256 id, uint256 parentid, string title, string content, string lx, uint256 time, uint256 status, string username, uint256 voteCount)",
  "function tieziReplies(uint256) returns (uint256[])",
  "function getId() returns (uint256)",
  "function dianzan(uint256 _id) public",
  "function dashang(uint _id,uint amount) public payable",
  "function queryList(string memory _lx, string memory _title) public view returns (tuple(uint256,uint256,string,string,string,uint256,uint256,string,uint256,uint256,address)[])"
]

// 合约地址（根据网络可能需要不同地址）
const CONTRACT_ADDRESSES = {
  sepolia: {
    login: "0xC0280e29af51b97720D91849CBE6Db9A6d5295E0",
    tiezi: "0x6c4eDC760b9263c00a47BAcfc69b3089d730E285"
  },
  local: {
    login: "0x1A034909880A533C64ACa39fC456B0C047ef9A15", // 替换为本地部署的登录合约地址
    tiezi: "0xf5Bfc0C9b8D18399cfBC9Cd581085529ffCa2256"  // 替换为本地部署的帖子合约地址
  }
}

export default {
  provider: null,
  signer: null,
  loginContract: null,
  tieziContract: null,
  currentNetwork: null,

  async init() {
    if (typeof ethers === 'undefined') {
      console.error('ethers库未正确加载')
      return false
    }

    try {
      let chainId;
      
      // 检测当前网络
      if (window.ethereum) {
        // 从MetaMask获取当前网络ID
        chainId = await window.ethereum.request({ method: 'eth_chainId' })
      } else {
        // 没有MetaMask，尝试直接连接本地网络
        chainId = NETWORKS.local.chainId
      }

      // 判断网络类型
      if (chainId === NETWORKS.sepolia.chainId) {
        // Sepolia测试网 - 使用MetaMask
        this.currentNetwork = 'sepolia'
        return await this.initWithMetaMask()
      } else if (chainId === NETWORKS.local.chainId) {
        // 本地网络 - 使用硬编码私钥
        this.currentNetwork = 'local'
        return await this.initWithLocalKey()
      } else {
        alert(`不支持的网络，请切换到${NETWORKS.sepolia.name}或${NETWORKS.local.name}`)
        return false
      }
    } catch (error) {
      console.error('初始化合约失败:', error)
      return false
    }
  },

  // 使用MetaMask连接（测试网）
  async initWithMetaMask() {
    if (!window.ethereum) {
      alert('请安装MetaMask钱包')
      return false
    }

    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      await this.provider.send("eth_requestAccounts", []) // 请求授权
      this.signer = this.provider.getSigner()
      
      // 初始化合约（使用测试网地址）
      this.loginContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.login,
        loginABI,
        this.signer
      )
      this.tieziContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.tiezi,
        tieziABI,
        this.signer
      )
      return true
    } catch (error) {
      console.error('MetaMask初始化失败:', error)
      return false
    }
  },

  // 使用私钥直接连接（本地网络）
  async initWithLocalKey() {
    try {
      // 直接连接本地节点
      this.provider = new ethers.providers.JsonRpcProvider(NETWORKS.local.url)
      
      // 使用硬编码私钥创建签名者
      this.signer = new ethers.Wallet(NETWORKS.local.privateKey, this.provider)
      
      // 验证本地节点是否可用
      const network = await this.provider.getNetwork()
      if (network.chainId !== parseInt(NETWORKS.local.chainId, 16)) {
        alert(`本地节点链ID不匹配，需要${NETWORKS.local.chainId}`)
        return false
      }
      
      // 初始化合约（使用本地网络地址）
      this.loginContract = new ethers.Contract(
        CONTRACT_ADDRESSES.local.login,
        loginABI,
        this.signer
      )
      this.tieziContract = new ethers.Contract(
        CONTRACT_ADDRESSES.local.tiezi,
        tieziABI,
        this.signer
      )
      
      console.log('本地网络连接成功，使用地址:', await this.signer.getAddress())
      return true
    } catch (error) {
      console.error('本地网络初始化失败:', error)
      alert('本地节点连接失败，请确保节点已启动')
      return false
    }
  },

  // 以下为原有合约方法（保持不变）
  async register(username, password,img,other) {
    try {
      const tx = await this.loginContract.register(username, password,img,other)
      await tx.wait()
      return true
    } catch (error) {
      console.error("注册失败:", error)
      return false
    }
  },

  async loginByUsername(username, password) {
    try {
      // 使用 callStatic 预执行调用获取返回值
      const user = await this.loginContract.callStatic.loginByUsername(username, password)
      console.log("用户信息:", user)
      // 然后发送实际交易
      const tx = await this.loginContract.loginByUsername(username, password)
      await tx.wait() // 等待交易确认
      return user
    } catch (error) {
      console.error("登录失败:", error)
      return false
    }
  },

  async loginByMetaMask(address) {
    try {
      // 使用 callStatic 预执行调用获取返回值，不实际发送交易
      const user = await this.loginContract.callStatic.loginByAdd(address);
      // 然后实际发送交易
      const tx = await this.loginContract.loginByAdd(address);
      await tx.wait();
      return user
    } catch (error) {
      console.error("MetaMask登录失败:", error)
      return null
    }
  },

  async publishPost(post) {
    try {
      const tx = await this.tieziContract.publishtiezi(
          post.title,
          post.content,
          post.lx,
          post.username
    )
      await tx.wait()
      return true
    } catch (error) {
      console.error("发布帖子失败:", error)
      return false
    }
  },
    async getNft(_username) {
    try {
      const tx = await this.loginContract.getNft(_username)
      //await tx.wait()
      return true
    } catch (error) {
      console.error("获取nft失败:", error)
      return false
    }
  },

  async queryList( _lx, _title) { 
    try {
      return await this.tieziContract.queryList(_lx, _title)
    } catch (error) {
      console.error("获取帖子失败:", error)
      return null
    }
  }, 
  async dianzan( _id) { 
    try {
      const tx = await this.tieziContract.dianzan(_id); 
      await tx.wait();
      return true
    } catch (error) {
      console.error("获取帖子失败:", error)
      return null
    }
  },
  async dashang( _id,_amount) { 
    try {
      const amountInWei = ethers.utils.parseEther(_amount.toString());
      // 可选：检查用户余额是否足够
      const balance = await this.signer.getBalance();
      const gasEstimate = await this.tieziContract.estimateGas.dashang(_id, amountInWei, {
        value: amountInWei
      });
      // 调用合约的 dashang 方法并发送 ETH
      const tx = await this.tieziContract.dashang(_id, amountInWei, {
        value: amountInWei // 发送 ETH
      }); 
      await tx.wait();
      return true
    } catch (error) {
      console.error("打赏失败:", error)
      return null
    }
  },

  async getPost(id) {
    try {
      return await this.tieziContract.tiezis(id)
    } catch (error) {
      console.error("获取帖子失败:", error)
      return null
    }
  },

  async getReplies(postId) {
    try {
      return await this.tieziContract.tieziReplies(postId)
    } catch (error) {
      console.error("获取跟帖失败:", error)
      return []
    }
  }
}