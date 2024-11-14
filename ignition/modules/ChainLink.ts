import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChainLinkModule = buildModule("ChainLink", (m) => {
  const chainlinkConsumer = m.contract("ChainlinkPriceFeedConsumer", [
    "0x5af8c50f19b8e750377713c9810678140318ba90",
    "0xCA50964d2Cf6366456a607E5e1DBCE381A8BA807",
  ]);
  return { chainlinkConsumer };
});

export default ChainLinkModule;
