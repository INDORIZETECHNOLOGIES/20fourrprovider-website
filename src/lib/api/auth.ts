import { apiRequest, apiUpload } from "./client";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterProviderInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  marketingConsent: boolean;
};

export type RegisterProviderResult = {
  userId: string;
  email: string;
  phone: string;
  role: "provider";
  message: string;
  tokens: AuthTokens;
};

export function registerProvider(input: RegisterProviderInput): Promise<RegisterProviderResult> {
  return apiRequest<RegisterProviderResult>("/auth/register", {
    method: "POST",
    body: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      confirmPassword: input.confirmPassword,
      role: "provider",
      referralCode: input.referralCode || undefined,
      termsAcceptedAt: new Date().toISOString(),
      dpdpConsentPurposes: { marketing: input.marketingConsent },
    },
  });
}

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: "client" | "provider";
    profilePhoto: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  tokens: AuthTokens;
  requiresVerification: boolean;
};

export function loginProvider(input: LoginInput): Promise<LoginResult> {
  return apiRequest<LoginResult>("/auth/login", {
    method: "POST",
    body: { email: input.email, password: input.password, role: "provider" },
  });
}

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "client" | "provider";
  profilePhoto: string | null; // presigned URL, ready to render
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus?: string;
};

export function getCurrentUser(accessToken: string): Promise<{ user: AuthUser }> {
  return apiRequest("/auth/me", { accessToken });
}

// Phone OTP verification — deliberately NOT authenticated (no accessToken param).
// The backend keys both calls off the phone number itself via MSG91, not off the
// signed-in user, so these work the instant a phone number exists, before or after
// login. See CLAUDE.md: verify-otp silently no-ops (no error) if the phone doesn't
// match any User document, which is why callers must confirm via GET /auth/me
// afterward rather than trust this call's own success response.
export function sendPhoneOtp(phone: string): Promise<void> {
  return apiRequest("/auth/send-otp", { method: "POST", body: { phone } });
}

export function verifyPhoneOtp(phone: string, otp: string): Promise<void> {
  return apiRequest("/auth/verify-otp", { method: "POST", body: { phone, otp } });
}

// Message-only responses (no `data`) — see CLAUDE.md. The frontend shows its own
// static copy rather than the backend's message text.
export function forgotPassword(email: string): Promise<void> {
  return apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
): Promise<void> {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: { token, password, confirmPassword },
  });
}

export function sendEmailVerification(accessToken: string): Promise<void> {
  return apiRequest("/auth/send-email-verification", { method: "POST", accessToken });
}

export function verifyEmail(otp: string, accessToken: string): Promise<void> {
  return apiRequest("/auth/verify-email", { method: "POST", body: { otp }, accessToken });
}

export function updateProfilePhoto(file: File, accessToken: string): Promise<{ profilePhoto: string | null }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload("/auth/profile-photo", formData, accessToken, "PATCH");
}
