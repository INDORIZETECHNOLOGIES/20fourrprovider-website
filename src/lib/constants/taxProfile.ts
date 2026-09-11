import type { BadgeTone } from "@/lib/constants/settlementState";
import type { GstinStatus, PanVerificationStatus, PsaraVerificationStatus } from "@/lib/api/taxProfile";

export const PAN_STATUS_LABELS: Record<PanVerificationStatus, string> = {
  unsubmitted: "Not submitted",
  pending: "Pending verification",
  verified: "Verified",
  rejected: "Rejected",
};

export const PAN_STATUS_TONE: Record<PanVerificationStatus, BadgeTone> = {
  unsubmitted: "muted",
  pending: "muted",
  verified: "active",
  rejected: "danger",
};

export const GSTIN_STATUS_LABELS: Record<GstinStatus, string> = {
  not_applicable: "Not applicable",
  unverified: "Pending verification",
  active: "Active",
  cancelled: "Cancelled",
};

export const GSTIN_STATUS_TONE: Record<GstinStatus, BadgeTone> = {
  not_applicable: "muted",
  unverified: "muted",
  active: "active",
  cancelled: "danger",
};

export const PSARA_STATUS_LABELS: Record<PsaraVerificationStatus, string> = {
  pending: "Pending verification",
  verified: "Verified",
  rejected: "Rejected",
};

export const PSARA_STATUS_TONE: Record<PsaraVerificationStatus, BadgeTone> = {
  pending: "muted",
  verified: "active",
  rejected: "danger",
};

// serializeTaxProfile (backend) builds these from panVerificationStatus/gstinStatus — not an
// officially versioned enum, so unrecognized values fall back to a prettified raw string
// (see blockingReasonLabel in TaxProfilePanel.tsx) rather than a hardcoded lookup miss.
export const BLOCKING_REASON_LABELS: Record<string, string> = {
  pan_not_submitted: "PAN not submitted",
  pan_pending: "PAN pending verification",
  pan_rejected: "PAN was rejected — resubmit",
  gstin_not_verified: "GSTIN pending verification",
  gstin_not_applicable: "GSTIN required for a registered tax tier",
  gstin_cancelled: "GSTIN was cancelled — check your details",
};
