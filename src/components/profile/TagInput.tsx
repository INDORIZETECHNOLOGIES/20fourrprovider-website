"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import fieldStyles from "@/components/ui/Field.module.css";
import styles from "./ProfileForms.module.css";

type TagInputProps = {
  id: string;
  label: string;
  hint?: string;
  placeholder?: string;
  tags: string[];
  max: number;
  maxLength: number;
  onChange: (tags: string[]) => void;
};

// Enter adds a tag instead of submitting the surrounding form.
export function TagInput({ id, label, hint, placeholder, tags, max, maxLength, onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const full = tags.length >= max;

  function add() {
    const value = draft.trim();
    if (!value) return;
    if (tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setError(`"${value}" is already added.`);
      return;
    }
    if (full) return;
    setError(null);
    onChange([...tags, value]);
    setDraft("");
  }

  return (
    <div className={styles.tags}>
      <label className={styles.tagLabel} htmlFor={id}>
        {label}
      </label>
      <div className={styles.tagEntry}>
        <input
          id={id}
          className={fieldStyles.input}
          value={draft}
          maxLength={maxLength}
          placeholder={full ? `You can add up to ${max}` : placeholder}
          disabled={full}
          aria-describedby={`${id}-hint`}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className={styles.tagAdd} onClick={add} disabled={full || !draft.trim()}>
          Add
        </button>
      </div>
      {error ? (
        <p className={fieldStyles.error} role="alert">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className={fieldStyles.hint} style={{ whiteSpace: "normal" }}>
          {hint ? `${hint} ` : ""}
          {tags.length}/{max} added.
        </p>
      )}
      {tags.length > 0 ? (
        <ul className={styles.chipList} aria-label={label}>
          {tags.map((tag) => (
            <li key={tag} className={styles.chip}>
              {tag}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
              >
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
