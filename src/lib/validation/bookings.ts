export function validateRejectionReason(reason: string): string | null {
  if (!reason.trim()) return "Enter a reason for declining.";
  if (reason.length > 500) return "Keep the reason under 500 characters.";
  return null;
}
