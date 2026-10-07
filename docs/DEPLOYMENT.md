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

[Verified contract source](https://explorer.testnet.arc.io/address/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C?tab=contract) · [Successful deployment transaction](https://explorer.testnet.arc.io/tx/0xf487250d564f7d4d4effc8bab93d26cf67800d12f923f6cbce13fa62591fbfbb) · [Testnet setup](https://pactsplit-testnet.vercel.app/setup)

The public Arc RPC confirmed the chain ID and successful creation receipt in the supplied block. The deployment input and deployed runtime bytecode exactly match the local PactSplit artifact. The explorer's verified source and ABI also exactly match the repository contract and artifact.

Read calls confirmed `MAX_RECIPIENTS = 5`, `AMOUNT_STEP = 10^16`, and an initially empty invoice history. A read-only simulation of `createInvoice` for a 10-test-USDC invoice with two recipients returned the next invoice ID; the invoice count stayed unchanged. This simulation did not publish an invoice or move funds.

The archived testnet deployment was built with these public configuration values:

```dotenv
NEXT_PUBLIC_PACTSPLIT_CHAIN_ID=5042002
NEXT_PUBLIC_PACTSPLIT_ADDRESS=0xd4D494B83e59071f4D82de1c126E653dD05A4F1C
NEXT_PUBLIC_PACTSPLIT_DEPLOYMENT_BLOCK=65927636
```

## Confirmed testnet payment

[Invoice #2: Website Catalog](https://pactsplit-testnet.vercel.app/pay/5042002/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C/2) is paid. The [payment transaction](https://explorer.testnet.arc.io/tx/0x6ad1d0a5a148ff93e7dbe7ee2bcd86dc01ff2fca12de15c66c0f25377d590e45) succeeded at block 65929445 and sent 10 native test USDC into PactSplit.

| Recipient role | Share | Confirmed payout |
| --- | --- | --- |
| Developer | 60% | 6 test USDC |
| Designer | 30% | 3 test USDC |
| Copywriter | 10% | 1 test USDC |

The transaction contains three `RecipientPaid` events and one `InvoicePaid` event for invoice #2. Each payout matches its invoice recipient and agreed share, their sum equals the transaction value, and contract state records status `Paid` with the same payment block. A fresh browser session displayed the same receipt and explorer transaction link without connecting a wallet.

The builder's wallet both created and paid this rehearsal invoice. Invoice #1 was also published and then cancelled; its public checkout correctly disables payment. Missing invoice links display a plain-language error.

## Arc Mainnet

| Field | Confirmed value |
| --- | --- |
| Chain ID | 5042 |
| Contract | `0xd4D494B83e59071f4D82de1c126E653dD05A4F1C` |
| Deployment block | 24698982 |
| Deployment transaction | `0xbb6f2a732bb711cf3e6ae73977cbb4931a7991d7da65cfc1bdd02925e2b95710` |
| Deployment time | October 7, 2026, 15:02:41 WIB |
| Gas used | 1,262,364 |
| Actual deployment fee | 0.02524728592048716 USDC |
| Source verification | Blockscout Bytecode Database, exact match |
| Compiler / EVM / optimizer | Solidity 0.8.28+commit.7893614a / Cancun / 200 runs |

[Verified mainnet contract](https://explorer.arc.io/address/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C?tab=contract) · [Successful mainnet deployment](https://explorer.arc.io/tx/0xbb6f2a732bb711cf3e6ae73977cbb4931a7991d7da65cfc1bdd02925e2b95710) · [Mainnet setup](https://pactsplit.vercel.app/setup)

The Arc mainnet RPC confirmed successful contract creation in the supplied block. Creation input and deployed runtime bytecode match the reviewed PactSplit build. The explorer automatically verified the exact bytecode match against its database; its source code and ABI exactly match the repository source and artifact. The contract address is the same on testnet and mainnet, but their chain IDs, blocks, invoices, and funds are independent.

Read calls confirmed the expected constants and an initially empty invoice history. A read-only simulation created a 0.10-USDC invoice with the same three recipient wallets and a 60/30/10 split; it returned the next invoice ID while the onchain invoice count stayed unchanged. A missing invoice read produced the expected plain-language error. These checks sent no transactions or funds.

Vercel Production and Preview are configured with:

```dotenv
NEXT_PUBLIC_PACTSPLIT_CHAIN_ID=5042
NEXT_PUBLIC_PACTSPLIT_ADDRESS=0xd4D494B83e59071f4D82de1c126E653dD05A4F1C
NEXT_PUBLIC_PACTSPLIT_DEPLOYMENT_BLOCK=24698982
```

The confirmed testnet build remains at [pactsplit-testnet.vercel.app](https://pactsplit-testnet.vercel.app), bound to its original immutable deployment. Mainnet builds redirect existing testnet invoice links there, where the original contract and invoice validation still apply. Hosting and development tools remain free; the builder approved using real USDC for mainnet network fees and demo payments.

## Remaining mainnet payment proof

- Publish a small mainnet invoice, use a separate client wallet to pay it, and confirm the receipt and every recipient payout. A 0.10-USDC demo with 60/30/10 shares distributes 0.06 / 0.03 / 0.01 USDC, plus network fees.
- Complete the remaining submission evidence before applying to [Arc Microgrants](https://dorahacks.io/hackathon/arc-microgrants/detail#arc-microgrants).

Source verification is public code verification, not an independent security audit. The completed testnet payment above is not a mainnet payment.
