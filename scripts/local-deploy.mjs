import { readFile, writeFile } from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from "viem";
const chain = defineChain({
  id: 31337,
  name: "PactSplit local test chain",
  nativeCurrency: { name: "Test USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});
const transport = http("http://127.0.0.1:8545");
const publicClient = createPublicClient({ chain, transport });
const wallet = createWalletClient({ chain, transport });
const [account] = await wallet.getAddresses();
if ((await publicClient.getChainId()) !== 31337)
  throw new Error("This script only deploys to local chain 31337.");
const { abi, bytecode } = JSON.parse(
  await readFile(
    new URL("../public/deployment-artifact.json", import.meta.url),
    "utf8",
  ),
);
const hash = await wallet.deployContract({ account, abi, bytecode });
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success" || !receipt.contractAddress)
  throw new Error("Deployment failed.");
await writeFile(
  new URL("../.env.local", import.meta.url),
  `NEXT_PUBLIC_PACTSPLIT_CHAIN_ID=31337\nNEXT_PUBLIC_PACTSPLIT_ADDRESS=${receipt.contractAddress}\nNEXT_PUBLIC_PACTSPLIT_DEPLOYMENT_BLOCK=${receipt.blockNumber}\n`,
);
console.log(
  `Local contract deployed at ${receipt.contractAddress}. Start or restart the web app.`,
);
