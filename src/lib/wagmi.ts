import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { chain, isLocal } from "./network";
import { localWallet } from "./local-wallet";
export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    injected(),
    ...(isLocal
      ? [
          injected({
            target: {
              id: "pactsplit-local",
              name: "Local test wallet",
              provider: () => localWallet,
            },
          }),
        ]
      : []),
  ],
  transports: {
    5042: http("https://rpc.mainnet.arc.io"),
    5042002: http("https://rpc.testnet.arc.io"),
    31337: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
