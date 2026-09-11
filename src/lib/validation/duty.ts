// The backend generates a 6-digit numeric OTP (DutySession.generateStartOtp/generateEndOtp).
export function validateOtp(otp: string): string | null {
  if (!/^\d{6}$/.test(otp)) return "Enter the 6-digit code.";
  return null;
}
