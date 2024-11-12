//pool: 0xb0652aa552058711ebd49e89d50ff205731a72bf (2 tokens in there)(原本的algebra 不是！)

// ts-node scripts/approve.ts
require("dotenv").config();
import { ethers } from "ethers";

async function approveTokens() {
  if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
    throw new Error("Missing RPC_URL or PRIVATE_KEY in environment variables");
  }
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const spender = "0x7c79453fd5edd2F21b454e1eFce1d42c9C6cDf71";
  const tokenA = "0xaB1e79b421f4Fd6eFa7CC2a815F8217b1EBd1Fb1";
  const tokenB = "0xc449FC4f62a20Ecc79C06799122d44002B925ad8";

  // Create contracts for both tokens
  const tokenAContract = new ethers.Contract(
    tokenA,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) external view returns (uint256)",
    ],
    wallet
  );

  const tokenBContract = new ethers.Contract(
    tokenB,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) external view returns (uint256)",
    ],
    wallet
  );

  // Approve both tokens
  await tokenAContract.approve(spender, ethers.parseUnits("1000", 18));
  await tokenBContract.approve(spender, ethers.parseUnits("1000", 18));

  // Check approve allowances
  const allowanceA = await tokenAContract.allowance(wallet.address, spender);
  const allowanceB = await tokenBContract.allowance(wallet.address, spender);

  console.log("Token A approve allowance:", ethers.formatUnits(allowanceA, 18));
  console.log("Token B approve allowance:", ethers.formatUnits(allowanceB, 18));
}

// Execute the function
approveTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
