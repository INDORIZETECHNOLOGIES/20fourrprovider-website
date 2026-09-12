"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/ui/PageHeader";
import { markAllNotificationsRead } from "@/lib/api/notifications";
import { NotificationsList } from "./NotificationsList";
import styles from "./NotificationsPanel.module.css";

type ReadFilter = "" | "unread" | "read";

export function NotificationsPanel({ accessToken }: { accessToken: string }) {
  const [filter, setFilter] = useState<ReadFilter>("");
  const [markingAll, setMarkingAll] = useState(false);
  // Bumping this key remounts NotificationsList, forcing a clean refetch —
  // simpler than threading a manual refresh callback through the list.
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(accessToken);
      setRefreshKey((key) => key + 1);
    } catch {
      // Leave the list as-is; the provider can retry.
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <PageHeader
          title="Notifications"
          intro="Updates on your bookings, duty and account."
          action={
            <button
              type="button"
              className={styles.markAllButton}
              disabled={markingAll}
              onClick={handleMarkAllRead}
            >
              {markingAll ? "Marking…" : "Mark all read"}
            </button>
          }
        />

        <div className={styles.filterRow}>
          <Select
            id="notificationFilter"
            label="Show"
            value={filter}
            onChange={(e) => setFilter(e.target.value as ReadFilter)}
          >
            <option value="">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </Select>
        </div>

        <NotificationsList key={`${filter}-${refreshKey}`} filter={filter} accessToken={accessToken} />
      </div>
    </div>
  );
}
