"use client";

import { useState } from "react";
import { deleteNotification, markNotificationRead, type Notification } from "@/lib/api/notifications";
import { formatDate } from "@/lib/format";
import styles from "./NotificationRow.module.css";

type NotificationRowProps = {
  notification: Notification;
  accessToken: string;
  onRead: (notificationId: string) => void;
  onDeleted: (notificationId: string) => void;
};

export function NotificationRow({ notification, accessToken, onRead, onDeleted }: NotificationRowProps) {
  const [busy, setBusy] = useState(false);

  async function handleMarkRead() {
    setBusy(true);
    try {
      await markNotificationRead(notification._id, accessToken);
      onRead(notification._id);
    } catch {
      // Leave the row as-is; the provider can retry.
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteNotification(notification._id, accessToken);
      onDeleted(notification._id);
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className={styles.row}>
      <span className={`${styles.dot} ${notification.isRead ? styles.dotHidden : ""}`} />
      <div className={styles.content}>
        <p className={styles.title}>{notification.title}</p>
        <p className={styles.body}>{notification.body}</p>
        <div className={styles.meta}>
          <span>{formatDate(notification.createdAt)}</span>
          {!notification.isRead ? (
            <button type="button" className={styles.actionButton} disabled={busy} onClick={handleMarkRead}>
              Mark read
            </button>
          ) : null}
          <button type="button" className={styles.actionButton} disabled={busy} onClick={handleDelete}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
