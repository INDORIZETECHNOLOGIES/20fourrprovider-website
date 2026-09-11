// Mirrors the backend's multer config (src/middleware/upload.ts): 10MB cap,
// and the same allowed MIME types (trimmed to what a KYC document actually is).
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function validateDocumentFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Upload a JPG, PNG, WEBP, or PDF file.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File is too large — the limit is 10MB.";
  }
  return null;
}
