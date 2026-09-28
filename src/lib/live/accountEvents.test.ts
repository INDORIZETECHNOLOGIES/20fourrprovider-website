import { describe, expect, it } from "vitest";
import { isAccountEvent, matchesFilter, type AccountEvent } from "./accountEvents";

const booking: AccountEvent = { type: "booking_confirmed", entity: "booking", entityId: "b1", at: "2026-09-28T10:00:00Z" };
const account: AccountEvent = { type: "penalty_issued", entity: "account", entityId: null, at: "2026-09-28T10:00:00Z" };

describe("isAccountEvent", () => {
  it("accepts the 0020 payload, including a null entityId", () => {
    expect(isAccountEvent(booking)).toBe(true);
    expect(isAccountEvent(account)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isAccountEvent(null)).toBe(false);
    expect(isAccountEvent({ ...booking, entity: "wallet" })).toBe(false);
    expect(isAccountEvent({ ...booking, entityId: 7 })).toBe(false);
    expect(isAccountEvent({ entity: "booking", entityId: "b1" })).toBe(false);
  });
});

describe("matchesFilter", () => {
  it("matches by entity", () => {
    expect(matchesFilter(booking, { entities: ["booking", "payment"] })).toBe(true);
    expect(matchesFilter(booking, { entities: ["document"] })).toBe(false);
  });

  it("matches every event for 'any'", () => {
    expect(matchesFilter(account, { entities: "any" })).toBe(true);
  });

  it("narrows a detail view to its own record", () => {
    expect(matchesFilter(booking, { entities: ["booking"], entityId: "b1" })).toBe(true);
    expect(matchesFilter(booking, { entities: ["booking"], entityId: "b2" })).toBe(false);
    expect(matchesFilter(account, { entities: ["account"], entityId: "b1" })).toBe(false);
  });
});
