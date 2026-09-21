import { Field } from "@/components/ui/Field";
import { STAFF_CATEGORIES, STAFF_CATEGORY_LABELS, type StaffCategory } from "@/lib/api/staffAvailability";
import { validateCountText } from "@/lib/validation/staffAvailability";
import styles from "./StaffAvailability.module.css";

export type CountTexts = Record<StaffCategory, string>;

export const countTextsFrom = (counts?: Partial<Record<StaffCategory, number>> | null): CountTexts =>
  Object.fromEntries(STAFF_CATEGORIES.map((key) => [key, counts?.[key] ? String(counts[key]) : ""])) as CountTexts;

// One field per category; a blank field means none on that day.
export function CountsFields({
  idPrefix,
  values,
  disabled,
  onChange,
}: {
  idPrefix: string;
  values: CountTexts;
  disabled?: boolean;
  onChange: (next: CountTexts) => void;
}) {
  return (
    <div className={styles.pair}>
      {STAFF_CATEGORIES.map((key) => (
        <Field
          key={key}
          id={`${idPrefix}-${key}`}
          label={STAFF_CATEGORY_LABELS[key]}
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          value={values[key]}
          disabled={disabled}
          error={validateCountText(values[key])}
          onChange={(e) => onChange({ ...values, [key]: e.target.value })}
        />
      ))}
    </div>
  );
}
