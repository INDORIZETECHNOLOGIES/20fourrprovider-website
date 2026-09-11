import { describe, expect, it } from "vitest";
import { validateDocumentFile } from "./documents";

function makeFile(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], "doc", { type });
}

describe("validateDocumentFile", () => {
  it("rejects a disallowed mime type", () => {
    expect(validateDocumentFile(makeFile("application/zip", 1024))).not.toBeNull();
  });

  it("rejects a file over 10MB", () => {
    expect(validateDocumentFile(makeFile("application/pdf", 10 * 1024 * 1024 + 1))).not.toBeNull();
  });

  it("accepts a small PDF", () => {
    expect(validateDocumentFile(makeFile("application/pdf", 1024))).toBeNull();
  });

  it("accepts a small JPEG", () => {
    expect(validateDocumentFile(makeFile("image/jpeg", 1024))).toBeNull();
  });
});
