import { describe, expect, it } from "vitest";
import { validateTicketDescription, validateTicketMessage, validateTicketSubject } from "./tickets";

describe("validateTicketSubject", () => {
  it("rejects a subject under 5 characters", () => {
    expect(validateTicketSubject("Hi")).not.toBeNull();
  });

  it("rejects a subject over 100 characters", () => {
    expect(validateTicketSubject("a".repeat(101))).not.toBeNull();
  });

  it("accepts a reasonable subject", () => {
    expect(validateTicketSubject("Provider didn't show up on time")).toBeNull();
  });
});

describe("validateTicketDescription", () => {
  it("rejects a description under 10 characters", () => {
    expect(validateTicketDescription("too short")).not.toBeNull();
  });

  it("rejects a description over 1000 characters", () => {
    expect(validateTicketDescription("a".repeat(1001))).not.toBeNull();
  });

  it("accepts a reasonable description", () => {
    expect(validateTicketDescription("The client cancelled with no notice after I arrived.")).toBeNull();
  });
});

describe("validateTicketMessage", () => {
  it("rejects an empty message", () => {
    expect(validateTicketMessage("   ")).not.toBeNull();
  });

  it("rejects a message over 1000 characters", () => {
    expect(validateTicketMessage("a".repeat(1001))).not.toBeNull();
  });

  it("accepts a normal message", () => {
    expect(validateTicketMessage("Following up on this.")).toBeNull();
  });
});
