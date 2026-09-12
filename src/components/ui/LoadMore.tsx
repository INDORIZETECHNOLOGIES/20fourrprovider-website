"use client";

import styles from "./LoadMore.module.css";

type LoadMoreProps = {
  loading: boolean;
  onClick: () => void;
  /** What's being loaded, e.g. "bookings" — used for the accessible label. */
  what: string;
};

// The same button lived in five list components with five identical copies of
// its CSS.
export function LoadMore({ loading, onClick, what }: LoadMoreProps) {
  return (
    <button
      type="button"
      className={styles.button}
      disabled={loading}
      onClick={onClick}
      aria-label={`Load more ${what}`}
    >
      {loading ? "Loading…" : "Load more"}
    </button>
  );
}
