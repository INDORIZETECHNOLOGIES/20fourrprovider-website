// Pure date helpers for the staff calendar. Dates are plain YYYY-MM-DD strings
// built from local parts — going through `new Date("YYYY-MM-DD")` would read
// them as UTC midnight and shift a day in India-west timezones.

const pad = (n: number) => String(n).padStart(2, "0");

export const toDateString = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;

export const monthKey = (year: number, month: number) => `${year}-${pad(month + 1)}`;

export function todayString(now: Date = new Date()) {
  return toDateString(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addMonths(year: number, month: number, delta: number) {
  const index = year * 12 + month + delta;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Weeks start on Monday. `null` pads the days before the 1st and after the last.
export function buildMonthGrid(year: number, month: number): (string | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (string | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateString(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Inclusive day count between two YYYY-MM-DD strings, or null if either is malformed or out of order. */
export function daysInclusive(start: string, end: string): number | null {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(start) || !re.test(end)) return null;
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  // Date.UTC keeps DST out of the subtraction.
  const diff = (Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86_400_000;
  return diff < 0 ? null : diff + 1;
}

export function formatDayLong(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
