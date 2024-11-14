// ts-node scripts/approve.ts
require("dotenv").config();
import { ethers } from "ethers";

async function pool() {
  if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
    throw new Error("Missing RPC_URL or PRIVATE_KEY in environment variables");
  }
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const poolAddress = "0xb0652aa552058711ebd49e89d50ff205731a72bf";

  // Pool contract interface - we only need the slot0 function
  const poolABI = [
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  ];

  const poolContract = new ethers.Contract(poolAddress, poolABI, provider);

  // Get slot0 data
  const slot0 = await poolContract.slot0();
  console.log("Slot0 data:");
  console.log("sqrtPriceX96:", slot0.sqrtPriceX96.toString());

  // Calculate price from sqrtPriceX96
  const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96.toString());
  const price = sqrtPriceX96 * sqrtPriceX96;
  console.log("Price:", price.toString());

  console.log("tick:", slot0.tick);
  console.log("observationIndex:", slot0.observationIndex);
  console.log("observationCardinality:", slot0.observationCardinality);
  console.log("observationCardinalityNext:", slot0.observationCardinalityNext);
  console.log("feeProtocol:", slot0.feeProtocol);
  console.log("unlocked:", slot0.unlocked);
}

// Execute the function
pool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
