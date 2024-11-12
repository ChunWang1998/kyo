import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PoolRouterModule = buildModule("PoolRouter", (m) => {
  const poolRouter = m.contract("PoolRouter", []);

  return { poolRouter };
});

export default PoolRouterModule;
