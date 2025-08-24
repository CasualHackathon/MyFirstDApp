// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ChainOath 安全版誓约合约
 * @dev 重构版本：实现角色分离、资金管理、社交功能和生命周期管理
 */
contract ChainOathSecure is ReentrancyGuard, Ownable, Pausable {
    
    // 完成状态枚举
    enum CompletionStatus {
        PENDING,     // 进行中
        COMPLETED,   // 已完成
        FAILED,      // 未完成
        EXPIRED      // 已过期
    }
    
    // 誓约结构体
    struct Oath {
        uint256 id;
        string title;
        string description;
        address creater;              // 创建者（出资人）
        address committer;            // 守约人（执行人）
        address tokenAddress;         // ERC-20代币合约地址
        uint256 amount;               // 奖励金额
        uint256 createTime;           // 创建时间戳
        uint256 deadline;             // 截止时间戳
        string[] checkpoints;         // 检查点数组
        CompletionStatus completionStatus;  // 完成状态
        uint256 upvotes;              // 点赞数量
        bool isActive;                // 是否激活
    }
    
    // 评论结构体
    struct Comment {
        uint256 id;
        uint256 oathId;
        address author;
        string content;
        uint256 timestamp;
    }
    
    // 状态变量
    uint256 public oathCounter;
    uint256 public commentCounter;
    
    // 存储映射
    mapping(uint256 => Oath) public oaths;
    mapping(uint256 => Comment[]) public oathComments;
    mapping(uint256 => mapping(address => bool)) public oathLikes;
    mapping(address => uint256[]) public userCreatedOaths;
    mapping(address => uint256[]) public userCommittedOaths;
    
    // NFT合约地址
    address public nftContract;
    
    // 事件定义
    event OathCreated(uint256 indexed oathId, address indexed creater, address indexed committer);
    event OathEvaluated(uint256 indexed oathId, bool isCompleted, address evaluator);
    event OathLiked(uint256 indexed oathId, address indexed user);
    event CommentAdded(uint256 indexed oathId, uint256 indexed commentId, address indexed author);
    event FundsReleased(uint256 indexed oathId, address indexed recipient, uint256 amount);
    event NFTContractSet(address indexed nftContract);
    
    constructor() Ownable(msg.sender) {
        oathCounter = 0;
        commentCounter = 0;
    }
    
    /**
     * @dev 设置NFT合约地址
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid NFT contract address");
        nftContract = _nftContract;
        emit NFTContractSet(_nftContract);
    }
    
    /**
     * @dev 创建誓约
     * @param title 誓约标题
     * @param description 誓约描述
     * @param committer 守约人地址
     * @param tokenAddress ERC-20代币合约地址
     * @param amount 奖励金额
     * @param deadline 截止时间戳
     * @param checkpoints 检查点数组
     */
    function createOath(
        string memory title,
        string memory description,
        address committer,
        address tokenAddress,
        uint256 amount,
        uint256 deadline,
        string[] memory checkpoints
    ) external nonReentrant whenNotPaused returns (uint256 oathId) {
        // 基本验证
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(committer != address(0), "Invalid committer address");
        require(committer != msg.sender, "Creater and committer must be different");
        require(tokenAddress != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(checkpoints.length > 0, "At least one checkpoint required");
        require(checkpoints.length <= 10, "Too many checkpoints");
        
        // 转移代币到合约
        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // 创建誓约
        oathId = oathCounter++;
        
        Oath storage oath = oaths[oathId];
        oath.id = oathId;
        oath.title = title;
        oath.description = description;
        oath.creater = msg.sender;
        oath.committer = committer;
        oath.tokenAddress = tokenAddress;
        oath.amount = amount;
        oath.createTime = block.timestamp;
        oath.deadline = deadline;
        oath.checkpoints = checkpoints;
        oath.completionStatus = CompletionStatus.PENDING;
        oath.upvotes = 0;
        oath.isActive = true;
        
        // 更新用户誓约记录
        userCreatedOaths[msg.sender].push(oathId);
        userCommittedOaths[committer].push(oathId);
        
        emit OathCreated(oathId, msg.sender, committer);
        
        // 检查成就
        _checkAchievements(msg.sender);
        
        return oathId;
    }
    
    /**
     * @dev 评估完成状态（仅创建者可调用）
     * @param oathId 誓约ID
     * @param isCompleted 是否完成
     * @param feedback 反馈信息
     */
    function evaluateCompletion(
        uint256 oathId,
        bool isCompleted,
        string memory feedback
    ) external nonReentrant whenNotPaused {
        Oath storage oath = oaths[oathId];
        require(oath.isActive, "Oath is not active");
        require(msg.sender == oath.creater, "Only creater can evaluate");
        require(oath.completionStatus == CompletionStatus.PENDING, "Oath already evaluated");
        require(block.timestamp <= oath.deadline, "Oath has expired");
        
        if (isCompleted) {
            oath.completionStatus = CompletionStatus.COMPLETED;
            // 将奖励转给守约人
            IERC20 token = IERC20(oath.tokenAddress);
            require(token.transfer(oath.committer, oath.amount), "Reward transfer failed");
            emit FundsReleased(oathId, oath.committer, oath.amount);
        } else {
            oath.completionStatus = CompletionStatus.FAILED;
            // 将资金退还给创建者
            IERC20 token = IERC20(oath.tokenAddress);
            require(token.transfer(oath.creater, oath.amount), "Refund transfer failed");
            emit FundsReleased(oathId, oath.creater, oath.amount);
        }
        
        oath.isActive = false;
        emit OathEvaluated(oathId, isCompleted, msg.sender);
        
        // 如果设置了NFT合约，触发成就检查
        if (nftContract != address(0)) {
            _checkAchievements(oath.creater);
            _checkAchievements(oath.committer);
        }
    }
    
    /**
     * @dev 处理过期誓约
     * @param oathId 誓约ID
     */
    function handleExpiredOath(uint256 oathId) external nonReentrant {
        Oath storage oath = oaths[oathId];
        require(oath.isActive, "Oath is not active");
        require(oath.completionStatus == CompletionStatus.PENDING, "Oath already evaluated");
        require(block.timestamp > oath.deadline, "Oath has not expired yet");
        
        oath.completionStatus = CompletionStatus.EXPIRED;
        oath.isActive = false;
        
        // 将资金退还给创建者
        IERC20 token = IERC20(oath.tokenAddress);
        require(token.transfer(oath.creater, oath.amount), "Refund transfer failed");
        emit FundsReleased(oathId, oath.creater, oath.amount);
    }
    
    /**
     * @dev 点赞誓约
     * @param oathId 誓约ID
     */
    function likeOath(uint256 oathId) external {
        require(oathId < oathCounter, "Oath does not exist");
        require(!oathLikes[oathId][msg.sender], "Already liked");
        
        oathLikes[oathId][msg.sender] = true;
        oaths[oathId].upvotes++;
        
        emit OathLiked(oathId, msg.sender);
        
        // 如果设置了NFT合约，触发成就检查
        if (nftContract != address(0)) {
            _checkAchievements(oaths[oathId].creater);  // 检查被点赞者成就
            // 记录点赞者的点赞行为
            (bool success, ) = nftContract.call(
                abi.encodeWithSignature("recordUserLike(address)", msg.sender)
            );
        }
    }
    
    /**
     * @dev 添加评论
     * @param oathId 誓约ID
     * @param content 评论内容
     */
    function addComment(
        uint256 oathId,
        string memory content
    ) external {
        require(oathId < oathCounter, "Oath does not exist");
        require(bytes(content).length > 0, "Comment cannot be empty");
        require(bytes(content).length <= 500, "Comment too long");
        
        uint256 commentId = commentCounter++;
        
        Comment memory newComment = Comment({
            id: commentId,
            oathId: oathId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp
        });
        
        oathComments[oathId].push(newComment);
        
        emit CommentAdded(oathId, commentId, msg.sender);
    }
    
    /**
     * @dev 检查成就（内部函数）
     * @param user 用户地址
     */
    function _checkAchievements(address user) internal {
        if (nftContract == address(0)) return;
        
        // 调用NFT合约的成就检查函数
        (bool success, ) = nftContract.call(
            abi.encodeWithSignature("checkAndMintAchievements(address)", user)
        );
        // 忽略调用失败，不影响主要功能
    }
    
    // ========== 查询函数 ==========
    
    /**
     * @dev 获取誓约信息
     */
    function getOath(uint256 oathId) external view returns (Oath memory) {
        require(oathId < oathCounter, "Oath does not exist");
        return oaths[oathId];
    }
    
    /**
     * @dev 获取用户创建的誓约
     */
    function getUserCreatedOaths(address user) external view returns (uint256[] memory) {
        return userCreatedOaths[user];
    }
    
    /**
     * @dev 获取用户承诺的誓约
     */
    function getUserCommittedOaths(address user) external view returns (uint256[] memory) {
        return userCommittedOaths[user];
    }
    
    /**
     * @dev 获取誓约评论
     */
    function getOathComments(uint256 oathId) external view returns (Comment[] memory) {
        require(oathId < oathCounter, "Oath does not exist");
        return oathComments[oathId];
    }
    
    /**
     * @dev 检查用户是否已点赞
     */
    function hasUserLiked(uint256 oathId, address user) external view returns (bool) {
        return oathLikes[oathId][user];
    }
    
    /**
     * @dev 获取用户统计信息（用于成就系统）
     */
    function getUserStats(address user) external view returns (
        uint256 createdOaths,
        uint256 completedOaths,
        uint256 totalUpvotes
    ) {
        createdOaths = userCreatedOaths[user].length;
        
        // 计算总点赞数和完成的誓约数量
        totalUpvotes = 0;
        completedOaths = 0;
        uint256[] memory createdOathsList = userCreatedOaths[user];
        for (uint256 i = 0; i < createdOathsList.length; i++) {
            totalUpvotes += oaths[createdOathsList[i]].upvotes;
            if (oaths[createdOathsList[i]].completionStatus == CompletionStatus.COMPLETED) {
                completedOaths++;
            }
        }
        
        return (createdOaths, completedOaths, totalUpvotes);
    }
    
    /**
     * @dev 获取所有誓约（分页）
     */
    function getAllOaths(uint256 offset, uint256 limit) external view returns (Oath[] memory) {
        require(offset < oathCounter, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > oathCounter) {
            end = oathCounter;
        }
        
        Oath[] memory result = new Oath[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = oaths[i];
        }
        
        return result;
    }
    
    // ========== 管理员函数 ==========
    
    /**
     * @dev 紧急暂停合约
     */
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 紧急提取代币（仅限管理员）
     */
    function emergencyWithdraw(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(owner(), amount), "Emergency withdraw failed");
    }
}