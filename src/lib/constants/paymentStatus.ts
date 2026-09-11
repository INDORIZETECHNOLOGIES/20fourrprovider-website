import type { PaymentStatus } from "@/lib/api/payments";
import type { BadgeTone } from "@/lib/constants/settlementState";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  created: "Created",
  authorized: "Authorized",
  captured: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
  created: "muted",
  authorized: "muted",
  captured: "active",
  failed: "danger",
  refunded: "danger",
};
