export const APPEAL_REASON_MAX = 1000;

export function validateAppealReason(reason: string): string | null {
  const text = reason.trim();
  if (!text) return "Tell us why this penalty should be reviewed.";
  if (text.length < 20) return "Add a little more detail — at least a sentence, so the reviewer can act on it.";
  if (text.length > APPEAL_REASON_MAX) return `Keep this under ${APPEAL_REASON_MAX} characters.`;
  return null;
}

// A penalty can be appealed once, and not after it has been waived.
export function canAppeal(penalty: { status: string; appeal?: { appealed?: boolean } | null }): boolean {
  return penalty.status !== "waived" && !penalty.appeal?.appealed;
}
