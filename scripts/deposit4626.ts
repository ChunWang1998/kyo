// ts-node scripts/deposit4626.ts
require('dotenv').config();
const ethers = require('ethers');

async function depositToContract() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // const tokenAddress = '0xa17d561a07b0CE487552DAe2d80D9D0cf1b5be66'; //btc
    // const contractAddress = '0xaB1e79b421f4Fd6eFa7CC2a815F8217b1EBd1Fb1'; //btc

    const tokenAddress = '0xDcfcC99c5e18b22B90aF30021586161834a21642'; //bbn
    const contractAddress = '0xc449FC4f62a20Ecc79C06799122d44002B925ad8'; //bbn

    // Add ERC20 token ABI
    const tokenAbi = [
        "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    
    const vaultAbi = [
        "function deposit(uint256 assets, address receiver) external returns (uint256 shares)"
    ];

    // Create contract instances
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);
    const vaultContract = new ethers.Contract(contractAddress, vaultAbi, wallet);

    try {
        const amountToDeposit = ethers.parseEther("1000");
        
        // First approve the vault to spend tokens
        console.log('Approving tokens...');
        const approveTx = await tokenContract.approve(contractAddress, amountToDeposit);
        await approveTx.wait();
        console.log('Approval confirmed');
        
        // Then proceed with deposit
        console.log('Depositing tokens...');
        const depositTx = await vaultContract.deposit(
            amountToDeposit,
            wallet.address
        );

        console.log('Transaction sent:', depositTx.hash);
        const receipt = await depositTx.wait();
        console.log('Transaction confirmed');
        
        return receipt;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Execute the function
depositToContract()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
