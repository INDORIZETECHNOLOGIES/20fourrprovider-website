"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import { createTicket } from "@/lib/api/tickets";
import { validateTicketDescription, validateTicketSubject } from "@/lib/validation/tickets";
import {
  TICKET_PRIORITIES,
  TICKET_TYPES,
  TICKET_TYPE_LABELS,
  type TicketPriority,
  type TicketType,
} from "@/lib/constants/ticket";
import styles from "./NewTicketForm.module.css";

export function NewTicketForm({ accessToken }: { accessToken: string }) {
  const router = useRouter();
  const [type, setType] = useState<TicketType>("other");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [fieldErrors, setFieldErrors] = useState<{ subject?: string; description?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const errors = {
      subject: validateTicketSubject(subject) ?? undefined,
      description: validateTicketDescription(description) ?? undefined,
    };
    setFieldErrors(errors);
    if (errors.subject || errors.description) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const { ticket } = await createTicket({ type, subject, description, priority }, accessToken);
      router.push(`/tickets/${ticket._id}`);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>New ticket</h1>
        <p className={styles.subtext}>Tell us what happened — we&apos;ll follow up here.</p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError ? <Banner>{formError}</Banner> : null}

          <Select id="type" label="Type" value={type} onChange={(e) => setType(e.target.value as TicketType)}>
            {TICKET_TYPES.map((value) => (
              <option key={value} value={value}>
                {TICKET_TYPE_LABELS[value]}
              </option>
            ))}
          </Select>

          <Field
            id="subject"
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={fieldErrors.subject}
            hint={fieldErrors.subject ? undefined : "5-100 characters"}
          />

          <Textarea
            id="description"
            label="What happened?"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={fieldErrors.description}
            hint={fieldErrors.description ? undefined : "10-1000 characters"}
          />

          <Select
            id="priority"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
          >
            {TICKET_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </option>
            ))}
          </Select>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit ticket"}
          </Button>
        </form>
      </div>
    </div>
  );
}
