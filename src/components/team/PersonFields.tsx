import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { PERSONNEL_CATEGORIES } from "@/lib/api/personnel";
import { PERSONNEL_CATEGORY_LABELS, type DraftErrors, type PersonDraft } from "@/lib/team";
import styles from "./Team.module.css";

/** The details shared by the add form and a person's editor. */
export function PersonFields({
  idPrefix,
  draft,
  errors,
  disabled,
  onChange,
}: {
  idPrefix: string;
  draft: PersonDraft;
  errors: DraftErrors;
  disabled?: boolean;
  onChange: (next: PersonDraft) => void;
}) {
  const set = (key: keyof PersonDraft) => (e: { target: { value: string } }) => onChange({ ...draft, [key]: e.target.value });

  return (
    <div className={styles.fields}>
      <Field id={`${idPrefix}-name`} label="Full name" value={draft.fullName} onChange={set("fullName")} error={errors.fullName} disabled={disabled} autoComplete="off" />
      <Select
        id={`${idPrefix}-category`}
        label="Works as"
        value={draft.category}
        onChange={set("category")}
        error={errors.category}
        disabled={disabled}
      >
        <option value="" disabled>
          Choose
        </option>
        {PERSONNEL_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {PERSONNEL_CATEGORY_LABELS[c].one}
          </option>
        ))}
      </Select>
      <Field
        id={`${idPrefix}-phone`}
        label="Phone (optional)"
        inputMode="numeric"
        value={draft.phone}
        onChange={set("phone")}
        error={errors.phone}
        disabled={disabled}
        hint="Given to the client once they've paid."
      />
      <Field
        id={`${idPrefix}-years`}
        label="Years of experience"
        inputMode="numeric"
        value={draft.yearsExperience}
        onChange={set("yearsExperience")}
        error={errors.yearsExperience}
        disabled={disabled}
      />
      <Field
        id={`${idPrefix}-languages`}
        label="Languages"
        placeholder="Hindi, Marathi, English"
        value={draft.languages}
        onChange={set("languages")}
        error={errors.languages}
        disabled={disabled}
      />
      <Field
        id={`${idPrefix}-height`}
        label="Height in cm (optional)"
        inputMode="numeric"
        value={draft.heightCm}
        onChange={set("heightCm")}
        error={errors.heightCm}
        disabled={disabled}
      />
    </div>
  );
}
