"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { EmptyState } from "@/components/ui/EmptyState";
import { listNotifications, type Notification } from "@/lib/api/notifications";
import type { Pagination } from "@/lib/api/bookings";
import { NotificationRow } from "./NotificationRow";
import styles from "./NotificationsPanel.module.css";

type ReadFilter = "" | "unread" | "read";

type NotificationsListProps = {
  filter: ReadFilter;
  accessToken: string;
};

function toIsRead(filter: ReadFilter): boolean | undefined {
  if (filter === "unread") return false;
  if (filter === "read") return true;
  return undefined;
}

// Mounted with key={filter} by NotificationsPanel, so a filter change remounts
// this component with fresh initial state instead of needing to reset it.
export function NotificationsList({ filter, accessToken }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listNotifications(accessToken, { isRead: toIsRead(filter), page: 1 })
      .then((result) => {
        if (cancelled) return;
        setNotifications(result.notifications);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load notifications. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, filter]);

  async function handleLoadMore() {
    if (!pagination) return;
    setLoadingMore(true);
    try {
      const result = await listNotifications(accessToken, {
        isRead: toIsRead(filter),
        page: pagination.page + 1,
      });
      setNotifications((current) => [...current, ...result.notifications]);
      setPagination(result.pagination);
    } catch {
      setError("Couldn't load more notifications.");
    } finally {
      setLoadingMore(false);
    }
  }

  function handleRead(notificationId: string) {
    setNotifications((current) =>
      current.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)),
    );
  }

  function handleDeleted(notificationId: string) {
    setNotifications((current) => current.filter((n) => n._id !== notificationId));
  }

  const hasMore = pagination ? pagination.page < pagination.pages : false;

  return (
    <>
      {error ? <Banner>{error}</Banner> : null}

      {!loading && notifications.length === 0 ? (
        filter === "unread" ? (
        <EmptyState icon="bell" title="You're all caught up" body="No unread notifications." />
      ) : filter === "read" ? (
        <EmptyState icon="bell" title="No read notifications" />
      ) : (
        <EmptyState
          icon="bell"
          title="No notifications yet"
          body="Booking requests, duty reminders and payout updates will appear here."
        />
      )
      ) : null}

      {notifications.map((notification) => (
        <NotificationRow
          key={notification._id}
          notification={notification}
          accessToken={accessToken}
          onRead={handleRead}
          onDeleted={handleDeleted}
        />
      ))}

      {hasMore ? (
        <button type="button" className={styles.loadMore} disabled={loadingMore} onClick={handleLoadMore}>
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </>
  );
}
