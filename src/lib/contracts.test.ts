import { describe, expect, it } from "vitest";
import type { Contract, ContractCycle } from "@/lib/api/contracts";
import { cycleState, formatDay, termTotalPaise } from "./contracts";

const cycle = (patch: Partial<ContractCycle>): ContractCycle => ({
  index: 0,
  startDate: "2026-11-17",
  endDate: "2026-12-16",
  days: 30,
  providerPreGstPaise: 8_400_000,
  bookingId: null,
  bookingStatus: null,
  ...patch,
});
const live = { status: "active", suspendedCycleIndex: null } as Pick<Contract, "status" | "suspendedCycleIndex">;

describe("cycleState", () => {
  it("reads a month from its booking", () => {
    expect(cycleState(cycle({ bookingStatus: "payment_done" }), live).label).toBe("Paid");
    expect(cycleState(cycle({ bookingStatus: "provider_accepted" }), live).label).toBe("Awaiting payment");
    expect(cycleState(cycle({ bookingStatus: "duty_ended" }), live).label).toMatch(/invoice/);
  });

  it("marks the month that paused the contract", () => {
    const suspended = { status: "suspended", suspendedCycleIndex: 1 } as Pick<Contract, "status" | "suspendedCycleIndex">;
    expect(cycleState(cycle({ index: 1, bookingStatus: "provider_accepted" }), suspended)).toEqual({ label: "Unpaid — paused", tone: "danger" });
  });

  it("calls an unbilled month upcoming while running, and not billed once ended", () => {
    expect(cycleState(cycle({}), live).label).toBe("Upcoming");
    expect(cycleState(cycle({}), { status: "terminated", suspendedCycleIndex: null }).label).toBe("Not billed");
  });
});

describe("helpers", () => {
  it("sums the provider's price across the term", () => {
    expect(termTotalPaise({ cycles: [cycle({}), cycle({ providerPreGstPaise: 100 })] })).toBe(8_400_100);
  });

  it("formats a calendar day without shifting it by timezone", () => {
    expect(formatDay("2026-11-17")).toBe("17 Nov 2026");
  });
});
