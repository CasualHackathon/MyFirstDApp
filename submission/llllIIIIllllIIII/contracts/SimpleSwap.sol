// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleSwap
 * @dev 簡單的代幣兌換合約，支援 Token A <-> Token B 兌換
 */
contract SimpleSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public tokenA;
    IERC20 public tokenB;
    
    uint256 public reserveA;
    uint256 public reserveB;
    
    uint256 public constant FEE_RATE = 30; // 0.3% 手續費 (30/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event LiquidityAdded(
        address indexed user,
        uint256 amountA,
        uint256 amountB
    );
    
    constructor(
        address _tokenA,
        address _tokenB
    ) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }
    
    /**
     * @dev 新增流動性（僅限擁有者，用於初始化）
     */
    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external onlyOwner {
        require(amountA > 0 && amountB > 0, "SimpleSwap: Invalid amounts");
        
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);
        
        reserveA += amountA;
        reserveB += amountB;
        
        emit LiquidityAdded(msg.sender, amountA, amountB);
    }
    
    /**
     * @dev Token A 兌換 Token B
     */
    function swapAForB(uint256 amountIn, uint256 minAmountOut) external nonReentrant {
        require(amountIn > 0, "SimpleSwap: Invalid amount");
        require(reserveA > 0 && reserveB > 0, "SimpleSwap: No liquidity");
        
        uint256 amountOut = getAmountOut(amountIn, reserveA, reserveB);
        require(amountOut >= minAmountOut, "SimpleSwap: Insufficient output amount");
        require(amountOut <= reserveB, "SimpleSwap: Insufficient liquidity");
        
        tokenA.safeTransferFrom(msg.sender, address(this), amountIn);
        tokenB.safeTransfer(msg.sender, amountOut);
        
        reserveA += amountIn;
        reserveB -= amountOut;
        
        emit Swap(msg.sender, address(tokenA), address(tokenB), amountIn, amountOut);
    }
    
    /**
     * @dev Token B 兌換 Token A
     */
    function swapBForA(uint256 amountIn, uint256 minAmountOut) external nonReentrant {
        require(amountIn > 0, "SimpleSwap: Invalid amount");
        require(reserveA > 0 && reserveB > 0, "SimpleSwap: No liquidity");
        
        uint256 amountOut = getAmountOut(amountIn, reserveB, reserveA);
        require(amountOut >= minAmountOut, "SimpleSwap: Insufficient output amount");
        require(amountOut <= reserveA, "SimpleSwap: Insufficient liquidity");
        
        tokenB.safeTransferFrom(msg.sender, address(this), amountIn);
        tokenA.safeTransfer(msg.sender, amountOut);
        
        reserveB += amountIn;
        reserveA -= amountOut;
        
        emit Swap(msg.sender, address(tokenB), address(tokenA), amountIn, amountOut);
    }
    
    /**
     * @dev 計算兌換輸出金額（包含手續費）
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "SimpleSwap: Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "SimpleSwap: Invalid reserves");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DENOMINATOR + amountInWithFee;
        amountOut = numerator / denominator;
    }
    
    /**
     * @dev 獲取當前儲備量
     */
    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }
}
