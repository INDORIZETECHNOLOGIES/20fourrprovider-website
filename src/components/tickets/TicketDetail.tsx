"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import {
  addTicketMessage,
  closeTicket,
  getTicket,
  uploadTicketAttachment,
  type Ticket,
  type TicketAttachment,
} from "@/lib/api/tickets";
import { validateAttachmentFile } from "@/lib/validation/chat";
import { validateTicketMessage } from "@/lib/validation/tickets";
import { formatDate } from "@/lib/format";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TONE,
  TICKET_TYPE_LABELS,
} from "@/lib/constants/ticket";
import styles from "./TicketDetail.module.css";

function senderLabel(role: string): string {
  return role === "provider" ? "You" : "Support";
}

export function TicketDetail({ ticketId, accessToken }: { ticketId: string; accessToken: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<TicketAttachment | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTicket(ticketId, accessToken)
      .then(({ ticket }) => {
        if (!cancelled) setTicket(ticket);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Couldn't load ticket.");
      });
    return () => {
      cancelled = true;
    };
  }, [ticketId, accessToken]);

  async function refresh() {
    try {
      const { ticket } = await getTicket(ticketId, accessToken);
      setTicket(ticket);
    } catch {
      // Keep showing the last known state; the composer error already surfaced the failure.
    }
  }

  async function handleAttach(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateAttachmentFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setAttaching(true);
    try {
      const attachment = await uploadTicketAttachment(ticketId, file, accessToken);
      setPendingAttachment(attachment);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Try again.");
    } finally {
      setAttaching(false);
    }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const validationError = validateTicketMessage(message);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSending(true);
    try {
      await addTicketMessage(
        ticketId,
        message.trim(),
        accessToken,
        pendingAttachment ? [pendingAttachment] : undefined,
      );
      setMessage("");
      setPendingAttachment(null);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Message didn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    setError(null);
    setClosing(true);
    try {
      await closeTicket(ticketId, accessToken);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't close the ticket.");
    } finally {
      setClosing(false);
    }
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.column}>
          <Banner>{loadError}</Banner>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const isClosed = ticket.status === "closed";

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>{ticket.subject}</h1>
            <div className={styles.badges}>
              <Badge tone={TICKET_STATUS_TONE[ticket.status]}>{TICKET_STATUS_LABELS[ticket.status]}</Badge>
            </div>
          </div>
          {!isClosed ? (
            <button type="button" className={styles.closeButton} disabled={closing} onClick={handleClose}>
              {closing ? "Closing…" : "Close ticket"}
            </button>
          ) : null}
        </div>
        <p className={styles.meta}>
          {TICKET_TYPE_LABELS[ticket.type]} · Opened {formatDate(ticket.createdAt)}
        </p>

        <div className={styles.messages}>
          {ticket.messages.map((msg, index) => {
            const mine = msg.senderRole === "provider";
            return (
              <div key={index} className={`${styles.row} ${mine ? styles.rowMine : ""}`}>
                <div className={styles.bubbleWrap}>
                  <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                    {msg.message}
                    {msg.attachments?.map((attachment, attachmentIndex) =>
                      attachment.fileUrl ? (
                        <a
                          key={attachmentIndex}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.attachmentLink}
                        >
                          {attachment.fileName || "Download attachment"}
                        </a>
                      ) : null,
                    )}
                  </div>
                  <span className={`${styles.metaSmall} ${mine ? styles.metaMine : ""}`}>
                    {senderLabel(msg.senderRole)} · {formatDate(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        {isClosed ? (
          <p className={styles.closedNote}>This ticket is closed. Open a new one if you need to follow up.</p>
        ) : (
          <form className={styles.composer} onSubmit={handleSend}>
            <textarea
              className={styles.input}
              rows={3}
              placeholder="Write a message"
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className={styles.composerActions}>
              <label className={styles.attachButton}>
                {attaching ? "Uploading…" : pendingAttachment ? "Attached" : "Attach"}
                <input type="file" onChange={handleAttach} disabled={attaching || sending} />
              </label>
              {pendingAttachment ? (
                <span className={styles.pendingAttachment}>{pendingAttachment.fileName}</span>
              ) : null}
              <button type="submit" className={styles.sendButton} disabled={sending || attaching}>
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
