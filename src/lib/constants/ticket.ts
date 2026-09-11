export const TICKET_TYPES = [
  "dispute",
  "misconduct",
  "payment",
  "absence",
  "misbehaviour",
  "quality",
  "grievance",
  "other",
] as const;

export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  dispute: "Dispute",
  misconduct: "Misconduct",
  payment: "Payment issue",
  absence: "Absence",
  misbehaviour: "Misbehaviour",
  quality: "Service quality",
  grievance: "Grievance",
  other: "Other",
};

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = [
  "open",
  "in_review",
  "waiting_on_customer",
  "waiting_on_provider",
  "resolved",
  "closed",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_review: "In review",
  waiting_on_customer: "Waiting on client",
  waiting_on_provider: "Waiting on you",
  resolved: "Resolved",
  closed: "Closed",
};

export type BadgeTone = "action" | "active" | "muted" | "danger";

export const TICKET_STATUS_TONE: Record<TicketStatus, BadgeTone> = {
  open: "action",
  waiting_on_provider: "action",
  in_review: "active",
  waiting_on_customer: "active",
  resolved: "muted",
  closed: "muted",
};
