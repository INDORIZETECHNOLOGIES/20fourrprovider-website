export const BOOKING_STATUSES = [
  "pending",
  "provider_accepted",
  "provider_rejected",
  "payment_pending",
  "payment_done",
  "duty_started",
  "duty_ended",
  "completed",
  "cancelled",
  "disputed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "New request",
  provider_accepted: "Accepted",
  provider_rejected: "Declined",
  payment_pending: "Awaiting payment",
  payment_done: "Payment received",
  duty_started: "Duty in progress",
  duty_ended: "Duty ended",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export type BadgeTone = "action" | "active" | "muted" | "danger";

export const BOOKING_STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  pending: "action",
  provider_accepted: "active",
  payment_pending: "active",
  payment_done: "active",
  duty_started: "active",
  duty_ended: "active",
  completed: "muted",
  provider_rejected: "danger",
  cancelled: "danger",
  disputed: "danger",
};
