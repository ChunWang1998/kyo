// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.27;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import '@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol';
import '@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/libraries/Path.sol';
import '@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol';

contract PoolRouter is IUniswapV3SwapCallback {

    using Path for bytes;

    address public owner;
    address public pendingOwner;
    uint160 public MIN_SQRT_RATIO = 4295128739;
    uint160 public MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setMinSqrtRatio(uint160 _minRatio) external onlyOwner {
        MIN_SQRT_RATIO = _minRatio;
    }

    function setMaxSqrtRatio(uint160 _maxRatio) external onlyOwner {
        MAX_SQRT_RATIO = _maxRatio;
    }

    function poolSwap(address tokenIn, address tokenOut, address pool,uint256 _amount, bool zeroForOne) external {
        require(_amount > 0,"amount can't be zero");

        // Tranfer _amount of tokenIn to the contract
        bool approveTokenIn = IERC20Minimal(tokenIn).transferFrom(msg.sender, address(this), _amount);
        require(approveTokenIn, "tokenIn transfer failed");

        // Approve the pool to spend tokenIn
        bool approvePoolSpending = IERC20Minimal(tokenIn).approve(address(pool), _amount);
        require(approvePoolSpending, "Approve pool spending failed");

        IUniswapV3Pool(pool).swap({
            recipient: address(this),
            zeroForOne: zeroForOne,
            amountSpecified: int256(_amount),
            sqrtPriceLimitX96: zeroForOne ? MIN_SQRT_RATIO + 1 : MAX_SQRT_RATIO - 1,
            data: abi.encode(pool, tokenIn, pool)
        });
        
        //get token balance
        uint256  amountOut = IERC20Minimal(tokenOut).balanceOf(address(this));

        //tranfer amountOut to msg.sender
        bool tx_s = IERC20Minimal(tokenOut).transfer(msg.sender, amountOut);
        require(tx_s,"Amount transfer to caller failed");
    }

   function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata _data
    ) external override {
        require(amount0Delta > 0 || amount1Delta > 0, "Invalid amounts");
        
        // decode pool address pass in call data
        (address to, address tokenIn, address pool) = abi.decode(_data, (address, address, address));
        require(msg.sender == pool,"Unauthorized caller");

        IERC20Minimal(tokenIn).transfer(to, uint256(amount0Delta));
        }

    // Step 1: Current owner initiates ownership transfer
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        pendingOwner = newOwner;
    }

    // Step 2: New owner accepts ownership
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Only pending owner can accept ownership");
        owner = pendingOwner;
        pendingOwner = address(0);
    }
}
