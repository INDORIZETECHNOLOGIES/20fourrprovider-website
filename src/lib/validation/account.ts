export function validateConsentReason(reason: string): string | null {
  if (reason.length > 500) return "Keep the reason under 500 characters.";
  return null;
}

export function validateErasureReason(reason: string): string | null {
  if (reason.length > 1000) return "Keep the reason under 1000 characters.";
  return null;
}
