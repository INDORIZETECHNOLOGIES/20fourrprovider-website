/** Today as an India calendar day (YYYY-MM-DD) — the calendar the backend keys days off on. */
export const indiaToday = (now: Date = new Date()): string =>
  now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// Compares calendar-day strings, not Date objects: `new Date("YYYY-MM-DD")` is UTC midnight, and
// mixing that with a local "today" rejected today's date before 05:30 IST (and in any browser
// behind UTC).
export function validateDayOffDate(date: string, now: Date = new Date()): string | null {
  if (!date) return "Choose a date.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())) {
    return "Enter a valid date.";
  }
  if (date < indiaToday(now)) return "You can't block a date in the past.";
  return null;
}
