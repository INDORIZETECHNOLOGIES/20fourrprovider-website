"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getCurrentCoordinates } from "@/lib/api/duty";
import { raiseSos, submitLiveLocation } from "@/lib/api/protection";
import styles from "./SafetyControls.module.css";

export function SosControl({ bookingId, accessToken }: { bookingId: string; accessToken: string }) {
  const [confirmingSos, setConfirmingSos] = useState(false);
  const [sendingSos, setSendingSos] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<string | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  async function handleRaiseSos() {
    setSosError(null);
    setSendingSos(true);
    try {
      const coords = await getCurrentCoordinates();
      await raiseSos(bookingId, accessToken, undefined, coords);
      setSosSent(true);
      setConfirmingSos(false);
    } catch (error) {
      setSosError(error instanceof ApiError ? error.message : "Couldn't send the SOS. Try again.");
    } finally {
      setSendingSos(false);
    }
  }

  async function handleCheckIn() {
    setCheckInError(null);
    setCheckInResult(null);
    setCheckingIn(true);
    try {
      const coords = await getCurrentCoordinates();
      if (!coords) {
        setCheckInError("Couldn't get your location. Check your browser's location permission.");
        return;
      }
      const result = await submitLiveLocation(bookingId, coords, accessToken);
      if (result.geofenceBreached) {
        setCheckInResult("Recorded — you appear to be outside the agreed site location.");
      } else if (result.withinFence === false) {
        setCheckInResult("Recorded — outside the site radius.");
      } else {
        setCheckInResult("Recorded — you're at the site.");
      }
    } catch (error) {
      setCheckInError(error instanceof ApiError ? error.message : "Couldn't check in. Try again.");
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <div className={`${styles.section} ${styles.sectionDanger}`}>
      <h2 className={styles.sectionTitle}>Duty safety</h2>
      <p className={styles.sectionText}>
        Raise an SOS if you&apos;re in danger, or check in to confirm you&apos;re on site.
      </p>

      {sosSent ? (
        <p className={styles.statusNote}>SOS sent. Our team and the client have been notified.</p>
      ) : (
        <div className={styles.row}>
          {!confirmingSos ? (
            <button type="button" className={styles.sosButton} onClick={() => setConfirmingSos(true)}>
              Raise SOS
            </button>
          ) : (
            <>
              <button type="button" className={styles.sosButton} disabled={sendingSos} onClick={handleRaiseSos}>
                {sendingSos ? "Sending…" : "Confirm SOS — alert admins & client"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={sendingSos}
                onClick={() => setConfirmingSos(false)}
              >
                Cancel
              </button>
            </>
          )}
          <button type="button" className={styles.secondaryButton} disabled={checkingIn} onClick={handleCheckIn}>
            {checkingIn ? "Checking in…" : "Check in"}
          </button>
        </div>
      )}
      {sosError ? <p className={styles.error}>{sosError}</p> : null}
      {checkInResult ? <p className={styles.statusNote}>{checkInResult}</p> : null}
      {checkInError ? <p className={styles.error}>{checkInError}</p> : null}
    </div>
  );
}
