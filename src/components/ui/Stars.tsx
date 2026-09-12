import styles from "./Stars.module.css";

type StarsProps = {
  /** 0–5. Rounded to the nearest whole star for display. */
  value: number;
  size?: number;
};

const STAR_PATH = "m12 4 2.32 4.7 5.18.76-3.75 3.66.89 5.16L12 15.83l-4.64 2.45.89-5.16-3.75-3.66 5.18-.76L12 4Z";

// Drawn with the same monoline geometry as Icon's star rather than the "★"/"☆"
// text characters the ratings UI used to concatenate — those pick up the body
// font's own metrics and can't be half-filled or sized reliably.
export function Stars({ value, size = 16 }: StarsProps) {
  const filled = Math.round(Math.min(5, Math.max(0, value)));

  return (
    <span
      className={styles.row}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={i < filled ? styles.starFilled : styles.starEmpty}
        >
          <path d={STAR_PATH} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}
