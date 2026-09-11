import type { TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string | null;
};

export function Textarea({ label, hint, error, id, className, ...textareaProps }: TextareaProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className={`${styles.input} ${error ? styles.invalid : ""} ${className ?? ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId ?? hintId}
        {...textareaProps}
      />
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
