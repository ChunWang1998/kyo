import { ethers } from "ethers";

async function logFailedTransaction(txHash: string) {
    const provider = new ethers.JsonRpcProvider("https://soneium-minato.rpc.scs.startale.com?apikey=bz3a6ANdNm2brS1S3eysAALhqWcgtbcW");
    
    try {
        // 獲取交易詳情
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            throw new Error("Transaction not found");
        }

        // 獲取交易收據
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            throw new Error("Transaction receipt not found");
        }

        // 如果交易失敗，嘗試模擬交易以獲取錯誤信息
        if (!receipt.status) {
            try {
                // 重放交易以獲取錯誤信息
                await provider.call(
                    {
                        from: tx.from,
                        to: tx.to,
                        data: tx.data,
                        value: tx.value,
                    }
                );
            } catch (error: any) {
                console.log("Transaction Failed!");
                console.log("Error details:");
                console.log(error.message);
                
                // 如果是 Solidity revert，嘗試解碼錯誤信息
                if (error.data) {
                    const reason = ethers.toUtf8String(error.data);
                    console.log("Revert reason:", reason);
                }
            }
        }

        // 打印交易基本信息
        console.log("\nTransaction Details:");
        console.log("From:", tx.from);
        console.log("To:", tx.to);
        console.log("Gas Used:", receipt.gasUsed.toString());
        console.log("Block Number:", receipt.blockNumber);
        console.log("Status:", receipt.status ? "Success" : "Failed");

    } catch (error) {
        console.error("Error fetching transaction details:", error);
    }
}

// 使用示例
const txHash = "0x0d847c6fa355b5c4bf39ff1d925e746cef8c8daeb73399e3775d7c030cfd3ae6";
logFailedTransaction(txHash)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });