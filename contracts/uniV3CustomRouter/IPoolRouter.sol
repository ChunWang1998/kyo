// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.27;

interface IPoolRouter {
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

    function owner() external view returns (address);

    function pendingOwner() external view returns (address);

    function MIN_SQRT_RATIO() external view returns (uint160);

    function MAX_SQRT_RATIO() external view returns (uint160);

    function setMinSqrtRatio(uint160 _minRatio) external;

    function setMaxSqrtRatio(uint160 _maxRatio) external;

    function swapExactTokensForTokens(
        address tokenIn,
        address tokenOut,
        address pool,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut);

    function swapTokensForExactTokens(
        address tokenIn,
        address tokenOut,
        address pool,
        uint256 amountOut,
        uint256 maxAmountIn
    ) external returns (uint256 amountIn);

    function transferOwnership(address newOwner) external;

    function acceptOwnership() external;
}
