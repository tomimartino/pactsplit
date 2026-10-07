# Arc Microgrants submission worksheet

**Status: ready for the builder's submission; not submitted. Mainnet deployment, verified source, and successful payment proof are confirmed. The builder confirmed this project has not received prior Circle/Arc funding.**

## Project

PactSplit — One invoice. Every teammate paid.

PactSplit helps independent creative teams invoice a client together. The team agrees on each member's share, publishes one immutable invoice, and sends one payment link. The client's native USDC payment is atomically distributed to up to five receiving wallets. Every recipient share belongs to the same successful transaction, so nobody has to receive the whole payment and forward the team's money manually.

Arc makes USDC the native currency for both payment and gas. PactSplit uses native value transfers, avoiding ERC-20 approval steps, and uses Arc contract state and its own settlement events for a publicly verifiable breakdown. The MVP focuses on direct settlement, clear recipient information, no platform fee, and a checkout that can be opened independently from the creator's browser.

## Links and proof to complete

- Mainnet website: https://pactsplit.vercel.app (chain 5042; verified PactSplit contract configured).
- Working testnet website: https://pactsplit-testnet.vercel.app (verified Arc Testnet contract configured).
- Verified testnet contract: https://explorer.testnet.arc.io/address/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C?tab=contract. Deployment block 65927636; see [deployment evidence](DEPLOYMENT.md).
- Completed testnet rehearsal: [invoice #2](https://pactsplit-testnet.vercel.app/pay/5042002/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C/2), [confirmed 10-USDC payment with 6/3/1 payouts](https://explorer.testnet.arc.io/tx/0x6ad1d0a5a148ff93e7dbe7ee2bcd86dc01ff2fca12de15c66c0f25377d590e45).
- Public GitHub repository: https://github.com/tomimartino/pactsplit.
- Public builder profile: https://github.com/tomimartino.
- Verified Arc mainnet contract: https://explorer.arc.io/address/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C?tab=contract. Deployment block 24698982.
- Mainnet deployment transaction: https://explorer.arc.io/tx/0xbb6f2a732bb711cf3e6ae73977cbb4931a7991d7da65cfc1bdd02925e2b95710.
- Confirmed mainnet invoice #1: https://pactsplit.vercel.app/pay/5042/0xd4D494B83e59071f4D82de1c126E653dD05A4F1C/1.
- Mainnet payment receipt: https://explorer.arc.io/tx/0x85a489a6e041fa83dd55c261ab1998c98efe9131eeaa9a9b9815e700460441cd. A 0.10-USDC payment distributed 0.06 / 0.03 / 0.01 USDC to three distinct wallets. This builder-run rehearsal was created and paid by the same wallet; a fresh browser independently read the receipt.
- Short demo: optional 90–120 second recording showing creation, independent client payment, 60/30/10 receipt, and explorer.

## Demonstration sequence

1. Show a project with developer 60%, designer 30%, writer 10%. Use 10 test USDC for rehearsal or 0.10 real USDC for a small mainnet demo.
2. Publish and copy the single invoice link.
3. Open the link from the client's own browser/wallet.
4. Pay once and show the successful receipt.
5. Show three shares in the same transaction: 6/3/1 test USDC for rehearsal, or 0.06/0.03/0.01 real USDC for the small mainnet demo. Then show the verified contract on the corresponding Arc explorer.

Use test funds while rehearsing. Do not present the local or testnet receipt as a mainnet receipt.

## Remaining submission requirements

- [x] Contract deployed on Arc mainnet; RPC read and invoice simulation pass.
- [x] Verified public contract source on Arc mainnet.
- [x] Hosted website using the same mainnet chain and trusted contract; browser setup displays chain 5042 and block 24698982.
- [x] Public source repository and builder profile.
- [x] Checked live mainnet invoice and confirmed mainnet payout receipt, matching every recipient event and total.
- [x] Builder confirmed on October 7, 2026 that this project has not received prior Circle/Arc funding. Program screening and final eligibility decisions remain with the organizer.
- [ ] Submit the completed build through the official DoraHacks program page.

Program deadline rechecked on October 7, 2026: October 14, 2026, 23:59 ET (October 15, 2026, 10:59 WIB). Recheck the official page before submitting.
