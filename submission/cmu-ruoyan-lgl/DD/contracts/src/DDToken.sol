// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DDToken is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VAULT_ROLE = keccak256("VAULT_ROLE");
    
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakingTime;
    
    uint256 public totalStaked;
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**18; // 100 DD
    uint256 public constant MAX_STAKE_AMOUNT = 10000 * 10**18; // 10,000 DD
    
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("DD Token", "DD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10**18); // 1,000,000 DD
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    function stake(uint256 amount) external nonReentrant {
        require(amount >= MIN_STAKE_AMOUNT, "Stake amount too low");
        require(amount <= MAX_STAKE_AMOUNT, "Stake amount too high");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakedAmount[msg.sender] += amount;
        stakingTime[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        emit TokensStaked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external nonReentrant {
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked amount");
        require(block.timestamp >= stakingTime[msg.sender] + 7 days, "Staking period not met");
        
        stakedAmount[msg.sender] -= amount;
        totalStaked -= amount;
        
        if (stakedAmount[msg.sender] == 0) {
            stakingTime[msg.sender] = 0;
        }
        
        _transfer(address(this), msg.sender, amount);
        emit TokensUnstaked(msg.sender, amount);
    }
    
    function getStakedAmount(address user) external view returns (uint256) {
        return stakedAmount[user];
    }
    
    function getStakingTime(address user) external view returns (uint256) {
        return stakingTime[user];
    }
    
    function isStaking(address user) external view returns (bool) {
        return stakedAmount[user] > 0;
    }
    
    // 只有Vault合约可以调用此函数来转移质押的代币
    function transferStakedTokens(address from, address to, uint256 amount) external onlyRole(VAULT_ROLE) {
        require(stakedAmount[from] >= amount, "Insufficient staked amount");
        
        stakedAmount[from] -= amount;
        totalStaked -= amount;
        
        if (stakedAmount[from] == 0) {
            stakingTime[from] = 0;
        }
        
        _transfer(address(this), to, amount);
    }
    
    function _update(address from, address to, uint256 amount) internal virtual override {
        super._update(from, to, amount);
        
        // 防止质押的代币被转移
        if (from != address(0) && to != address(0)) {
            require(stakedAmount[from] == 0 || balanceOf(msg.sender) - stakedAmount[from] >= amount, "Cannot transfer staked tokens");
        }
    }
}
