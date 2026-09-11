export function validateDayOffDate(date: string): string | null {
  if (!date) return "Choose a date.";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Enter a valid date.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  if (parsed < today) return "You can't block a date in the past.";

  return null;
}
