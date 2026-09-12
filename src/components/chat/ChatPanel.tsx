"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Banner } from "@/components/ui/Banner";
import { ApiError } from "@/lib/api/client";
import {
  getChatHistory,
  sendChatMessage,
  uploadChatAttachment,
  type ChatMessage,
} from "@/lib/api/chat";
import { validateAttachmentFile, validateMessageContent } from "@/lib/validation/chat";
import styles from "./ChatPanel.module.css";

const POLL_INTERVAL_MS = 5000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel({ bookingId, accessToken }: { bookingId: string; accessToken: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    function poll() {
      getChatHistory(bookingId, accessToken)
        .then((result) => {
          if (!cancelled) setMessages(result.messages);
        })
        .catch((error) => {
          if (!cancelled) {
            setLoadError(error instanceof ApiError ? error.message : "Couldn't load messages.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingId, accessToken]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const validationError = validateMessageContent(content);
    if (validationError) {
      setSendError(validationError);
      return;
    }

    setSendError(null);
    setSending(true);
    try {
      const { message } = await sendChatMessage(bookingId, content.trim(), accessToken);
      setMessages((current) => [...current, message]);
      setContent("");
    } catch (error) {
      setSendError(error instanceof ApiError ? error.message : "Message didn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleAttach(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateAttachmentFile(file);
    if (validationError) {
      setSendError(validationError);
      return;
    }

    setSendError(null);
    setSending(true);
    try {
      const { message } = await uploadChatAttachment(bookingId, file, accessToken);
      setMessages((current) => [...current, message]);
    } catch (error) {
      setSendError(error instanceof ApiError ? error.message : "Upload failed. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <h1 className={styles.heading}>Chat</h1>

        {loadError ? <Banner>{loadError}</Banner> : null}

        <div className={styles.messages} ref={messagesRef}>
          {!loading && messages.length === 0 ? (
            <p className={styles.empty}>No messages yet. Say hello.</p>
          ) : null}
          {messages.map((message) => {
            const mine = message.senderId.role === "provider";
            return (
              <div key={message._id} className={`${styles.row} ${mine ? styles.rowMine : ""}`}>
                <div className={styles.bubbleWrap}>
                  <div className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                    {message.messageType === "image" && message.fileUrl ? (
                      <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img src={message.fileUrl} alt="Attachment" className={styles.attachmentImage} />
                      </a>
                    ) : message.messageType === "file" && message.fileUrl ? (
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.attachmentLink}
                      >
                        {message.fileName || "Download attachment"}
                      </a>
                    ) : (
                      message.content
                    )}
                  </div>
                  <span className={`${styles.meta} ${mine ? styles.metaMine : ""}`}>
                    {mine ? "You" : message.senderId.name} · {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {sendError ? <p className={styles.error}>{sendError}</p> : null}

        <form className={styles.composer} onSubmit={handleSend}>
          <textarea
            className={styles.input}
            rows={1}
            placeholder="Write a message"
            value={content}
            maxLength={1000}
            onChange={(e) => setContent(e.target.value)}
          />
          <label className={styles.attachButton}>
            Attach
            <input type="file" onChange={handleAttach} disabled={sending} />
          </label>
          <button type="submit" className={styles.sendButton} disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
