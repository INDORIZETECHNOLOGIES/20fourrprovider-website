import type { ReactNode } from "react";
import styles from "./AuthShell.module.css";

type AuthShellProps = {
  tagline: string;
  children: ReactNode;
};

export function AuthShell({ tagline, children }: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.brand}>
        <div>
          <p className={styles.wordmark}>20fourr</p>
          <hr className={styles.rule} />
          <p className={styles.tagline}>{tagline}</p>
        </div>
        <p className={styles.foot}>For security professionals — guards, bouncers, gunmen, and PSOs.</p>
      </div>
      <div className={styles.formSide}>
        <div className={styles.formColumn}>{children}</div>
      </div>
    </div>
  );
}
