import { describe, expect, it } from "vitest";
import { validateMessageContent, validateAttachmentFile } from "./chat";

describe("validateMessageContent", () => {
  it("rejects an empty/whitespace-only message", () => {
    expect(validateMessageContent("   ")).not.toBeNull();
  });

  it("rejects a message over 1000 characters", () => {
    expect(validateMessageContent("a".repeat(1001))).not.toBeNull();
  });

  it("accepts a normal message", () => {
    expect(validateMessageContent("Running 10 minutes late.")).toBeNull();
  });
});

describe("validateAttachmentFile", () => {
  function makeFile(type: string, sizeBytes: number): File {
    return new File([new Uint8Array(sizeBytes)], "attachment", { type });
  }

  it("rejects a disallowed mime type", () => {
    expect(validateAttachmentFile(makeFile("application/zip", 1024))).not.toBeNull();
  });

  it("rejects a file over 10MB", () => {
    expect(validateAttachmentFile(makeFile("image/png", 10 * 1024 * 1024 + 1))).not.toBeNull();
  });

  it("accepts a small image", () => {
    expect(validateAttachmentFile(makeFile("image/jpeg", 1024))).toBeNull();
  });
});
