// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.27;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";
import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/libraries/Path.sol";
import "@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol";

contract PoolRouter is IUniswapV3SwapCallback {
    using Path for bytes;

    address public owner;
    address public pendingOwner;
    uint160 public MIN_SQRT_RATIO = 4295128739;
    uint160 public MAX_SQRT_RATIO =
        1461446703485210103287273052203988822378723970342;

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

    event OwnershipTransferInitiated(
        address indexed previousOwner,
        address indexed newOwner
    );
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    function _handleTokenTransferAndApproval(
        address token,
        uint256 amount
    ) private {
        require(
            IERC20Minimal(token).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "Transfer of input token failed"
        );
        require(
            IERC20Minimal(token).approve(msg.sender, amount),
            "Approval of input token failed"
        );
    }

    function swapExactTokensForTokens(
        address tokenIn,
        address tokenOut,
        address pool,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "Input amount must be greater than 0");

        _handleTokenTransferAndApproval(tokenIn, amountIn);

        // Determine swap direction based on token addresses
        bool zeroForOne = tokenIn < tokenOut;
        uint160 sqrtPriceLimitX96 = zeroForOne
            ? MIN_SQRT_RATIO + 1
            : MAX_SQRT_RATIO - 1;

        IUniswapV3Pool(pool).swap(
            address(this),
            zeroForOne, // Updated to use calculated zeroForOne
            int256(amountIn),
            sqrtPriceLimitX96, // Updated price limit based on direction
            abi.encode(msg.sender, tokenIn, tokenOut)
        );

        amountOut = IERC20Minimal(tokenOut).balanceOf(address(this));
        require(amountOut >= minAmountOut, "Insufficient output amount");

        require(
            IERC20Minimal(tokenOut).transfer(msg.sender, amountOut),
            "Output token transfer failed"
        );

        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut);
        return amountOut;
    }

    function swapTokensForExactTokens(
        address tokenIn,
        address tokenOut,
        address pool,
        uint256 amountOut,
        uint256 maxAmountIn
    ) external returns (uint256 amountIn) {
        require(amountOut > 0, "amount can't be zero");

        // Transfer maxAmountIn of tokenIn to the contract
        bool approveTokenIn = IERC20Minimal(tokenIn).transferFrom(
            msg.sender,
            address(this),
            maxAmountIn
        );
        require(approveTokenIn, "tokenIn transfer failed");

        // Approve the pool to spend tokenIn
        bool approvePoolSpending = IERC20Minimal(tokenIn).approve(
            address(pool),
            maxAmountIn
        );
        require(approvePoolSpending, "Approve pool spending failed");

        // Determine swap direction based on token addresses
        bool zeroForOne = tokenIn < tokenOut;

        IUniswapV3Pool(pool).swap({
            recipient: address(this),
            zeroForOne: zeroForOne,
            amountSpecified: -int256(amountOut), // negative means exact output
            sqrtPriceLimitX96: zeroForOne
                ? MIN_SQRT_RATIO + 1
                : MAX_SQRT_RATIO - 1,
            data: abi.encode(pool, tokenIn, pool)
        });

        // Calculate actual amount of tokenIn used
        amountIn =
            maxAmountIn -
            IERC20Minimal(tokenIn).balanceOf(address(this));
        require(amountIn <= maxAmountIn, "Excessive input amount");

        // Transfer exact output amount to user
        bool tx_s = IERC20Minimal(tokenOut).transfer(msg.sender, amountOut);
        require(tx_s, "Amount transfer to caller failed");

        // Refund unused tokenIn
        if (amountIn < maxAmountIn) {
            bool refund = IERC20Minimal(tokenIn).transfer(
                msg.sender,
                maxAmountIn - amountIn
            );
            require(refund, "Refund failed");
        }

        return amountIn;
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata _data
    ) external override {
        require(amount0Delta > 0 || amount1Delta > 0, "Invalid swap amounts");

        (address recipient, address tokenIn, address tokenOut) = abi.decode(
            _data,
            (address, address, address)
        );

        uint256 amountToPay = amount0Delta > 0
            ? uint256(amount0Delta)
            : uint256(amount1Delta);

        require(
            IERC20Minimal(tokenIn).transfer(msg.sender, amountToPay),
            "Callback transfer failed"
        );
    }

    // Step 1: Current owner initiates ownership transfer
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        pendingOwner = newOwner;
        emit OwnershipTransferInitiated(owner, newOwner);
    }

    // Step 2: New owner accepts ownership
    function acceptOwnership() external {
        require(
            msg.sender == pendingOwner,
            "Only pending owner can accept ownership"
        );
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }
}
