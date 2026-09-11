"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { createIncident, listIncidents, type Incident } from "@/lib/api/protection";
import { getCurrentCoordinates } from "@/lib/api/duty";
import { validateIncidentDescription } from "@/lib/validation/protection";
import { formatDate } from "@/lib/format";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUS_LABELS,
  type IncidentCategory,
  type IncidentSeverity,
} from "@/lib/constants/incident";
import styles from "./SafetyControls.module.css";

export function IncidentsSection({ bookingId, accessToken }: { bookingId: string; accessToken: string }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<IncidentCategory>("other");
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listIncidents(bookingId, accessToken)
      .then((result) => {
        if (!cancelled) setIncidents(result.incidents);
      })
      .catch(() => {
        // A failed list load isn't worth blocking the rest of the booking page for.
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, accessToken]);

  async function handleSubmit() {
    const validationError = validateIncidentDescription(description);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const coords = await getCurrentCoordinates();
      await createIncident(bookingId, { category, severity, description }, accessToken, coords);
      // The create response's `reporter` field isn't populated (unlike list), so refetch
      // rather than trust it for display.
      const { incidents: refreshed } = await listIncidents(bookingId, accessToken);
      setIncidents(refreshed);
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't report the incident. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Incidents</h2>
      <p className={styles.sectionText}>Report anything that went wrong during this booking.</p>

      {incidents.length > 0 ? (
        <div className={styles.incidentList}>
          {incidents.map((incident) => (
            <div key={incident._id} className={styles.incidentRow}>
              <div className={styles.incidentTop}>
                <span>{INCIDENT_CATEGORY_LABELS[incident.category]}</span>
                <span>{INCIDENT_STATUS_LABELS[incident.status] ?? incident.status}</span>
              </div>
              <p className={styles.sectionText}>{incident.description}</p>
              <span className={styles.incidentMeta}>
                {incident.reporter.name} · {formatDate(incident.createdAt)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}

      {!showForm ? (
        <button type="button" className={styles.secondaryButton} onClick={() => setShowForm(true)}>
          Report an incident
        </button>
      ) : (
        <div className={styles.form}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as IncidentCategory)}
          >
            {INCIDENT_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {INCIDENT_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={severity}
            onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
          >
            {INCIDENT_SEVERITIES.map((value) => (
              <option key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="What happened?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className={styles.row}>
            <button type="button" className={styles.secondaryButton} disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting…" : "Submit report"}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={submitting}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
