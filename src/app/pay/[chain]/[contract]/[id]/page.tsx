"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LogoMark, Check, Arrow, Icon } from "@/components/icons";
import { WalletButton } from "@/components/wallet-button";
import { SplitPreview } from "@/components/split-preview";
import { TransactionStatus } from "@/components/transaction-status";
import {
  chain,
  isMainnet,
  publicClient,
  validateInvoiceLink,
  explorerTx,
  explorerAddress,
} from "@/lib/network";
import { allocation, shortAddress, formatMoney } from "@/lib/amounts";
import { useTransaction } from "@/lib/transactions";
import { friendlyError } from "@/lib/errors";
import { pactSplitAbi } from "@/generated/pactsplit";
export default function Checkout() {
  const params = useParams<{ chain: string; contract: string; id: string }>();
  const { address } = useAccount();
  const { data: wallet } = useWalletClient();
  const [copied, setCopied] = useState(false);
  const [cancelArmed, setCancelArmed] = useState(false);
  let parsed: ReturnType<typeof validateInvoiceLink> | undefined;
  let linkError = "";
  try {
    parsed = validateInvoiceLink(params.chain, params.contract, params.id);
  } catch (e) {
    linkError = friendlyError(e);
  }
  const invoice = useQuery({
    queryKey: ["invoice", params.chain, params.contract, params.id],
    enabled: !!parsed,
    queryFn: () =>
      publicClient.readContract({
        address: parsed!.address,
        abi: pactSplitAbi,
        functionName: "getInvoice",
        args: [parsed!.id],
      }),
    refetchInterval: 15000,
  });
  const inv = invoice.data;
  const receipt = useQuery({
    queryKey: [
      "receipt",
      params.contract,
      params.id,
      inv?.paidBlock?.toString(),
    ],
    enabled: !!parsed && inv?.status === 1,
    queryFn: async () => {
      const logs = await publicClient.getContractEvents({
        address: parsed!.address,
        abi: pactSplitAbi,
        eventName: "InvoicePaid",
        args: { id: parsed!.id },
        fromBlock: inv!.paidBlock,
        toBlock: inv!.paidBlock,
        strict: true,
      });
      return logs[0]?.transactionHash;
    },
  });
  const payTx = useTransaction(
    `pay:${params.contract}:${params.id}`,
    async () => {
      await invoice.refetch();
    },
  );
  const cancelTx = useTransaction(
    `cancel:${params.contract}:${params.id}`,
    async () => {
      await invoice.refetch();
      setCancelArmed(false);
    },
  );
  const owner = inv && address?.toLowerCase() === inv.creator.toLowerCase();
  async function pay() {
    if (!parsed || !wallet || !address) {
      payTx.setError("Connect your wallet to pay this invoice.");
      return;
    }
    await payTx.run(async () => {
      if ((await wallet.getChainId()) !== chain.id)
        throw new Error(`Switch your wallet to ${chain.name} first.`);
      const current = await publicClient.readContract({
        address: parsed.address,
        abi: pactSplitAbi,
        functionName: "getInvoice",
        args: [parsed.id],
      });
      if (current.status !== 0)
        throw new Error("This invoice is closed. Refresh to see its status.");
      const { request } = await publicClient.simulateContract({
        address: parsed.address,
        abi: pactSplitAbi,
        functionName: "payInvoice",
        args: [parsed.id],
        value: current.amount,
        account: address,
      });
      return wallet.writeContract(request);
    });
  }
  async function cancel() {
    if (!parsed || !wallet || !address) return;
    await cancelTx.run(async () => {
      if ((await wallet.getChainId()) !== chain.id)
        throw new Error(`Switch your wallet to ${chain.name} first.`);
      const { request } = await publicClient.simulateContract({
        address: parsed.address,
        abi: pactSplitAbi,
        functionName: "cancelInvoice",
        args: [parsed.id],
        account: address,
      });
      return wallet.writeContract(request);
    });
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      payTx.setError("Copy the invoice link from your browser’s address bar.");
    }
  }
  const amounts = inv
    ? allocation(
        inv.amount,
        inv.recipients.map((r) => r.bps),
      )
    : [];
  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link href="/" className="brand">
          <LogoMark />
          PactSplit
        </Link>
        <WalletButton />
      </header>
      {!isMainnet ? (
        <div className="network-notice">
          <span>{chain.name}</span> · Test funds only. This is not a real USDC
          payment.
        </div>
      ) : null}
      <main className="checkout-main">
        {linkError || invoice.error ? (
          <div className="panel checkout-error">
            <h1>We couldn’t open this invoice.</h1>
            <p role="alert">{linkError || friendlyError(invoice.error)}</p>
            <Link href="/" className="btn btn-ghost">
              Back to PactSplit <Arrow />
            </Link>
          </div>
        ) : !inv ? (
          <div className="panel loading-panel" role="status">
            Loading invoice from {chain.name}…
          </div>
        ) : (
          <>
            <div className="checkout-title">
              <span className="eyebrow">
                {inv.status === 1
                  ? "A TEAM PAYDAY, COMPLETE"
                  : inv.status === 2
                    ? "THIS PACT IS CLOSED"
                    : "ONE PAYMENT. EVERY TEAMMATE PAID."}
              </span>
              <h1>
                {inv.status === 1
                  ? "You made it a team payday."
                  : inv.status === 2
                    ? "Invoice cancelled."
                    : "Great work deserves a great payday."}
              </h1>
              <p>
                Invoice #{params.id} · Created by {shortAddress(inv.creator)}
              </p>
            </div>
            <div className="checkout-layout">
              <div>
                <SplitPreview
                  title={inv.title}
                  amount={inv.amount}
                  recipients={inv.recipients.map((r, i) => ({
                    ...r,
                    amount: amounts[i],
                  }))}
                  variant="checkout"
                />
                <div className="wallet-details">
                  <h2>Receiving wallets</h2>
                  {inv.recipients.map((r) => (
                    <div key={r.wallet}>
                      <span>{r.name}</span>
                      {explorerAddress(r.wallet) ? (
                        <a
                          href={explorerAddress(r.wallet)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {r.wallet} ↗
                        </a>
                      ) : (
                        <code>{r.wallet}</code>
                      )}
                    </div>
                  ))}
                </div>
                <div className="checkout-contract">
                  Contract:{" "}
                  {explorerAddress(params.contract) ? (
                    <a
                      href={explorerAddress(params.contract)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortAddress(params.contract)} ↗
                    </a>
                  ) : (
                    <span>{shortAddress(params.contract)}</span>
                  )}{" "}
                  · {chain.name}
                </div>
              </div>
              <aside className="panel payment-panel">
                {inv.status === 0 ? (
                  <>
                    <span className="payment-icon">
                      <Icon name="wallet" />
                    </span>
                    <h2>
                      Pay once.
                      <br />
                      They get paid together.
                    </h2>
                    <p>
                      Your payment goes straight to the agreed wallets in one
                      transaction.
                    </p>
                    <dl className="payment-summary">
                      <div>
                        <dt>Invoice total</dt>
                        <dd>{formatMoney(inv.amount)} USDC</dd>
                      </div>
                      <div>
                        <dt>Platform fee</dt>
                        <dd>0 USDC</dd>
                      </div>
                      <div>
                        <dt>Network fee</dt>
                        <dd>Shown in your wallet</dd>
                      </div>
                    </dl>
                    <TransactionStatus tx={payTx} />
                    <button
                      className="btn pay-button"
                      disabled={
                        payTx.busy ||
                        !!payTx.hash ||
                        cancelTx.busy ||
                        !!cancelTx.hash
                      }
                      onClick={() => void pay()}
                    >
                      {payTx.busy
                        ? "Confirming payment…"
                        : `Pay ${formatMoney(inv.amount)} USDC`}
                      <Arrow />
                    </button>
                    <p className="action-note">
                      Review the amount and network fee in your wallet. If any
                      recipient transfer fails, the entire split reverts; a
                      network fee may still apply.
                    </p>
                    <div className="checkout-trust">
                      <Check />
                      No held balance. No platform fee.
                    </div>
                  </>
                ) : inv.status === 1 ? (
                  <>
                    <span className="receipt-icon">
                      <Check />
                    </span>
                    <span className="pill">Payment confirmed</span>
                    <h2>Every teammate paid.</h2>
                    <p>
                      {formatMoney(inv.amount)} USDC was distributed to{" "}
                      {inv.recipients.length} wallet
                      {inv.recipients.length !== 1 ? "s" : ""} in one successful
                      transaction.
                    </p>
                    <dl className="payment-summary">
                      <div>
                        <dt>Paid by</dt>
                        <dd>{shortAddress(inv.payer)}</dd>
                      </div>
                      <div>
                        <dt>Confirmed</dt>
                        <dd>
                          {new Date(Number(inv.paidAt) * 1000).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                    {receipt.data && explorerTx(receipt.data) ? (
                      <a
                        className="btn"
                        href={explorerTx(receipt.data)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View payment on Arc <Arrow direction="up" />
                      </a>
                    ) : receipt.data ? (
                      <code className="receipt-hash">{receipt.data}</code>
                    ) : (
                      <p className="field-help">
                        {receipt.error
                          ? "Payment is confirmed in the contract. The explorer receipt could not be loaded."
                          : "Loading payment receipt…"}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="payment-icon">
                      <Icon name="invoice" />
                    </span>
                    <h2>This invoice is closed.</h2>
                    <p>
                      The creator cancelled this invoice before payment. Ask
                      them for a new invoice.
                    </p>
                  </>
                )}
                {owner ? (
                  <div className="owner-tools">
                    <h3>Your invoice</h3>
                    <button
                      className="btn btn-ghost"
                      onClick={() => void copy()}
                    >
                      <Icon name="copy" />
                      {copied ? "Link copied" : "Copy invoice link"}
                    </button>
                    <Link className="text-link" href="/invoices">
                      View your invoices <Arrow />
                    </Link>
                    {inv.status === 0 ? (
                      <>
                        <TransactionStatus tx={cancelTx} />
                        {cancelArmed ? (
                          <div className="cancel-confirm">
                            <p>
                              Cancel this invoice? Its payment link will stop
                              accepting funds.
                            </p>
                            <button
                              className="btn btn-small btn-danger"
                              disabled={
                                cancelTx.busy ||
                                !!cancelTx.hash ||
                                payTx.busy ||
                                !!payTx.hash
                              }
                              onClick={() => void cancel()}
                            >
                              Confirm cancellation
                            </button>
                            <button
                              className="text-button"
                              onClick={() => setCancelArmed(false)}
                            >
                              Keep invoice
                            </button>
                          </div>
                        ) : (
                          <button
                            className="text-button muted"
                            onClick={() => setCancelArmed(true)}
                          >
                            Cancel invoice
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </aside>
            </div>
            <div className="checkout-bottom">
              <LogoMark small />
              <span>Clear for your client. Fair for your team.</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
