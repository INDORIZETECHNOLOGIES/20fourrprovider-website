const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const PAN_HOLDER_CHARS = new Set(["P", "H", "C", "F", "A", "T", "B", "L", "J", "G"]);
// Structural check only — the checksum (GSTN modulo-36) is verified server-side.
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validatePan(value: string): string | null {
  const pan = value.trim().toUpperCase();
  if (!pan) return "PAN is required.";
  if (!PAN_PATTERN.test(pan) || !PAN_HOLDER_CHARS.has(pan[3])) {
    return "Invalid PAN (expected format: ABCDE1234F).";
  }
  return null;
}

export function validateGstin(value: string): string | null {
  const gstin = value.trim().toUpperCase();
  if (!gstin) return "GSTIN is required for a registered tax tier.";
  if (!GSTIN_PATTERN.test(gstin)) return "Invalid GSTIN format.";
  return null;
}

export function validateTurnoverAmount(rupees: string): string | null {
  if (!rupees.trim()) return null;
  const value = Number(rupees);
  if (!Number.isFinite(value) || value < 0) return "Enter a valid amount.";
  return null;
}

export function validatePsaraLicenceNumber(value: string): string | null {
  if (!value.trim()) return "Licence number is required.";
  if (value.trim().length > 100) return "Licence number is too long.";
  return null;
}

export function validatePsaraExpiry(value: string): string | null {
  if (!value) return "Expiry date is required.";
  if (new Date(value).getTime() < Date.now()) return "Expiry date can't be in the past.";
  return null;
}
