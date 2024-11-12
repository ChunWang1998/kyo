import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PoolModule = buildModule("PoolModule", (m) => {
  const pool = m.contract("Pool");
  const account0 = m.getAccount(0);

//   m.call(pool, "swap", [
//     "0xb0652aa552058711ebd49e89d50ff205731a72bf", // Example Uniswap V3 pool address
//     "0xBC0469bE5109D1652D76CCC726f037fD62bd1f30", 
//     true, // zeroForOne
//     "79228162514264337593543950336",  // example sqrtPriceX96
//     "1000000000000000000", // amountSpecified (1 token with 18 decimals)
//     "1000000000000000000", // pay0
//     "0" // pay1
//   ]);

  return { pool };
});

export default PoolModule;
