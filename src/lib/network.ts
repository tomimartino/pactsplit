import { createPublicClient, defineChain, http, isAddress, type Address } from 'viem';
const chainId = Number(process.env.NEXT_PUBLIC_PACTSPLIT_CHAIN_ID || 5042002);
const networks = {
  5042: defineChain({id:5042, name:'Arc', nativeCurrency:{name:'USDC',symbol:'USDC',decimals:18},rpcUrls:{default:{http:['https://rpc.mainnet.arc.io']}},blockExplorers:{default:{name:'Arc Explorer',url:'https://explorer.arc.io'}}}),
  5042002: defineChain({id:5042002, name:'Arc Testnet', nativeCurrency:{name:'USDC',symbol:'USDC',decimals:18},rpcUrls:{default:{http:['https://rpc.testnet.arc.io']}},blockExplorers:{default:{name:'Arc Testnet Explorer',url:'https://explorer.testnet.arc.io'}},testnet:true}),
  31337: defineChain({id:31337, name:'Local test chain', nativeCurrency:{name:'Test USDC',symbol:'USDC',decimals:18},rpcUrls:{default:{http:['http://127.0.0.1:8545']}},testnet:true})
};
export const chain = networks[chainId as keyof typeof networks];
if (!chain) throw new Error('Unsupported PactSplit chain ID.');
export const isLocal = chain.id === 31337;
export const isMainnet = chain.id === 5042;
const rawAddress = process.env.NEXT_PUBLIC_PACTSPLIT_ADDRESS || '';
export const contractAddress: Address | undefined = isAddress(rawAddress) && !/^0x0{40}$/i.test(rawAddress) ? rawAddress : undefined;
export const trustedContracts = [contractAddress, ...(process.env.NEXT_PUBLIC_PACTSPLIT_PREVIOUS_ADDRESSES || '').split(',').filter(a=>isAddress(a))].filter(Boolean) as Address[];
export const deploymentBlock = BigInt(process.env.NEXT_PUBLIC_PACTSPLIT_DEPLOYMENT_BLOCK || '0');
export const publicClient = createPublicClient({chain,transport:http(undefined,{timeout:15000,retryCount:2})});
export const explorerTx = (hash: string) => chain.blockExplorers ? `${chain.blockExplorers.default.url}/tx/${hash}` : undefined;
export const explorerAddress = (address: string) => chain.blockExplorers ? `${chain.blockExplorers.default.url}/address/${address}` : undefined;
export function invoicePath(id: bigint | string, address = contractAddress): string {
  if (!address) throw new Error('Contract is not configured.');
  return `/pay/${chain.id}/${address}/${id}`;
}
export function validateInvoiceLink(chainParam: string, address: string, id: string): {address:Address;id:bigint} {
  if (chainParam !== String(chain.id)) throw new Error('This invoice belongs to a different network. Open the original PactSplit site for that network.');
  if (!isAddress(address) || !trustedContracts.some(a=>a.toLowerCase()===address.toLowerCase())) throw new Error('This invoice uses an unsupported contract. Check the link with the sender.');
  if (!/^[1-9]\d{0,77}$/.test(id) || BigInt(id) >= 2n ** 256n) throw new Error('Invalid invoice number.');
  return {address,id:BigInt(id)};
}
