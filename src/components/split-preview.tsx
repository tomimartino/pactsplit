import { formatMoney, percent, shortAddress } from "@/lib/amounts";
import { Check, Arrow } from "./icons";
export type PreviewRecipient = {
  name: string;
  role: string;
  wallet?: string;
  bps: number;
  amount: bigint;
};
export function SplitPreview({
  title,
  amount,
  recipients,
  variant = "preview",
}: {
  title: string;
  amount: bigint;
  recipients: PreviewRecipient[];
  variant?: "preview" | "landing" | "checkout";
}) {
  return (
    <div className={`split-card ${variant}`}>
      <div className="split-card-top">
        <span className="invoice-caption">
          {variant === "landing"
            ? "A PAYMENT THAT WORKS FOR EVERYONE"
            : "YOUR CLIENT WILL SEE"}
        </span>
        <span className="pill">USDC on Arc</span>
      </div>
      <div className="invoice-heading">
        <span className="invoice-eyebrow">PROJECT INVOICE</span>
        <h3>{title || "Your next great project"}</h3>
        <div className="invoice-amount">
          {formatMoney(amount)} <span>USDC</span>
        </div>
        <p>One payment, shared with your team.</p>
      </div>
      <div className="preview-recipients">
        <div className="section-label">
          PAYMENT BREAKDOWN{" "}
          <span>
            {recipients.length} teammate{recipients.length !== 1 ? "s" : ""}
          </span>
        </div>
        {recipients.map((r, i) => (
          <div className="preview-person" key={i}>
            <div className={`avatar avatar-${i % 5}`}>
              {(r.name || "T")
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="person-name">
              <strong>{r.name || `Teammate ${i + 1}`}</strong>
              <span>
                {r.role || "Team member"}
                {variant === "checkout" && r.wallet
                  ? ` · ${shortAddress(r.wallet)}`
                  : ""}
              </span>
            </div>
            <div className="person-amount">
              <strong>
                {formatMoney(r.amount)} <span>USDC</span>
              </strong>
              <span>{percent(r.bps)} share</span>
            </div>
          </div>
        ))}
      </div>
      <div className="split-footer">
        <span className="small-check">
          <Check />
        </span>
        Split automatically in one transaction
      </div>
      {variant === "landing" ? (
        <div className="example-payment">
          <span>Client pays once. Everyone gets paid.</span>
          <Arrow />
        </div>
      ) : null}
    </div>
  );
}
