export function validateAccountNumber(value: string): string | null {
  if (!/^\d{9,18}$/.test(value.trim())) return "Account number must be 9–18 digits.";
  return null;
}

export function validateIfscCode(value: string): string | null {
  if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(value.trim())) {
    return "Invalid IFSC code (expected format: ABCD0123456).";
  }
  return null;
}

export function validateAccountName(value: string): string | null {
  if (!value.trim()) return "Enter the account holder's name.";
  if (value.trim().length > 100) return "Name must be 100 characters or fewer.";
  return null;
}
