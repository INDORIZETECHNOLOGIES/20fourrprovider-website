import type { ReactNode } from "react";
import styles from "./RowList.module.css";

// One bordered container with hairline-divided rows, rather than a stack of
// separately-bordered cards each casting its own shadow. The divider comes from
// the container, so a row component doesn't have to know it's in a list.
export function RowList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.list} ${className ?? ""}`}>{children}</div>;
}
