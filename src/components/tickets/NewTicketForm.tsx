"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { PageHeader } from "@/components/ui/PageHeader";
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

const DESCRIPTION_MAX = 1000;

// What our team needs in order to act on each kind of ticket, said at the point
// the provider is writing it rather than left for a follow-up question.
const TYPE_PROMPTS: Record<TicketType, string> = {
  dispute: "Which booking is in dispute? Include the reference, the date, and what you and the client disagree on.",
  misconduct: "What happened, when, and who was involved? Include the booking reference.",
  payment: "Which booking and what amount? Include the date you expected the payout to arrive.",
  absence: "Whose absence, on which booking, and what time did you realise?",
  misbehaviour: "What was said or done, when, and on which booking?",
  quality: "What fell short of what was agreed? Include the booking reference.",
  grievance: "What's the complaint, and what outcome are you asking for?",
  other: "Include dates, booking references, and what you expected to happen.",
};

const PRIORITY_HINT = "Use Urgent only for something affecting a shift happening right now.";

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

  const remaining = DESCRIPTION_MAX - description.length;

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <Link href="/tickets" className={styles.back}>
          Back to support
        </Link>

        <PageHeader
          title="New ticket"
          intro="Tell us what happened. Replies arrive on the ticket itself, and you'll get a notification when we answer."
        />

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError ? <Banner>{formError}</Banner> : null}

          {/* Two short selects that belong together, rather than one per row
              with the subject and description split between them. */}
          <div className={styles.selectRow}>
            <Select id="type" label="What's it about?" value={type} onChange={(e) => setType(e.target.value as TicketType)}>
              {TICKET_TYPES.map((value) => (
                <option key={value} value={value}>
                  {TICKET_TYPE_LABELS[value]}
                </option>
              ))}
            </Select>

            <Select
              id="priority"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              hint={PRIORITY_HINT}
            >
              {TICKET_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          <Field
            id="subject"
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={fieldErrors.subject}
            hint={fieldErrors.subject ? undefined : "One line, e.g. “Payout for booking 20F-1042 hasn’t arrived”"}
            placeholder="Summarise it in one line"
          />

          <div>
            <Textarea
              id="description"
              label="What happened?"
              rows={6}
              value={description}
              maxLength={DESCRIPTION_MAX}
              onChange={(e) => setDescription(e.target.value)}
              error={fieldErrors.description}
              hint={fieldErrors.description ? undefined : TYPE_PROMPTS[type]}
            />
            <p className={styles.counter} aria-live="polite">
              {remaining < 100 ? `${remaining} characters left` : `${description.length} of ${DESCRIPTION_MAX}`}
            </p>
          </div>

          {/* The backend seeds the first message from `description` only and
              ignores attachments on create — so say where a file can go. */}
          <p className={styles.note}>
            Need to send a photo or document? Open the ticket first, then attach it to a reply.
          </p>

          <div className={styles.actions}>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit ticket"}
            </Button>
            <Link href="/tickets" className={styles.cancel}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
