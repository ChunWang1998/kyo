//pool: 0xb0652aa552058711ebd49e89d50ff205731a72bf (2 tokens in there)(原本的algebra 不是！)
//new deployed pool: 0xD0102E205C738A68783e7EFFEC1520d4ed0A6344
//swap tx: 0x82ac1e052b7d9752834f5723d3cfe0e458a383af9a7600591de52fc76c5dd1c8

//swap interact with:
// 1. Vault (Universal Router): 0xd78095468bC37F7b036C48c35865d5d013989C19
// router: 0xBb1C38479f11e0A9DFc9346F6Fdd8A1B71ddb6A2
// pool contract: https://github.com/Uniswap/v3-core/blob/main/contracts/UniswapV3Pool.sol

// uniswap: call universalRouter, 且錢是從universalRouter來

/*
對於 token0 到 token1 的交易：設置一個接近但大於 MIN_SQRT_RATIO 的值
對於 token1 到 token0 的交易：設置一個接近但小於 MAX_SQRT_RATIO 的值
*/

// ts-node scripts/kyoSwap.ts
require('dotenv').config();
import { ethers } from 'ethers';
// import { BigNumber } from 'ethers';


// const MIN_SQRT_RATIO = BigNumber.from('4295128739')
// const MAX_SQRT_RATIO = BigNumber.from('1461446703485210103287273052203988822378723970342')

async function swapTokens() {
    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
        throw new Error("Missing RPC_URL or PRIVATE_KEY in environment variables");
    }
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const poolContractAddress = "0xD0102E205C738A68783e7EFFEC1520d4ed0A6344";

    const poolAbi = [
        "function swap(address pool, address recipient, bool zeroForOne, uint160 sqrtPriceX96, int256 amountSpecified, uint256 pay0, uint256 pay1) external"
    ];

    const spender = "0x24c18dcfFf7EA6E40654DA8408DbE8878b0580Fe"
    const fromToken = "0xaB1e79b421f4Fd6eFa7CC2a815F8217b1EBd1Fb1";
    const fromTokenContract = new ethers.Contract(fromToken, [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ], wallet);
    await fromTokenContract.approve(spender, ethers.parseUnits("1000", 18));
    // Check approve allowance
    const allowance = await fromTokenContract.allowance(wallet.address, spender);
    console.log('Approve allowance:', ethers.formatUnits(allowance, 18));
    // const to = "0xc449FC4f62a20Ecc79C06799122d44002B925ad8"

    // const poolAContractAddress = "0xb0652aa552058711ebd49e89d50ff205731a72bf";
    // const poolAAbi = [
    //     "function balance0() view returns (uint256)",
    //     "function factory() view returns (address)",
    //     "function token0() view returns (address)",
    //     "function token1() view returns (address)",
    //     "function fee() view returns (uint24)",
    //     "function tickSpacing() view returns (int24)",
    //     "function maxLiquidityPerTick() view returns (uint128)",
    //     "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    //     "function feeGrowthGlobal0X128() view returns (uint256)",
    //     "function feeGrowthGlobal1X128() view returns (uint256)",
    //     "function protocolFees() view returns (uint128 token0, uint128 token1)",
    //     "function liquidity() view returns (uint128)"
    // ];

    const poolContract = new ethers.Contract(poolContractAddress, poolAbi, wallet);
    // const poolAContract = new ethers.Contract(poolAContractAddress, poolAAbi, wallet);
    // try {


    //     console.log('Executing swap...');
    //     const swapTx = await poolContract.swap(
    //         "0xb0652aa552058711ebd49e89d50ff205731a72bf",
    //         wallet.address,
    //         true,
    //         "78815111120465510433892499802",
    //         0,
    //         ethers.parseUnits("0.1", 18),
    //         0
    //     );

    //     console.log('Transaction sent:', swapTx.hash);
    //     const receipt = await swapTx.wait();


    //     console.log('Swap confirmed');
    //     return receipt;

    // } catch (error: any) {
    //     console.log('Swap failed');
    //     if (error.transaction) {
    //         try {
    //             // Replay transaction to get error message
    //             await provider.call(
    //                 {
    //                     from: error.transaction.from,
    //                     to: error.transaction.to,
    //                     data: error.transaction.data,
    //                     value: error.transaction.value,
    //                 }
    //             );
    //         } catch (callError: any) {
    //             if (callError.data && poolContract) {
    //                 try {
    //                     const decodedError = poolContract.interface.parseError(callError.data);
    //                     console.log("Contract error:", decodedError?.name);
    //                     console.log("Error args:", decodedError?.args);
    //                 } catch (decodeError) {
    //                     try {
    //                         const reason = ethers.toUtf8String(callError.data);
    //                         console.log("Revert reason (UTF-8):", reason);
    //                     } catch (utf8Error) {
    //                         console.log("Could not decode error data:", callError.data);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     throw error;
    // }
}

// Execute the function
swapTokens()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
