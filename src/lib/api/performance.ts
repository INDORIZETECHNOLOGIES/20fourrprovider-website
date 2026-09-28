import { apiRequest } from "./client";

// Backend spec 0015. What decides where a provider appears in client search, as statuses rather
// than raw scores or weights (rule 8): the server never sends the numbers.
export type PerformanceKey = "rating" | "completion" | "noShow" | "cancellation" | "response" | "complaints";
export type PerformanceStatus = "good" | "needs_attention" | "not_enough_data";
export type PerformanceImportance = "high" | "medium" | "low";

export type PerformanceComponent = {
  key: PerformanceKey;
  status: PerformanceStatus;
  importance: PerformanceImportance;
  /** The counts behind it, worded by the server ("2 no-shows in the last 90 days"). */
  detail: string;
  /** Only when it needs attention. */
  tip?: string;
};

export type Performance = {
  components: PerformanceComponent[];
  /** A new provider is shown at least as high as a typical one until they've built a record. */
  newProviderBoost: boolean;
  computedAt: string | null;
};

export function getPerformance(accessToken: string): Promise<Performance> {
  return apiRequest("/provider/performance", { accessToken });
}
