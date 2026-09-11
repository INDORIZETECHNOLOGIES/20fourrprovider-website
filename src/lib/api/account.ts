import { apiRequest } from "./client";

export type ConsentPurpose = "marketing" | "analytics" | "profiling";

// Loosely typed — this is a large, multi-section export payload (profile, consent,
// bookings, payments, documents, wallet, ratings, ...) intended for download, not
// for the UI to read field-by-field. See CLAUDE.md.
export type AccountDataExport = Record<string, unknown>;

export function exportAccountData(accessToken: string): Promise<AccountDataExport> {
  return apiRequest("/provider/account/data-export", { accessToken });
}

export function withdrawConsent(
  purposes: ConsentPurpose[],
  reason: string | undefined,
  accessToken: string,
): Promise<{ withdrawnPurposes: ConsentPurpose[]; withdrawnAt: string }> {
  return apiRequest("/provider/account/consent-withdrawal", {
    method: "POST",
    body: { purposes, reason },
    accessToken,
  });
}

export function requestErasure(
  reason: string | undefined,
  accessToken: string,
): Promise<{ requestedAt: string; expectedCompletionBy: string; grievanceContact: string }> {
  return apiRequest("/provider/account/erasure-request", {
    method: "POST",
    body: { reason },
    accessToken,
  });
}
