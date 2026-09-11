import type { SelectHTMLAttributes } from "react";
import styles from "./Select.module.css";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string | null;
};

export function Select({ label, error, id, className, children, ...selectProps }: SelectProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`${styles.select} ${error ? styles.invalid : ""} ${className ?? ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...selectProps}
      >
        {children}
      </select>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
