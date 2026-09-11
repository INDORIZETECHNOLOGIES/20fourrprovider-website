import { apiRequest } from "./client";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function verifyStartOtp(
  bookingId: string,
  otp: string,
  accessToken: string,
  coords?: Coordinates,
): Promise<{ message: string; dutyStartedAt: string }> {
  return apiRequest(`/duty/${bookingId}/verify-start-otp`, {
    method: "POST",
    body: { otp, ...coords },
    accessToken,
  });
}

export function verifyEndOtp(
  bookingId: string,
  otp: string,
  accessToken: string,
): Promise<{ message: string; dutyEndedAt: string }> {
  return apiRequest(`/duty/${bookingId}/verify-end-otp`, {
    method: "POST",
    body: { otp },
    accessToken,
  });
}

export function confirmGuardStart(bookingId: string, accessToken: string): Promise<{ message: string }> {
  return apiRequest(`/duty/${bookingId}/confirm-guard-start`, { method: "POST", accessToken });
}

export function confirmGuardEnd(bookingId: string, accessToken: string): Promise<{ message: string }> {
  return apiRequest(`/duty/${bookingId}/confirm-guard-end`, { method: "POST", accessToken });
}

// Best-effort, non-blocking: the backend records a check-in geofence result when
// coordinates are supplied, but never blocks OTP verification without them.
export function getCurrentCoordinates(): Promise<Coordinates | undefined> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(undefined);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(undefined),
      { timeout: 3000 },
    );
  });
}
