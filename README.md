# PactSplit

**One invoice. Every teammate paid.**

[Website](https://pactsplit.vercel.app) · [Public source](https://github.com/tomimartino/pactsplit) · [Wallet setup](https://pactsplit.vercel.app/setup)

PactSplit gives freelance teams a shared invoice. A client pays native USDC once on Arc; an immutable contract forwards the agreed shares to up to five wallets in the same transaction.

## Current status

- Working web app: landing page, interactive demo, wallet workspace, invoice form, public checkout, confirmed receipt, cancellation, and wallet-based contract setup.
- Contract compiled with Solidity 0.8.28; 14 contract tests and 4 amount tests pass.
- Browser flow verified against a real local EVM: publish a 10-test-USDC invoice, pay from a separate client account, distribute 6/3/1, and render its receipt.
- **Arc testnet/mainnet contract deployment and verification still require the builder's wallet. Local tests do not prove Arc-specific behavior.** The hosted site defaults to Arc testnet and disables transactions until its deployed contract is configured.
- The `/demo` page is an illustration, not a payment or blockchain transaction.

## Free-first stack

| Component | Choice | Cost for the prototype |
| --- | --- | --- |
| App | Next.js, React, TypeScript, Tailwind CSS | Open source |
| Wallet and RPC | wagmi, viem, injected browser wallet, public Arc RPC | No paid wallet/API subscription |
| Contract | Solidity, OpenZeppelin, Hardhat | Open source |
| Hosting | Vercel Hobby with a `vercel.app` subdomain | Free within Hobby limits; personal/noncommercial use |
| Source | Public GitHub repository | Free |
| Draft storage | Versioned browser localStorage, scoped to wallet and chain | Free |
| Invoice data | Arc contract state and events | Network fees on the chosen chain |
| Testing funds | Official Circle/Arc testnet faucet | Free test funds |

Supabase is intentionally unnecessary for this MVP. A database can be introduced when account profiles, private attachments, or notifications require one. No analytics, paid APIs, AI service, custom domain, WalletConnect account, or paid add-on is needed.

**Mainnet is not completely free:** native USDC pays transaction fees, and a real payment transfers real USDC. Testnet and local tests use valueless funds.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run contracts:compile
npm test
npm run contracts:test
npm run dev
```

Without environment configuration, the site shows Arc testnet and allows a draft and the interactive demo. It will not invent a deployment address.

### Complete free local payment flow

1. Run `npm run local:chain` in one terminal. It listens on `127.0.0.1:8545`.
2. Run `npm run local:deploy` in another terminal. This creates a local contract and writes public configuration to the ignored `.env.local` file.
3. Run or restart `npm run dev`. Open `http://localhost:3000/invoices/new`.
4. Choose **Use local test wallet**, then **Fill local test example** and **Publish invoice**.
5. On checkout, select **Client wallet** and pay the 10 test USDC.
6. Confirm the receipt, then use **Creator wallet** to view the published invoice in Overview.

The local wallet forwards requests to unlocked Hardhat test accounts. It is only enabled for chain 31337 on localhost. It contains no mainnet key and must not be configured on Vercel. Restarting the local chain resets its state.

## Deploy to Arc and Vercel

See [SETUP.md](docs/SETUP.md). The browser `/setup` page deploys the compiled contract through the user's own wallet. It never asks for a private key or seed phrase.

To prepare the explorer's Solidity standard JSON input, run `node scripts/export-verification.mjs` after compiling. It writes `work/verification-standard-input.json` with the exact compiler source names and settings used for deployment.

Public environment variables:

```dotenv
NEXT_PUBLIC_PACTSPLIT_CHAIN_ID=5042002
NEXT_PUBLIC_PACTSPLIT_ADDRESS=<confirmed deployed address>
NEXT_PUBLIC_PACTSPLIT_DEPLOYMENT_BLOCK=<deployment block>
NEXT_PUBLIC_PACTSPLIT_PREVIOUS_ADDRESSES=
```

For Arc mainnet, use chain ID `5042` after actually deploying there. Local development uses `31337`. Set these values on Vercel and redeploy; `NEXT_PUBLIC_` variables are bundled at build time.

Invoice links include chain, trusted contract address, and invoice ID: `/pay/<chain>/<contract>/<id>`. Only configured current or previous PactSplit contract addresses on the selected chain are accepted. An address in a URL cannot change the trusted deployment set. Previous deployments must be reviewed, added to `NEXT_PUBLIC_PACTSPLIT_PREVIOUS_ADDRESSES`, and retained to keep their payment links working.

## Contract rules

- Native USDC: 18 decimal units. No ERC-20 allowance or approval is used.
- Positive total between 0.01 and 1,000,000 USDC, in exact cents.
- 1–5 distinct, nonzero receiving wallets. The contract itself cannot be a recipient.
- Positive percentage shares in basis points totaling exactly 10,000 (100%).
- Bounded, public project title, teammate names, and roles. Do not include confidential data.
- Invoice data is immutable. Only its creator can cancel an unpaid invoice.
- Payment requires the exact total. A paid or cancelled invoice rejects payment.
- State changes precede recipient calls; reentrancy is guarded. Failure of any recipient rolls back the entire payment. Gas may still be charged.
- Integer allocation assigns any residual smallest unit to the final recipient. The UI uses the identical rule with bigint, never floating-point currency math.
- Owner invoice history is bounded and paginated. Receipts use PactSplit events from the paid block, avoiding native/ERC-20 double counting.
- No admin, upgrade authority, platform fee, or invoice balance withdrawal function. Successful invoice value is forwarded immediately. Forced donations are outside the invoice flow and cannot be withdrawn.

The website simulates before submitting, waits for a successful receipt, and saves pending hashes to prevent accidental resubmission. A public payment page reads its financial data from the configured contract, independent of the creator's browser storage.

## Validation

```sh
npm run typecheck
npm test
npm run contracts:test
npm run build
```

Contract tests cover the happy flow, one-time settlement, exact value, missing invoices, authorization, cancelled/paid invoices, bounds, duplicates, metadata, atomic rejection, reentrancy, conservation across 25 varied splits, and paginated history. UI amount tests cover 18-decimal units, fractional percentages, invalid inputs, and smallest-unit conservation.

Hardhat's local EVM does not model all Arc restrictions, including blocklisted recipient behavior. Before submission, test on Arc testnet and mainnet using two independent browser sessions and verify the source on the relevant explorer. This prototype has not received an independent security audit.

## Hackathon readiness

The [submission worksheet](docs/HACKATHON.md) identifies the remaining proof and links. A local or testnet demo alone is not ready for Arc Microgrants submission; a working Arc mainnet deployment is required.

## Official references

- [Arc network configuration](https://docs.arc.io/arc/references/connect-to-arc)
- [Arc EVM differences](https://docs.arc.io/arc/references/evm-differences)
- [Arc deployment guide](https://docs.arc.io/arc/tutorials/deploy-on-arc)
- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Arc Microgrants](https://dorahacks.io/hackathon/arc-microgrants/detail#arc-microgrants)

MIT license.
