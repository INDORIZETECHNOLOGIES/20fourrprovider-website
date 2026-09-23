export const SETTLEMENT_STATES = [
  "held",
  "documents_issued",
  "calculated",
  "releasing",
  "released",
  "failed",
  "manual_review",
  "on_hold",
  "reversed",
  "reconciled",
] as const;

export type SettlementState = (typeof SETTLEMENT_STATES)[number];

export const SETTLEMENT_STATE_LABELS: Record<SettlementState, string> = {
  held: "Held",
  documents_issued: "Documents issued",
  calculated: "Awaiting invoice",
  releasing: "Releasing",
  released: "Released",
  failed: "Failed",
  manual_review: "Under review",
  on_hold: "On hold",
  reversed: "Reversed",
  reconciled: "Reconciled",
};

export type BadgeTone = "action" | "active" | "muted" | "danger";

export const SETTLEMENT_STATE_TONE: Record<SettlementState, BadgeTone> = {
  held: "muted",
  documents_issued: "muted",
  calculated: "muted",
  releasing: "active",
  released: "active",
  reconciled: "active",
  failed: "danger",
  manual_review: "danger",
  on_hold: "danger",
  reversed: "danger",
};

/**
 * The badge for one settlement. `calculated` means duty is done and the payout goes out as soon
 * as the provider's invoice is uploaded, so it reads differently depending on whether it is.
 * (The filter menu uses the static labels above, where "Awaiting invoice" covers both.)
 */
export function settlementBadge(state: SettlementState, invoiceUploaded?: boolean): { label: string; tone: BadgeTone } {
  if (state === "calculated") {
    return invoiceUploaded
      ? { label: "Releasing", tone: "active" }
      : { label: "Awaiting invoice", tone: "action" };
  }
  return { label: SETTLEMENT_STATE_LABELS[state], tone: SETTLEMENT_STATE_TONE[state] };
}
