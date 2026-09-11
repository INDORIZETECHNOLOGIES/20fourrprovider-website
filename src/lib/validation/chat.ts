export function validateMessageContent(content: string): string | null {
  if (!content.trim()) return "Write a message first.";
  if (content.length > 1000) return "Keep messages under 1000 characters.";
  return null;
}

// Mirrors the backend's shared upload middleware (src/middleware/upload.ts): 10MB cap,
// same allowed MIME types as document uploads.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

export function validateAttachmentFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "That file type isn't supported.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File is too large — the limit is 10MB.";
  }
  return null;
}
