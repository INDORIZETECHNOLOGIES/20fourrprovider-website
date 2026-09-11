import { useEffect, useSyncExternalStore, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AuthTokens } from "@/lib/api/auth";

const STORAGE_KEY = "20fourr.provider.session";

type StoredSession = {
  tokens: AuthTokens;
  name: string;
};

// Interim client-side session store. Revisit once the app has a real
// session strategy (httpOnly cookies via a backend-for-frontend, most likely).
export function saveSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("storage"));
}

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("storage"));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

// SSR-safe read of the current session, kept in sync via useSyncExternalStore
// so hydration never mismatches against localStorage (unavailable on the server).
export function useSession(): StoredSession | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }, [raw]);
}

// Redirects to /login when there's truly no session. Deliberately does NOT
// key this off useSession()'s value: on a hard page load, that value can be
// transiently null while useSyncExternalStore resyncs from the server
// snapshot (always null) to the real localStorage value, and redirecting on
// that transient null sends a genuinely logged-in provider back to /login.
// This reads localStorage directly at effect-execution time instead, which
// is always accurate since effects only run after hydration completes.
export function useRedirectIfLoggedOut() {
  const router = useRouter();
  useEffect(() => {
    if (!readSession()) router.replace("/login");
  }, [router]);
}
