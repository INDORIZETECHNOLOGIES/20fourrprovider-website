import type { PerformanceImportance } from "@/lib/api/performance";
import styles from "./Performance.module.css";

const FILLED: Record<PerformanceImportance, number> = { high: 3, medium: 2, low: 1 };
const LABEL: Record<PerformanceImportance, string> = {
  high: "High importance",
  medium: "Medium importance",
  low: "Low importance",
};

/** Three ascending bars, filled by how much a signal weighs in search. The words are always read out. */
export function ImportanceMark({ level }: { level: PerformanceImportance }) {
  return (
    <span className={styles.importance} title={LABEL[level]}>
      <span className={styles.bars} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`${styles.bar} ${n <= FILLED[level] ? styles.barOn : ""}`} />
        ))}
      </span>
      <span className={styles.importanceText}>{LABEL[level].replace(" importance", "")}</span>
    </span>
  );
}
