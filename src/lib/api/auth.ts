import { apiRequest } from "./client";

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
