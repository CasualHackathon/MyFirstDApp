// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleLiquidityPool
 * @dev 簡單的流動性池合約，使用者可以提供流動性獲得 LP 代幣
 */
contract SimpleLiquidityPool is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public tokenA;
    IERC20 public tokenB;
    
    uint256 public reserveA;
    uint256 public reserveB;
    
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    
    event LiquidityAdded(
        address indexed user,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed user,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    constructor(
        address _tokenA,
        address _tokenB,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }
    
    /**
     * @dev 添加流動性
     */
    function addLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(amountADesired > 0 && amountBDesired > 0, "SimpleLiquidityPool: Invalid amounts");
        
        if (reserveA == 0 && reserveB == 0) {
            // 首次添加流動性
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            // 根據現有比例計算實際添加數量
            uint256 amountBOptimal = (amountADesired * reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "SimpleLiquidityPool: Insufficient B amount");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = (amountBDesired * reserveA) / reserveB;
                require(amountAOptimal <= amountADesired && amountAOptimal >= amountAMin, 
                    "SimpleLiquidityPool: Insufficient A amount");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }
        
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);
        
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            _mint(address(1), MINIMUM_LIQUIDITY); // 鎖定最小流動性
        } else {
            liquidity = min(
                (amountA * totalSupply) / reserveA,
                (amountB * totalSupply) / reserveB
            );
        }
        
        require(liquidity > 0, "SimpleLiquidityPool: Insufficient liquidity minted");
        _mint(msg.sender, liquidity);
        
        reserveA += amountA;
        reserveB += amountB;
        
        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);
    }
    
    /**
     * @dev 移除流動性
     */
    function removeLiquidity(
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(liquidity > 0, "SimpleLiquidityPool: Invalid liquidity");
        require(balanceOf(msg.sender) >= liquidity, "SimpleLiquidityPool: Insufficient balance");
        
        uint256 totalSupply = totalSupply();
        amountA = (liquidity * reserveA) / totalSupply;
        amountB = (liquidity * reserveB) / totalSupply;
        
        require(amountA >= amountAMin, "SimpleLiquidityPool: Insufficient A amount");
        require(amountB >= amountBMin, "SimpleLiquidityPool: Insufficient B amount");
        
        _burn(msg.sender, liquidity);
        
        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);
        
        reserveA -= amountA;
        reserveB -= amountB;
        
        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }
    
    /**
     * @dev 計算添加流動性所需的代幣數量
     */
    function calculateLiquidity(
        uint256 amountADesired,
        uint256 amountBDesired
    ) external view returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        if (reserveA == 0 && reserveB == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
            liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
        } else {
            uint256 amountBOptimal = (amountADesired * reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = (amountBDesired * reserveA) / reserveB;
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
            
            uint256 totalSupply = totalSupply();
            liquidity = min(
                (amountA * totalSupply) / reserveA,
                (amountB * totalSupply) / reserveB
            );
        }
    }
    
    /**
     * @dev 獲取儲備量
     */
    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }
    
    /**
     * @dev 獲取使用者的 LP 資訊
     */
    function getUserLPInfo(address user) external view returns (
        uint256 lpBalance,
        uint256 userShareA,
        uint256 userShareB,
        uint256 sharePercentage
    ) {
        lpBalance = balanceOf(user);
        uint256 totalSupply = totalSupply();
        
        if (totalSupply > 0 && lpBalance > 0) {
            userShareA = (lpBalance * reserveA) / totalSupply;
            userShareB = (lpBalance * reserveB) / totalSupply;
            sharePercentage = (lpBalance * 10000) / totalSupply; // basis points
        }
    }
    
    // 輔助函數
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
