const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Enter your phone number.";
  if (!INDIAN_MOBILE_PATTERN.test(phone)) return "Enter a valid 10-digit mobile number.";
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Enter your name.";
  return null;
}

// Mirrors the backend policy: 8-128 chars, needs lower+upper+digit+special char.
export function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 128) {
    return "Password must be 8-128 characters.";
  }
  if (!/[a-z]/.test(password)) return "Password needs a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password needs an uppercase letter.";
  if (!/\d/.test(password)) return "Password needs a number.";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Password needs a symbol.";
  return null;
}

export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) return "Passwords don't match.";
  return null;
}

export function validateOtp(otp: string): string | null {
  if (!/^\d{6}$/.test(otp.trim())) return "Enter the 6-digit code.";
  return null;
}
