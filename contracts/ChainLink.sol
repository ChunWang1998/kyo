// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ChainlinkPriceFeedConsumer {
    using SafeMath for uint256;
    
    address public pool; // uniV3 type
    address public ethUsdPriceFeed;

    uint256 public constant PRICE_PRECISION = 1e18;
    constructor(address _pool, address _ethUsdPriceFeed) {
        pool = _pool;
        ethUsdPriceFeed = _ethUsdPriceFeed;
    }

    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        // 1. get yay/eth price from UniswapV3 pool
        (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(pool).slot0();
        uint256 price = PRICE_PRECISION.mul(uint256(sqrtPriceX96) ** 2).div(2 ** 192);
        answer = int256(price);
        // answer: 0.0000071 => 1 yay = 0.0000071 eth

        // 2. get eth price 
        (,int256 ethUsdPrice,,,) = AggregatorV3Interface(ethUsdPriceFeed).latestRoundData();
        uint8 ethDecimal = AggregatorV3Interface(ethUsdPriceFeed).decimals();
        
        // 3. convert to yay/usd using SafeMath
        answer = answer * ethUsdPrice / int256(10**ethDecimal);

        return (0, answer, 0, 0, 0);
    }

}
