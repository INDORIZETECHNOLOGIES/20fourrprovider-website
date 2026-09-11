import styles from "./Switch.module.css";

type SwitchProps = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function Switch({ id, label, checked, disabled, onChange }: SwitchProps) {
  return (
    <label htmlFor={id} className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ""}`}>
      <span className={`${styles.track} ${checked ? styles.trackOn : ""}`}>
        <span className={`${styles.thumb} ${checked ? styles.thumbOn : ""}`} />
      </span>
      <input
        id={id}
        className={styles.input}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
}
