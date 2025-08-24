// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WETH - Wrapped Ether
 * @dev A simple WETH implementation that allows 1:1 wrapping of ETH
 */
contract WETH is ERC20, ReentrancyGuard {
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    constructor() ERC20("Wrapped Ether", "WETH") {}

    /**
     * @dev Deposit ETH and mint WETH tokens 1:1
     */
    function deposit() public payable nonReentrant {
        require(msg.value > 0, "Must send ETH to deposit");
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw ETH by burning WETH tokens 1:1
     * @param wad Amount of WETH to withdraw
     */
    function withdraw(uint256 wad) public nonReentrant {
        require(balanceOf(msg.sender) >= wad, "Insufficient WETH balance");
        _burn(msg.sender, wad);
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }

    /**
     * @dev Allow contract to receive ETH directly (calls deposit)
     */
    receive() external payable {
        deposit();
    }

    /**
     * @dev Fallback function that calls deposit
     */
    fallback() external payable {
        deposit();
    }

    /**
     * @dev Get the total supply of WETH (should equal contract's ETH balance)
     */
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    /**
     * @dev Decimals for WETH (same as ETH)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}