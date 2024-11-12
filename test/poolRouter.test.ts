import * as dotenv from "dotenv";
dotenv.config();

import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { PoolRouter, MockERC20 } from "../typechain-types";

const parseEther = ethers.parseEther;

// const POOL_ROUTER_ADDRESS = "0x24c18dcfFf7EA6E40654DA8408DbE8878b0580Fe"; //v1
// const POOL_ROUTER_ADDRESS = "0x583CE60df6F406cA71C988967Fb05aBb360bBBa5"; //v2
// const OWNER_ADDRESS = "0xBC0469bE5109D1652D76CCC726f037fD62bd1f30"; // Replace with actual owner address
const UNISWAP_POOL = "0xb0652aa552058711ebd49e89d50ff205731a72bf"; // Replace with actual pool address
const TOKEN_A = "0xaB1e79b421f4Fd6eFa7CC2a815F8217b1EBd1Fb1"; // Replace with actual token address
const TOKEN_B = "0xc449FC4f62a20Ecc79C06799122d44002B925ad8"; // Replace with actual token address

export async function fixtureSetup() {
  const [deployer] = await ethers.getSigners();
  const blockNumber = 4107574;

  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.RPC_URL,
          blockNumber,
        },
      },
    ],
  });

  // Deploy PoolRouter
  const PoolRouter = await ethers.getContractFactory("PoolRouter");
  const poolRouter = (await PoolRouter.deploy()) as PoolRouter;

  // Get token instances
  const tokenA = (await ethers.getContractAt(
    "MockERC20",
    TOKEN_A
  )) as MockERC20;
  const tokenB = (await ethers.getContractAt(
    "MockERC20",
    TOKEN_B
  )) as MockERC20;

  // Find a whale address that has enough tokens
  const whaleAddress = "0xBC0469bE5109D1652D76CCC726f037fD62bd1f30";

  // Impersonate the whale account
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [whaleAddress],
  });

  // Get the whale signer
  const whale = await ethers.getSigner(whaleAddress);

  // Transfer tokens from whale to deployer
  const amount = parseEther("100");
  await tokenA.connect(whale).transfer(deployer.address, amount);
  await tokenB.connect(whale).transfer(deployer.address, amount);

  // Stop impersonating
  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [whaleAddress],
  });

  return {
    poolRouter,
    tokenA,
    tokenB,
    deployer,
  };
}

describe("PoolRouter", function () {
  describe("Basic Functions", () => {
    it("Should log token balances and deployer address", async function () {
      const { tokenA, tokenB, deployer } = await loadFixture(fixtureSetup);
      console.log("Deployer Address:", deployer.address);

      // Get deployer balances
      const deployerBalanceA = await tokenA.balanceOf(deployer.address);
      const deployerBalanceB = await tokenB.balanceOf(deployer.address);

      // Get pool balances
      const routerBalanceA = await tokenA.balanceOf(UNISWAP_POOL);
      const routerBalanceB = await tokenB.balanceOf(UNISWAP_POOL);

      console.log(
        "Deployer Token A Balance:",
        ethers.formatEther(deployerBalanceA)
      );
      console.log(
        "Deployer Token B Balance:",
        ethers.formatEther(deployerBalanceB)
      );
      console.log(
        "Pool Router Token A Balance:",
        ethers.formatEther(routerBalanceA)
      );
      console.log(
        "Pool Router Token B Balance:",
        ethers.formatEther(routerBalanceB)
      );
    });
    it("Should have correct owner", async function () {
      const { poolRouter, deployer } = await loadFixture(fixtureSetup);
      expect(await poolRouter.owner()).to.equal(deployer.address);
    });

    it("Should execute swapExactTokensForTokens A->B successfully", async function () {
      const { poolRouter, tokenA, tokenB, deployer } = await loadFixture(
        fixtureSetup
      );
      const swapAmount = parseEther("1");
      const minAmountOut = 0;

      await tokenA
        .connect(deployer)
        .approve(poolRouter.getAddress(), swapAmount);

      const initialBalanceA = await tokenA.balanceOf(deployer.address);
      const initialBalanceB = await tokenB.balanceOf(deployer.address);

      console.log("Initial Balance A:", ethers.formatEther(initialBalanceA));
      console.log("Initial Balance B:", ethers.formatEther(initialBalanceB));

      await poolRouter
        .connect(deployer)
        .swapToken0ForToken1(
          tokenA.getAddress(),
          tokenB.getAddress(),
          UNISWAP_POOL,
          swapAmount,
          minAmountOut
        );

      const finalBalanceA = await tokenA.balanceOf(deployer.address);
      const finalBalanceB = await tokenB.balanceOf(deployer.address);

      console.log("Final Balance A:", ethers.formatEther(finalBalanceA));
      console.log("Final Balance B:", ethers.formatEther(finalBalanceB));

      expect(finalBalanceA).to.be.lt(initialBalanceA);
      expect(finalBalanceB).to.be.gt(initialBalanceB);
    });

    it("Should execute swapTokensForExactTokens B->A successfully", async function () {
      const { poolRouter, tokenA, tokenB, deployer } = await loadFixture(
        fixtureSetup
      );
      const exactAmountOut = parseEther("1");
      const maxAmountIn = parseEther("2");

      await tokenB
        .connect(deployer)
        .approve(poolRouter.getAddress(), maxAmountIn);

      const initialBalanceA = await tokenA.balanceOf(deployer.address);
      const initialBalanceB = await tokenB.balanceOf(deployer.address);

      console.log("Initial Balance A:", ethers.formatEther(initialBalanceA));
      console.log("Initial Balance B:", ethers.formatEther(initialBalanceB));

      await poolRouter
        .connect(deployer)
        .swapToken1ForToken0(
          tokenB.getAddress(),
          tokenA.getAddress(),
          UNISWAP_POOL,
          exactAmountOut,
          maxAmountIn
        );

      const finalBalanceA = await tokenA.balanceOf(deployer.address);
      const finalBalanceB = await tokenB.balanceOf(deployer.address);

      console.log("Final Balance A:", ethers.formatEther(finalBalanceA));
      console.log("Final Balance B:", ethers.formatEther(finalBalanceB));

      expect(finalBalanceB).to.be.lt(initialBalanceB);
      expect(finalBalanceA).to.be.gt(initialBalanceA);
    });
  });
});
