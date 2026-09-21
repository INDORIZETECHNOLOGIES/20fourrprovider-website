import { describe, expect, it } from "vitest";
import {
  rupeesToPaise,
  validateInvoiceDate,
  validateInvoiceFile,
  validateInvoiceNumber,
  validateInvoiceTotal,
} from "./providerInvoice";

function makeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], "invoice", { type });
}

describe("validateInvoiceFile", () => {
  it("requires a file", () => {
    expect(validateInvoiceFile(null)).not.toBeNull();
  });
  it("accepts a PDF", () => {
    expect(validateInvoiceFile(makeFile("application/pdf", 1024))).toBeNull();
  });
  it("rejects a Word document", () => {
    expect(validateInvoiceFile(makeFile("application/msword", 1024))).not.toBeNull();
  });
  it("rejects a file over 10MB", () => {
    expect(validateInvoiceFile(makeFile("application/pdf", 10 * 1024 * 1024 + 1))).not.toBeNull();
  });
});

describe("validateInvoiceNumber", () => {
  it("accepts a typical GST invoice number", () => {
    expect(validateInvoiceNumber("INV/2026-27/0042")).toBeNull();
  });
  it("rejects an empty number", () => {
    expect(validateInvoiceNumber("  ")).not.toBeNull();
  });
  it("rejects more than 40 characters", () => {
    expect(validateInvoiceNumber("A".repeat(41))).not.toBeNull();
  });
});

describe("validateInvoiceDate", () => {
  const today = new Date(2026, 8, 21, 12);
  it("accepts today", () => {
    expect(validateInvoiceDate("2026-09-21", today)).toBeNull();
  });
  it("rejects tomorrow", () => {
    expect(validateInvoiceDate("2026-09-22", today)).not.toBeNull();
  });
  it("requires a date", () => {
    expect(validateInvoiceDate("", today)).not.toBeNull();
  });
});

describe("invoice total", () => {
  it("converts rupees to paise", () => {
    expect(rupeesToPaise("1,180.50")).toBe(118_050);
    expect(rupeesToPaise("abc")).toBeNull();
    expect(rupeesToPaise("0")).toBeNull();
  });
  it("accepts the expected total, within a rupee of rounding", () => {
    expect(validateInvoiceTotal("118", 11_800)).toBeNull();
    expect(validateInvoiceTotal("118.90", 11_800)).toBeNull();
  });
  it("rejects a total that includes the platform fee", () => {
    expect(validateInvoiceTotal("135.70", 11_800)).not.toBeNull();
  });
});
