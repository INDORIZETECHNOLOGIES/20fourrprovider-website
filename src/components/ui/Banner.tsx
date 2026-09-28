import type { ReactNode } from "react";
import styles from "./Banner.module.css";

type BannerTone = "error" | "info" | "warning";

// Errors by default — every existing call site is one. `info` and `warning` are for notices
// that aren't failures (a card not yet placed in a city, a package above the daily rate).
export function Banner({ children, tone = "error" }: { children: ReactNode; tone?: BannerTone }) {
  return (
    <p className={`${styles.banner} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
