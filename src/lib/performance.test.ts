import { describe, expect, it } from "vitest";
import type { PerformanceComponent } from "@/lib/api/performance";
import { headline, orderComponents, summarize } from "./performance";

const c = (key: PerformanceComponent["key"], status: PerformanceComponent["status"], importance: PerformanceComponent["importance"]): PerformanceComponent => ({
  key,
  status,
  importance,
  detail: "",
});

const all = [
  c("rating", "good", "high"),
  c("completion", "good", "high"),
  c("noShow", "good", "high"),
  c("cancellation", "needs_attention", "medium"),
  c("response", "needs_attention", "high"),
  c("complaints", "good", "medium"),
];

describe("orderComponents", () => {
  it("puts what needs attention first, most important first, else keeps server order", () => {
    expect(orderComponents(all).map((x) => x.key)).toEqual(["response", "cancellation", "rating", "completion", "noShow", "complaints"]);
  });
});

describe("headline", () => {
  it("names what needs attention", () => {
    expect(headline(summarize(all))).toBe("2 of 6 need attention: response time and keeping bookings.");
  });

  it("uses the singular for one", () => {
    expect(headline(summarize([c("rating", "needs_attention", "high"), c("response", "good", "high")]))).toBe(
      "1 of 2 needs attention: client ratings.",
    );
  });

  it("says so when everything is good, or nothing is scored", () => {
    expect(headline(summarize([c("rating", "good", "high")]))).toBe("All 1 are in good shape.");
    expect(headline(summarize([c("rating", "not_enough_data", "high")]))).toMatch(/Not scored yet/);
  });
});
