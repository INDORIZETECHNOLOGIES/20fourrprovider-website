import type { AppealStatus, PenaltyStatus, PenaltyType } from "@/lib/api/penalties";

export const PENALTY_TYPE_LABELS: Record<PenaltyType, string> = {
  unplanned_leave: "Unplanned leave",
  absence: "Absence",
  misbehaviour: "Misbehaviour",
  late_arrival: "Late arrival",
  other: "Other",
};

type Tone = "action" | "active" | "muted" | "danger";

export const PENALTY_STATUS_LABELS: Record<PenaltyStatus, string> = {
  pending: "Not yet deducted",
  deducted: "Deducted",
  appealed: "Appeal in review",
  waived: "Waived",
};

export const PENALTY_STATUS_TONE: Record<PenaltyStatus, Tone> = {
  pending: "danger",
  deducted: "muted",
  appealed: "action",
  waived: "active",
};

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  pending: "Appeal in review",
  approved: "Appeal approved",
  rejected: "Appeal rejected",
};

// Words for what a penalty level means, without repeating the rule table here.
export const OFFENSE_LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: "First offence",
  2: "Second offence",
  3: "Third offence",
};
