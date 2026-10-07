import { defineConfig } from "hardhat/config";
import toolbox from "@nomicfoundation/hardhat-toolbox-viem";
export default defineConfig({
  plugins: [toolbox],
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "cancun" }
  },
  networks: {
    hardhatMainnet: { type: "edr-simulated", chainType: "l1", chainId: 31337 },
    arcTestnet: { type: "http", chainType: "l1", chainId: 5042002, url: "https://rpc.testnet.arc.io", accounts: [] },
    arc: { type: "http", chainType: "l1", chainId: 5042, url: "https://rpc.mainnet.arc.io", accounts: [] }
  }
});
