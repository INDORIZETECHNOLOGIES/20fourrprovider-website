export function validateIncidentDescription(description: string): string | null {
  const length = description.trim().length;
  if (length < 5 || length > 4000) return "Description must be 5-4000 characters.";
  return null;
}

export function validateAbsenceReason(reason: string): string | null {
  if (!reason.trim()) return "Enter a reason.";
  return null;
}
