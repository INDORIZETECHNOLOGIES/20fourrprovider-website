import type { ReactNode } from "react";
import styles from "./Banner.module.css";

export function Banner({ children }: { children: ReactNode }) {
  return <p className={styles.banner}>{children}</p>;
}
