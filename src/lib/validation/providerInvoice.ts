// Mirrors the backend's checks in billing/invoicing/providerInvoice.ts.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const INVOICE_NUMBER = /^[A-Za-z0-9][A-Za-z0-9/_\-. ]{0,39}$/;
/** Same rounding slack the backend allows. */
const TOTAL_TOLERANCE_PAISE = 100;

export function validateInvoiceFile(file: File | null): string | null {
  if (!file) return "Attach your invoice.";
  if (!ALLOWED_MIME_TYPES.includes(file.type)) return "Upload the invoice as a PDF, JPG or PNG.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "File is too large — the limit is 10MB.";
  return null;
}

export function validateInvoiceNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Enter the invoice number.";
  if (!INVOICE_NUMBER.test(trimmed)) {
    return "Use up to 40 letters, digits, and / - _ . as printed on the invoice.";
  }
  return null;
}

/** `value` is the <input type="date"> string, YYYY-MM-DD. */
export function validateInvoiceDate(value: string, today: Date = new Date()): string | null {
  if (!value) return "Enter the invoice date.";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Enter a valid date.";
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  if (date.getTime() > endOfToday.getTime()) return "The invoice date can't be in the future.";
  return null;
}

/** Rupee string from the form → paise, or null when it isn't a positive amount. */
export function rupeesToPaise(value: string): number | null {
  const trimmed = value.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const paise = Math.round(Number(trimmed) * 100);
  return paise > 0 ? paise : null;
}

export function validateInvoiceTotal(value: string, expectedPaise: number): string | null {
  const paise = rupeesToPaise(value);
  if (paise === null) return "Enter the invoice total in rupees.";
  if (Math.abs(paise - expectedPaise) > TOTAL_TOLERANCE_PAISE) {
    return `The total must be ₹${(expectedPaise / 100).toFixed(2)} — the amount the client paid for your service.`;
  }
  return null;
}
