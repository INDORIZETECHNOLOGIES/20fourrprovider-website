import type { ReactNode } from "react";
import styles from "./AuthShell.module.css";

type AuthShellProps = {
  tagline: string;
  children: ReactNode;
  wide?: boolean;
};

export function AuthShell({ tagline, children, wide }: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.brand}>
        <div className={styles.brandTop}>
          <p className={styles.wordmark}>20fourr</p>
          <hr className={styles.rule} />
          <p className={styles.tagline}>{tagline}</p>

          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>✓</span>
              <span className={styles.trustText}>
                <strong>One-time verification</strong>
                Get verified once, work everywhere on the platform.
              </span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>⚡</span>
              <span className={styles.trustText}>
                <strong>Instant payouts</strong>
                Earnings settle directly to your bank, no delays.
              </span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustIcon}>🛡</span>
              <span className={styles.trustText}>
                <strong>Safety built in</strong>
                SOS, duty check-ins, and incident reporting on every shift.
              </span>
            </div>
          </div>
        </div>

        <p className={styles.foot}>
          For security professionals — guards, bouncers, gunmen, and PSOs.
        </p>
      </div>

      <div className={styles.formSide}>
        <div className={`${styles.formColumn} ${wide ? styles.formColumnWide : ""}`}>{children}</div>
      </div>
    </div>
  );
}
