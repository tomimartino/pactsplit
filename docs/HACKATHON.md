# Arc Microgrants submission worksheet

**Status: not submitted; mainnet proof is pending.**

## Project

PactSplit — One invoice. Every teammate paid.

PactSplit helps independent creative teams invoice a client together. The team agrees on each member's share, publishes one immutable invoice, and sends one payment link. The client's native USDC payment is atomically distributed to up to five receiving wallets. Every recipient share belongs to the same successful transaction, so nobody has to receive the whole payment and forward the team's money manually.

Arc makes USDC the native currency for both payment and gas. PactSplit uses native value transfers, avoiding ERC-20 approval steps, and uses Arc contract state and its own settlement events for a publicly verifiable breakdown. The MVP focuses on direct settlement, clear recipient information, no platform fee, and a checkout that can be opened independently from the creator's browser.

## Links and proof to complete

- Mainnet setup: https://pactsplit.vercel.app/setup (chain 5042; contract deployment pending).
- Working testnet website: https://pactsplit-testnet.vercel.app (verified Arc Testnet contract configured).
- Verified testnet contract: https://explorer.testnet.arc.io/address/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C?tab=contract. Deployment block 65927636; see [deployment evidence](DEPLOYMENT.md).
- Completed testnet rehearsal: [invoice #2](https://pactsplit-testnet.vercel.app/pay/5042002/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C/2), [confirmed 10-USDC payment with 6/3/1 payouts](https://explorer.testnet.arc.io/tx/0x6ad1d0a5a148ff93e7dbe7ee2bcd86dc01ff2fca12de15c66c0f25377d590e45).
- Public GitHub repository: https://github.com/tomimartino/pactsplit.
- Public builder profile: https://github.com/tomimartino.
- Arc mainnet contract: fill only after deployment and source verification.
- Deployment transaction: fill with actual explorer URL.
- Mainnet sample invoice: fill with a working PactSplit checkout link.
- Mainnet payment receipt: fill with confirmed explorer URL.
- Short demo: optional 90–120 second recording showing creation, independent client payment, 60/30/10 receipt, and explorer.

## Demonstration sequence

1. Show a 10-USDC project with developer 60%, designer 30%, writer 10%.
2. Publish and copy the single invoice link.
3. Open the link from the client's own browser/wallet.
4. Pay once and show the successful receipt.
5. Show three shares of 6/3/1 in the same transaction, then show the contract on the Arc explorer.

Use test funds while rehearsing. Do not present the local or testnet receipt as a mainnet receipt.

## Remaining submission requirements

- [ ] Working deployment on Arc mainnet, not only local/testnet.
- [ ] Verified public contract source on Arc mainnet.
- [ ] Hosted website using the same mainnet chain and trusted contract.
- [x] Public source repository and builder profile.
- [ ] Checked live mainnet invoice and confirmed mainnet payout receipt.
- [ ] Builder confirms eligibility, including any prior Circle/Arc funding for this same project.
- [ ] Submit the completed build through the official DoraHacks program page.

Program deadline observed in the program listing: October 14, 2026, 23:59 ET (October 15, 2026, 10:59 WIB). Recheck the official page before submitting.
