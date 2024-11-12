import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    minato:{
      url: "https://soneium-minato.rpc.scs.startale.com?apikey=bz3a6ANdNm2brS1S3eysAALhqWcgtbcW",
      chainId: 1946,
      accounts: ["7807184c87f5a3370a8782d1323d86f97637736bef384037952828293cefae13"]
    }
  },
  etherscan: {
    apiKey: {
      minato: "https://soneium-minato.blockscout.com/api",
    },
    customChains: [
      {
        network: "minato",
        chainId: 1946,
        urls: {
          apiURL: "https://soneium-minato.blockscout.com/api",
          browserURL: "https://explorer-testnet.soneium.org"
        },
      }
    ],
  },
};

export default config;
