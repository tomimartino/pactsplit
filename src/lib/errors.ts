import { BaseError } from "viem";
export function friendlyError(error: unknown): string {
  const message =
    error instanceof BaseError
      ? error.shortMessage
      : error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
  if (/user rejected|denied|rejected the request/i.test(message))
    return "You declined the wallet request. No payment was made.";
  if (/insufficient funds/i.test(message))
    return "Your wallet needs enough USDC for this amount and the network fee.";
  if (/InvoiceClosed/i.test(message))
    return "This invoice has already been paid or cancelled. Refresh to see its status.";
  if (/TransferFailed/i.test(message))
    return "A recipient could not receive this payment. The entire split was reverted. The network may still charge a fee.";
  if (/InvoiceNotFound/i.test(message))
    return "This invoice does not exist. Check the link with the sender.";
  if (/timeout|timed out/i.test(message))
    return "The network is taking longer than expected. If a transaction was sent, check its status before trying again.";
  return message.slice(0, 300);
}
