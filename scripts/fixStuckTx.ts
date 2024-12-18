// ts-node scripts/fixStuckTx.ts
require("dotenv").config();
import { ethers } from "ethers";

async function replaceStuckTransaction() {
    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
        throw new Error("Missing RPC_URL or PRIVATE_KEY in environment variables");
    }
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // 獲取卡住的交易的 nonce
    const stuckNonce = 7604; // 替換成卡住交易的 nonce

    try {
        // 構建新交易
        const tx = {
            to: wallet.address,   // 發給自己
            value: 0,            // 0 ETH
            nonce: stuckNonce,
            gasLimit: 21000,     // 基本 gas limit
            gasPrice: ethers.parseUnits('500', 'gwei'),  // 設置更高的 gas price
        };

        // 發送交易
        const response = await wallet.sendTransaction(tx);
        console.log('New transaction hash:', response.hash);

        // 等待交易確認
        const receipt = await response.wait();
        // console.log('Transaction confirmed in block:', receipt.blockNumber);
    } catch (error) {
        console.error('Error:', error);
    }
}

replaceStuckTransaction();