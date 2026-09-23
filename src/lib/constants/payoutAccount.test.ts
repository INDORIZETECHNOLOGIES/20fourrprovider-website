import { describe, expect, it } from "vitest";
import { payoutAccountStatus } from "./payoutAccount";
import { settlementBadge } from "./settlementState";

const confirmed = { verified: true, confirmedByProvider: true };

describe("payoutAccountStatus", () => {
  it("is null until the bank account is verified and confirmed — the bank step comes first", () => {
    expect(payoutAccountStatus(null)).toBeNull();
    expect(payoutAccountStatus({ verified: true, confirmedByProvider: false })).toBeNull();
    expect(payoutAccountStatus({ verified: false, confirmedByProvider: true })).toBeNull();
  });

  it("only 'activated' counts as done", () => {
    expect(payoutAccountStatus({ ...confirmed, razorpayActivationStatus: "activated" })).toMatchObject({ done: true, tone: "active" });
    for (const s of ["created", "under_review", "needs_clarification", "suspended"] as const) {
      expect(payoutAccountStatus({ ...confirmed, razorpayActivationStatus: s })?.done).toBe(false);
    }
  });

  it("sends needs_clarification and suspended to support", () => {
    expect(payoutAccountStatus({ ...confirmed, razorpayActivationStatus: "needs_clarification" })?.action?.href).toBe("/tickets");
    expect(payoutAccountStatus({ ...confirmed, razorpayActivationStatus: "suspended" })?.action?.href).toBe("/tickets");
  });

  it("points a missing PAN at the tax profile", () => {
    const status = payoutAccountStatus({ ...confirmed, razorpayProvisioningError: "PAN missing on the provider tax profile" });
    expect(status).toMatchObject({ label: "PAN needed", action: { href: "/tax-profile" } });
  });

  it("reads as being set up when nothing has come back from Razorpay yet", () => {
    expect(payoutAccountStatus(confirmed)).toMatchObject({ label: "Being set up", done: false });
  });
});

describe("settlementBadge", () => {
  it("asks for the invoice on a calculated settlement without one", () => {
    expect(settlementBadge("calculated", false)).toEqual({ label: "Awaiting invoice", tone: "action" });
    expect(settlementBadge("calculated", undefined)).toEqual({ label: "Awaiting invoice", tone: "action" });
  });

  it("reads as releasing once the invoice is on file", () => {
    expect(settlementBadge("calculated", true)).toEqual({ label: "Releasing", tone: "active" });
  });

  it("falls back to the static labels for every other state", () => {
    expect(settlementBadge("released", true)).toEqual({ label: "Released", tone: "active" });
    expect(settlementBadge("manual_review")).toEqual({ label: "Under review", tone: "danger" });
  });
});
