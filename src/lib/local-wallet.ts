import type { EIP1193Provider } from "viem";
// Local Hardhat's public test accounts only. Never enabled on Arc or a hosted site.
let selected = 0;
export const localAccountIndex = () => selected;
const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
export const localWallet: EIP1193Provider = {
  async request({ method, params }) {
    if (
      typeof window === "undefined" ||
      !["localhost", "127.0.0.1"].includes(window.location.hostname)
    )
      throw new Error("Local test wallet is only available on localhost.");
    const rpc = async (m: string, p: unknown = []) => {
      const res = await fetch("http://127.0.0.1:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: m, params: p }),
      });
      const json = await res.json();
      if (json.error)
        throw Object.assign(new Error(json.error.message), {
          code: json.error.code,
        });
      return json.result;
    };
    if (method === "eth_requestAccounts" || method === "eth_accounts")
      return [(await rpc("eth_accounts"))[selected]];
    if (method === "wallet_switchEthereumChain") {
      if ((params as [{ chainId: string }])[0].chainId !== "0x7a69")
        throw new Error("Local test wallet cannot use another network.");
      return null;
    }
    return rpc(method, params);
  },
  on(event, listener) {
    const set = listeners.get(event) || new Set();
    set.add(listener as (...args: unknown[]) => void);
    listeners.set(event, set);
  },
  removeListener(event, listener) {
    listeners.get(event)?.delete(listener as (...args: unknown[]) => void);
  },
} as EIP1193Provider;
export async function selectLocalAccount(index: number) {
  if (!Number.isInteger(index) || index < 0 || index > 4)
    throw new Error("Invalid local account.");
  selected = index;
  const accounts = await localWallet.request({ method: "eth_accounts" });
  listeners.get("accountsChanged")?.forEach((listener) => listener(accounts));
}
