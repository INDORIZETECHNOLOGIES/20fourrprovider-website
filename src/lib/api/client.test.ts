import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError } from "./client";

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      status,
      json: async () => body,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("returns data on a successful envelope", async () => {
    mockFetchOnce(200, { success: true, data: { userId: "u1" }, requestId: "r1" });

    const result = await apiRequest<{ userId: string }>("/auth/register", { method: "POST" });

    expect(result).toEqual({ userId: "u1" });
  });

  it("throws ApiError with the code and message on a failure envelope", async () => {
    mockFetchOnce(409, { success: false, error: { code: "SC_204", message: "Email taken" } });

    await expect(apiRequest("/auth/register", { method: "POST" })).rejects.toMatchObject({
      message: "Email taken",
      code: "SC_204",
      status: 409,
    });
  });

  it("wraps an unparsable response as an ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 502,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
    );

    await expect(apiRequest("/auth/login")).rejects.toBeInstanceOf(ApiError);
  });

  it("sends the bearer token when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/auth/me", { accessToken: "token-123" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });
});
