// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Task Token
 * @notice 平台任务代币，用于任务奖励支付
 * @dev 基于ERC20标准的平台代币
 */
contract TaskToken is ERC20, Ownable {
    // 代币精度
    uint8 private immutable _decimals;

    // 水龙头铸造数量
    uint256 public constant FAUCET_MINT_AMOUNT = 10000 * 10 ** 18;

    /**
     * @notice 构造函数
     * @param _name 代币名称
     * @param _symbol 代币符号
     * @param decimals_ 代币精度
     */
    constructor(string memory _name, string memory _symbol, uint8 decimals_)
        ERC20(_name, _symbol)
        Ownable(msg.sender)
    {
        _decimals = decimals_;
    }

    /**
     * @notice 获取代币精度
     * @return 代币精度
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice 铸造代币 - 只有所有者可以铸造
     * @param to 接收地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice 水龙头功能 - 任何人都可以铸造固定数量的代币给自己
     */
    function faucetMint() external {
        _mint(msg.sender, FAUCET_MINT_AMOUNT);
    }

    /**
     * @notice 销毁代币
     * @param amount 销毁数量
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @notice 授权任务合约使用代币
     * @param taskContract 任务合约地址
     * @param amount 授权数量
     */
    function approveTaskContract(address taskContract, uint256 amount) external {
        _approve(msg.sender, taskContract, amount);
    }
}
