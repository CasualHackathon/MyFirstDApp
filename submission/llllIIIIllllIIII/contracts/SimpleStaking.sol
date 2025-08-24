// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleStaking
 * @dev 簡單的代幣質押合約，使用者可以質押代幣獲得獎勵
 */
contract SimpleStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public constant REWARD_RATE = 1000; // 每秒每代幣的獎勵率 (basis points)
    uint256 public constant REWARD_DENOMINATOR = 1000000;
    
    struct UserInfo {
        uint256 amount; // 質押數量
        uint256 rewardDebt; // 已結算的獎勵
        uint256 lastStakeTime; // 最後質押時間
    }
    
    mapping(address => UserInfo) public userInfo;
    uint256 public totalStaked;
    uint256 public totalRewards;
    
    event Stake(address indexed user, uint256 amount);
    event Unstake(address indexed user, uint256 amount);
    event ClaimReward(address indexed user, uint256 reward);
    
    constructor(
        address _stakingToken,
        address _rewardToken
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev 質押代幣
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "SimpleStaking: Cannot stake 0");
        
        UserInfo storage user = userInfo[msg.sender];
        
        // 先領取之前的獎勵
        if (user.amount > 0) {
            uint256 pendingReward = getPendingReward(msg.sender);
            if (pendingReward > 0) {
                rewardToken.safeTransfer(msg.sender, pendingReward);
                emit ClaimReward(msg.sender, pendingReward);
            }
        }
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        user.amount += amount;
        user.lastStakeTime = block.timestamp;
        user.rewardDebt = block.timestamp;
        totalStaked += amount;
        
        emit Stake(msg.sender, amount);
    }
    
    /**
     * @dev 取消質押
     */
    function unstake(uint256 amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= amount, "SimpleStaking: Insufficient staked amount");
        
        // 先領取獎勵
        uint256 pendingReward = getPendingReward(msg.sender);
        if (pendingReward > 0) {
            rewardToken.safeTransfer(msg.sender, pendingReward);
            emit ClaimReward(msg.sender, pendingReward);
        }
        
        user.amount -= amount;
        user.rewardDebt = block.timestamp;
        totalStaked -= amount;
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstake(msg.sender, amount);
    }
    
    /**
     * @dev 領取獎勵
     */
    function claimReward() external nonReentrant {
        uint256 pendingReward = getPendingReward(msg.sender);
        require(pendingReward > 0, "SimpleStaking: No pending reward");
        
        UserInfo storage user = userInfo[msg.sender];
        user.rewardDebt = block.timestamp;
        
        rewardToken.safeTransfer(msg.sender, pendingReward);
        
        emit ClaimReward(msg.sender, pendingReward);
    }
    
    /**
     * @dev 計算待領取獎勵
     */
    function getPendingReward(address userAddress) public view returns (uint256) {
        UserInfo memory user = userInfo[userAddress];
        if (user.amount == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - user.rewardDebt;
        uint256 reward = (user.amount * timeElapsed * REWARD_RATE) / REWARD_DENOMINATOR;
        
        return reward;
    }
    
    /**
     * @dev 獲取使用者質押資訊
     */
    function getUserInfo(address userAddress) external view returns (
        uint256 amount,
        uint256 pendingReward,
        uint256 lastStakeTime
    ) {
        UserInfo memory user = userInfo[userAddress];
        return (
            user.amount,
            getPendingReward(userAddress),
            user.lastStakeTime
        );
    }
    
    /**
     * @dev 管理員添加獎勵代幣（僅限擁有者）
     */
    function addRewards(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        totalRewards += amount;
    }
    
    /**
     * @dev 獲取合約狀態
     */
    function getContractInfo() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewards,
        uint256 _rewardRate
    ) {
        return (totalStaked, totalRewards, REWARD_RATE);
    }
}
