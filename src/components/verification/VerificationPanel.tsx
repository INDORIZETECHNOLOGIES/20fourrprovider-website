"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import { EmailVerificationSection } from "./EmailVerificationSection";
import { PhoneVerificationSection } from "./PhoneVerificationSection";
import styles from "./VerificationPanel.module.css";

type VerificationPanelProps = {
  accessToken: string;
  /** Called once both channels are verified, and immediately if they already
      were — also what "Skip for now" calls, since neither channel is a hard
      gate server-side (see CLAUDE.md). */
  onDone: () => void;
};

// Registration fires a phone OTP fire-and-forget and never touches email
// verification at all — both channels start false and stay that way until a
// provider does something about it. This panel is the one place that does:
// shown right after /verify routes here post-registration, and reachable again
// any time from the Account page if it was skipped or interrupted the first time.
//
// State is always re-derived from GET /auth/me on mount, never assumed from
// whatever step the provider last got to — that's what makes an interrupted
// flow (email done, then the tab closes before phone finishes, or the reverse)
// resumable instead of stuck: whichever channel is still false server-side is
// exactly the one this renders as outstanding, regardless of what happened in
// a previous visit.
export function VerificationPanel({ accessToken, onDone }: VerificationPanelProps) {
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser(accessToken)
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load your account. Try refreshing.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const bothVerified = user !== "loading" && user !== null && user.emailVerified && user.phoneVerified;

  useEffect(() => {
    // Both already done — nothing left for this screen to do. Covers a provider
    // who skipped last time and finished from the Account page instead, or who
    // simply refreshes this page after completing both.
    if (bothVerified) onDone();
  }, [bothVerified, onDone]);

  function handleVerified(patch: Partial<Pick<AuthUser, "emailVerified" | "phoneVerified">>) {
    setUser((current) => (current && current !== "loading" ? { ...current, ...patch } : current));
  }

  if (user === "loading" || bothVerified) return null;

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.column}>
          <Banner>{loadError ?? "Couldn't load your account."}</Banner>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Verify your contact details</h1>
        <p className={styles.subtext}>
          We use these to reach you about bookings, duty and payouts. Verify both, in either
          order — if something interrupts one, come back and finish it whenever suits you.
        </p>

        <PhoneVerificationSection
          phone={user.phone}
          phoneVerified={user.phoneVerified}
          accessToken={accessToken}
          onVerified={() => handleVerified({ phoneVerified: true })}
        />
        <EmailVerificationSection
          email={user.email}
          emailVerified={user.emailVerified}
          accessToken={accessToken}
          onVerified={() => handleVerified({ emailVerified: true })}
        />

        <div className={styles.skipRow}>
          <button type="button" className={styles.skipLink} onClick={onDone}>
            Skip for now — verify later from Account
          </button>
        </div>
      </div>
    </div>
  );
}
