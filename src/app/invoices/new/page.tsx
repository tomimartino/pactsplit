"use client";
import { useEffect, useRef, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";
import { decodeEventLog, isAddress, type Address } from "viem";
import { SplitPreview } from "@/components/split-preview";
import { Arrow, Check, Icon } from "@/components/icons";
import { TransactionStatus } from "@/components/transaction-status";
import { parseAmount, parsePercent, allocation } from "@/lib/amounts";
import {
  chain,
  contractAddress,
  invoicePath,
  isLocal,
  publicClient,
} from "@/lib/network";
import { useTransaction } from "@/lib/transactions";
import { pactSplitAbi } from "@/generated/pactsplit";
type Person = { name: string; role: string; wallet: string; share: string };
type Draft = { title: string; amount: string; people: Person[] };
const DEFAULT: Draft = {
  title: "",
  amount: "",
  people: [
    { name: "", role: "Developer", wallet: "", share: "60" },
    { name: "", role: "Designer", wallet: "", share: "30" },
    { name: "", role: "Copywriter", wallet: "", share: "10" },
  ],
};
const bytes = (value: string) => new TextEncoder().encode(value).length;
export default function CreateInvoice() {
  const { address } = useAccount();
  const { data: wallet } = useWalletClient();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(DEFAULT);
  const [notice, setNotice] = useState("");
  const draftKey = `pactsplit:draft:v1:${chain.id}:${address?.toLowerCase() || "guest"}`;
  const previousDraftKey = useRef<string>(undefined);
  useEffect(() => {
    setNotice("");
    let savedDraft: Draft | undefined;
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (
        saved?.version === 1 &&
        typeof saved.title === "string" &&
        typeof saved.amount === "string" &&
        Array.isArray(saved.people) &&
        saved.people.length > 0 &&
        saved.people.length <= 5 &&
        saved.people.every((p: Person) =>
          ["name", "role", "wallet", "share"].every(
            (k) => typeof p[k as keyof Person] === "string",
          ),
        )
      )
        savedDraft = saved;
    } catch {}
    if (savedDraft) setDraft(savedDraft);
    else if (
      previousDraftKey.current?.endsWith(":guest") &&
      !draftKey.endsWith(":guest")
    )
      setDraft((current) => current);
    else setDraft(DEFAULT);
    previousDraftKey.current = draftKey;
  }, [draftKey]);
  const tx = useTransaction(`create:${address || "guest"}`, (receipt) => {
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== contractAddress?.toLowerCase())
        continue;
      try {
        const event = decodeEventLog({
          abi: pactSplitAbi,
          data: log.data,
          topics: log.topics,
        });
        if (event.eventName === "InvoiceCreated") {
          try {
            localStorage.removeItem(draftKey);
          } catch {}
          router.push(invoicePath(event.args.id));
          return;
        }
      } catch {}
    }
    throw new Error(
      "Confirmed, but the invoice event was not found. Check your invoices before publishing again.",
    );
  });
  let amount = 0n;
  try {
    amount = parseAmount(draft.amount);
  } catch {}
  const shares = draft.people.map((p) => {
    try {
      return parsePercent(p.share);
    } catch {
      return 0;
    }
  });
  const total = shares.reduce((a, b) => a + b, 0);
  let amounts = draft.people.map(() => 0n);
  try {
    amounts = allocation(amount, shares);
  } catch {}
  const preview = draft.people.map((p, i) => ({
    ...p,
    bps: shares[i],
    amount: amounts[i],
  }));
  function updatePerson(index: number, field: keyof Person, value: string) {
    setDraft((prev) => ({
      ...prev,
      people: prev.people.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
    setNotice("");
  }
  async function publish() {
    tx.setError("");
    if (!wallet || !address) {
      tx.setError("Connect your wallet to publish this invoice.");
      return;
    }
    if (!contractAddress) {
      tx.setError(
        "The invoice contract has not been configured yet. Save a draft while network setup is completed.",
      );
      return;
    }
    const target = contractAddress;
    await tx.run(async () => {
      if ((await wallet.getChainId()) !== chain.id)
        throw new Error(`Switch your wallet to ${chain.name} first.`);
      const title = draft.title.trim();
      if (!title || bytes(title) > 120)
        throw new Error("Enter a project title of up to 120 bytes.");
      const value = parseAmount(draft.amount);
      const recipients = draft.people.map((p) => {
        if (
          !p.name.trim() ||
          bytes(p.name.trim()) > 40 ||
          bytes(p.role.trim()) > 40
        )
          throw new Error(
            "Each teammate needs a name. Names and roles must fit within 40 bytes.",
          );
        if (
          !isAddress(p.wallet) ||
          /^0x0{40}$/i.test(p.wallet) ||
          p.wallet.toLowerCase() === target.toLowerCase()
        )
          throw new Error(
            `Enter a valid receiving wallet for ${p.name || "each teammate"}.`,
          );
        return {
          name: p.name.trim(),
          role: p.role.trim(),
          wallet: p.wallet as Address,
          bps: parsePercent(p.share),
        };
      });
      if (
        new Set(recipients.map((r) => r.wallet.toLowerCase())).size !==
        recipients.length
      )
        throw new Error("Each teammate must have a different wallet address.");
      allocation(
        value,
        recipients.map((r) => r.bps),
      );
      const { request } = await publicClient.simulateContract({
        address: target,
        abi: pactSplitAbi,
        functionName: "createInvoice",
        args: [title, value, recipients],
        account: address,
      });
      return wallet.writeContract(request);
    });
  }
  function save() {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ ...draft, version: 1 }));
      setNotice("Draft saved in this browser.");
    } catch {
      tx.setError("Your browser could not save the draft.");
    }
  }
  async function fillLocal() {
    const res = await fetch("http://127.0.0.1:8545", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_accounts",
        params: [],
      }),
    });
    const { result } = await res.json();
    setDraft({
      title: "Brand & website design",
      amount: "10",
      people: ["Alya", "Rafi", "Nia"].map((name, i) => ({
        ...DEFAULT.people[i],
        name,
        wallet: result[i + 1],
      })),
    });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LET’S MAKE IT OFFICIAL</span>
          <h1>Create an invoice</h1>
          <p>One shared project. A clear split. Everyone on the same page.</p>
        </div>
        <span className="pill subtle-pill">Native USDC</span>
      </div>
      <div className="form-layout">
        <div>
          <section className="panel">
            <div className="panel-title">
              <span className="number-circle">1</span>
              <h2>The project</h2>
            </div>
            <label className="field">
              Project name
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Brand & website design"
                maxLength={120}
              />
            </label>
            <label className="field">
              Total invoice amount
              <div className="amount-input">
                <input
                  inputMode="decimal"
                  value={draft.amount}
                  onChange={(e) =>
                    setDraft({ ...draft, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
                <span>USDC</span>
              </div>
              <span className="field-help">
                Your client pays this amount, plus the Arc network fee.
              </span>
            </label>
          </section>
          <section className="panel team-panel">
            <div className="panel-title">
              <span className="number-circle">2</span>
              <h2>Your team & their share</h2>
              <span className="muted">{draft.people.length}/5</span>
            </div>
            <p className="panel-intro">
              Agree on the split before publishing. Each share goes directly to
              their wallet.
            </p>
            {draft.people.map((p, i) => (
              <div className="person-form" key={i}>
                <div className="person-form-top">
                  <span className={`avatar avatar-${i % 5}`}>{i + 1}</span>
                  <strong>Teammate {i + 1}</strong>
                  {draft.people.length > 1 ? (
                    <button
                      className="remove-button"
                      aria-label={`Remove teammate ${i + 1}`}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          people: draft.people.filter((_, j) => i !== j),
                        })
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="person-fields">
                  <label className="field">
                    Name
                    <input
                      value={p.name}
                      onChange={(e) => updatePerson(i, "name", e.target.value)}
                      placeholder={["Alya", "Rafi", "Nia"][i] || "Name"}
                      maxLength={40}
                    />
                  </label>
                  <label className="field">
                    Role
                    <input
                      value={p.role}
                      onChange={(e) => updatePerson(i, "role", e.target.value)}
                      placeholder="Designer"
                      maxLength={40}
                    />
                  </label>
                  <label className="field share-field">
                    Share
                    <div className="suffix-input">
                      <input
                        inputMode="decimal"
                        value={p.share}
                        onChange={(e) =>
                          updatePerson(i, "share", e.target.value)
                        }
                      />
                      <span>%</span>
                    </div>
                  </label>
                  <label className="field wallet-field">
                    Wallet address
                    <input
                      className="mono-input"
                      value={p.wallet}
                      onChange={(e) =>
                        updatePerson(i, "wallet", e.target.value.trim())
                      }
                      placeholder="0x…"
                      autoComplete="off"
                    />
                  </label>
                </div>
              </div>
            ))}
            <div className="team-actions">
              <button
                className="text-button"
                disabled={draft.people.length >= 5}
                onClick={() =>
                  setDraft({
                    ...draft,
                    people: [
                      ...draft.people,
                      { name: "", role: "", wallet: "", share: "" },
                    ],
                  })
                }
              >
                <Icon name="plus" />
                Add teammate
              </button>
              <span className={`split-total ${total === 10000 ? "valid" : ""}`}>
                {total === 10000 ? <Check /> : null}
                {total / 100}% of 100%
              </span>
            </div>
            {total !== 10000 ? (
              <p className="field-help">
                Your team’s shares need to add up to 100%.
              </p>
            ) : null}
          </section>
          <div className="privacy-note">
            <Icon name="link" />
            <p>
              Published invoices are public and cannot be edited. Project names,
              teammate names, roles, wallets, and amounts are stored on Arc.
              Keep personal or confidential details out.
            </p>
          </div>
          <TransactionStatus tx={tx} />
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={save}>
              Save draft
            </button>
            <button
              className="btn"
              disabled={tx.busy || !!tx.hash}
              onClick={() => void publish()}
            >
              {tx.busy ? "Confirming…" : "Publish invoice"}
              <Arrow />
            </button>
          </div>
          <p className="action-note">
            Publishing requires one wallet transaction. Your client’s payment is
            a separate transaction.
          </p>
          {notice ? (
            <p className="success-text" role="status">
              {notice}
            </p>
          ) : null}
          {isLocal ? (
            <button
              className="text-button"
              onClick={() =>
                void fillLocal().catch((e) => tx.setError(e.message))
              }
            >
              Fill local test example (10 test USDC)
            </button>
          ) : null}
        </div>
        <aside className="preview-column">
          <div className="preview-label">
            <span className="live-dot" />
            LIVE PREVIEW
          </div>
          <SplitPreview
            title={draft.title}
            amount={amount}
            recipients={preview}
          />
          <p className="preview-help">
            <Check />
            Clear for your client. Fair for your team.
          </p>
        </aside>
      </div>
    </>
  );
}
