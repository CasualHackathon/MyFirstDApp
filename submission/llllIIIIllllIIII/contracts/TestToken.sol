// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev ERC20 測試代幣，使用者可以領取少量測試幣進行 DeFi 體驗
 */
contract TestToken is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 每次領取 1000 個代幣
    uint256 public constant FAUCET_COOLDOWN = 1 hours; // 領取冷卻時間 1 小時
    
    mapping(address => uint256) public lastFaucetTime;
    
    event FaucetUsed(address indexed user, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    /**
     * @dev 使用者領取測試代幣
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN,
            "TestToken: Faucet cooldown not elapsed"
        );
        
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev 檢查使用者是否可以領取代幣
     */
    function canUseFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetTime[user] + FAUCET_COOLDOWN;
    }
    
    /**
     * @dev 獲取下次可領取時間
     */
    function getNextFaucetTime(address user) external view returns (uint256) {
        return lastFaucetTime[user] + FAUCET_COOLDOWN;
    }
    
    /**
     * @dev 管理員鑄造代幣（僅限擁有者）
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
