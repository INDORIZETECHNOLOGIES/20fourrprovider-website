import type { PerformanceComponent, PerformanceImportance, PerformanceKey } from "@/lib/api/performance";

export const PERFORMANCE_LABELS: Record<PerformanceKey, { name: string; measures: string }> = {
  rating: { name: "Client ratings", measures: "Your average rating, weighed by how many you have." },
  completion: { name: "Finishing jobs", measures: "Jobs you finish, out of the ones you accept." },
  noShow: { name: "Turning up", measures: "Shifts missed without notice, counted from upheld penalties." },
  cancellation: { name: "Keeping bookings", measures: "Bookings you cancel after accepting them." },
  response: { name: "Response time", measures: "How quickly you accept or decline a new request." },
  complaints: { name: "Complaints", measures: "Disputes and serious incidents raised by clients." },
};

const IMPORTANCE_RANK: Record<PerformanceImportance, number> = { high: 0, medium: 1, low: 2 };

/** What needs attention first, then by importance; otherwise the server's order. */
export function orderComponents(components: PerformanceComponent[]): PerformanceComponent[] {
  return components
    .map((c, i) => ({ c, i }))
    .sort(
      (a, b) =>
        Number(b.c.status === "needs_attention") - Number(a.c.status === "needs_attention") ||
        IMPORTANCE_RANK[a.c.importance] - IMPORTANCE_RANK[b.c.importance] ||
        a.i - b.i,
    )
    .map(({ c }) => c);
}

export type PerformanceSummary = { good: number; attention: PerformanceComponent[]; unscored: number; total: number };

export function summarize(components: PerformanceComponent[]): PerformanceSummary {
  return {
    good: components.filter((c) => c.status === "good").length,
    attention: orderComponents(components).filter((c) => c.status === "needs_attention"),
    unscored: components.filter((c) => c.status === "not_enough_data").length,
    total: components.length,
  };
}

/** One sentence for the dashboard and the page's summary line. */
export function headline(s: PerformanceSummary): string {
  if (s.total === 0 || s.unscored === s.total) return "Not scored yet. Your first completed jobs will start it.";
  if (s.attention.length === 0) return `All ${s.total} are in good shape.`;
  const names = s.attention.map((c) => PERFORMANCE_LABELS[c.key].name.toLowerCase());
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${s.attention.length} of ${s.total} need${s.attention.length === 1 ? "s" : ""} attention: ${list}.`;
}
