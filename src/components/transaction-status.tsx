import { explorerTx } from "@/lib/network";
import type { Hash } from "viem";
export function TransactionStatus({
  tx,
}: {
  tx: {
    hash?: Hash;
    busy: boolean;
    error: string;
    resume: () => Promise<void>;
  };
}) {
  return (
    <div aria-live="polite">
      {tx.error ? (
        <div className="error-box" role="alert">
          {tx.error}
        </div>
      ) : null}
      {tx.hash ? (
        <div className="pending-box">
          <strong>
            {tx.busy
              ? "Waiting for network confirmation…"
              : "Transaction sent. Check its status before continuing."}
          </strong>
          {explorerTx(tx.hash) ? (
            <a href={explorerTx(tx.hash)} target="_blank" rel="noreferrer">
              View transaction ↗
            </a>
          ) : (
            <code>{tx.hash}</code>
          )}
          {!tx.busy ? (
            <button
              className="btn btn-small btn-ghost"
              onClick={() => void tx.resume()}
            >
              Check confirmation
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
