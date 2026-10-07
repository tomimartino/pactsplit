# PactSplit deployment evidence

## Arc Testnet

| Field | Confirmed value |
| --- | --- |
| Chain ID | 5042002 |
| Contract | `0xd4D494B83e59071f4D82de1c126E653dD05A4F1C` |
| Deployment block | 65927636 |
| Deployment transaction | `0xf487250d564f7d4d4effc8bab93d26cf67800d12f923f6cbce13fa62591fbfbb` |
| Deployment time | October 7, 2026, 14:08:23 WIB |
| Compiler | Solidity 0.8.28+commit.7893614a |
| EVM / optimizer | Cancun / enabled, 200 runs |
| License | MIT |
| Runtime code hash | `0xed378926cb51b99cbb0a92198f3b388f203b0e67d87decf1f7d5d7251444c7de` |

[Verified contract source](https://explorer.testnet.arc.io/address/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C?tab=contract) · [Successful deployment transaction](https://explorer.testnet.arc.io/tx/0xf487250d564f7d4d4effc8bab93d26cf67800d12f923f6cbce13fa62591fbfbb) · [Website setup](https://pactsplit.vercel.app/setup)

The public Arc RPC confirmed the chain ID and successful creation receipt in the supplied block. The deployment input and deployed runtime bytecode exactly match the local PactSplit artifact. The explorer's verified source and ABI also exactly match the repository contract and artifact.

Read calls confirmed `MAX_RECIPIENTS = 5`, `AMOUNT_STEP = 10^16`, and an initially empty invoice history. A read-only simulation of `createInvoice` for a 10-test-USDC invoice with two recipients returned the next invoice ID; the invoice count stayed unchanged. This simulation did not publish an invoice or move funds.

The website uses these public configuration values in Vercel Production and Preview:

```dotenv
NEXT_PUBLIC_PACTSPLIT_CHAIN_ID=5042002
NEXT_PUBLIC_PACTSPLIT_ADDRESS=0xd4D494B83e59071f4D82de1c126E653dD05A4F1C
NEXT_PUBLIC_PACTSPLIT_DEPLOYMENT_BLOCK=65927636
```

## Remaining proof

- Publish an actual testnet invoice through the builder's browser wallet.
- Open it from an independent client wallet, pay test USDC, and confirm every recipient's transfer in the same successful transaction.
- Deploy and verify on Arc mainnet, configure the website for that deployment, and repeat the flow before submitting to Arc Microgrants.

Testnet source verification is public code verification, not an independent security audit or proof of a completed payment flow.
