const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

export class ApiError extends Error {
  code?: string;
  status: number;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type Envelope<T> =
  | { success: true; data: T; requestId?: string }
  | { success: false; error: { code?: string; message: string } };

async function parseEnvelope<T>(response: Response): Promise<T> {
  let envelope: Envelope<T>;
  try {
    envelope = await response.json();
  } catch {
    throw new ApiError(response.status, "The server returned an unexpected response.");
  }

  if (!envelope.success) {
    throw new ApiError(response.status, envelope.error.message, envelope.error.code);
  }

  return envelope.data;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, accessToken } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseEnvelope<T>(response);
}

// Multipart upload — no Content-Type header, so the browser sets the correct
// multipart boundary itself.
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  return parseEnvelope<T>(response);
}
