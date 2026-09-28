"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { API_ORIGIN } from "@/lib/api/client";
import { readSession } from "@/lib/auth/session";

// Backend spec 0020. The server emits `account_event` to the user's private room whenever it
// records a notification for them. The payload only says *what kind of thing* changed and which
// one — never its contents — so a page reacts by refetching through lib/api, and the serializer
// stays the only PII boundary. Never render anything from the payload.

export type AccountEventEntity = "booking" | "contract" | "payment" | "document" | "ticket" | "rating" | "account";

export type AccountEvent = {
  type: string;
  entity: AccountEventEntity;
  entityId: string | null;
  at: string;
};

const ENTITIES: readonly string[] = ["booking", "contract", "payment", "document", "ticket", "rating", "account"];

export function isAccountEvent(value: unknown): value is AccountEvent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.type === "string" &&
    typeof v.entity === "string" &&
    ENTITIES.includes(v.entity) &&
    (v.entityId === null || typeof v.entityId === "string")
  );
}

export type LiveFilter = {
  /** Entities that make this view stale, or "any" for every event (e.g. the unread count). */
  entities: readonly AccountEventEntity[] | "any";
  /** Only this one record — a detail page. Events without an id don't match. */
  entityId?: string | null;
};

export function matchesFilter(event: AccountEvent, filter: LiveFilter): boolean {
  if (filter.entities !== "any" && !filter.entities.includes(event.entity)) return false;
  if (filter.entityId) return event.entityId === filter.entityId;
  return true;
}

// ── One connection per tab, shared by every subscriber ─────────────────────────────────────

type Listener = { onEvent: (event: AccountEvent) => void; onResync: () => void };

const listeners = new Set<Listener>();
let socket: Socket | null = null;
let socketToken: string | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

/** Grace before closing an unused socket, so a route change doesn't reconnect. */
const IDLE_CLOSE_MS = 5_000;

function currentToken(): string | null {
  return readSession()?.tokens.accessToken ?? null;
}

function teardown() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  socketToken = null;
}

function connect() {
  const token = currentToken();
  if (!token || (socket && socketToken === token)) return;
  teardown();

  let connectedBefore = false;
  socketToken = token;
  socket = io(API_ORIGIN, {
    // Read at every (re)connect, not captured once, so a new login is picked up.
    auth: (cb) => cb({ token: currentToken() }),
    reconnectionDelayMax: 30_000,
  });

  socket.on("account_event", (payload: unknown) => {
    if (!isAccountEvent(payload)) return;
    listeners.forEach((l) => l.onEvent(payload));
  });

  // Events sent while disconnected are gone for good (no replay, by design), so a reconnect
  // refetches whatever is on screen once. The first connect doesn't: the page just loaded.
  socket.on("connect", () => {
    if (connectedBefore) listeners.forEach((l) => l.onResync());
    connectedBefore = true;
  });

  // A rejected token won't get better by retrying. The next REST call hits the same 401 and
  // signs the provider out; a fresh login restarts the socket via the storage listener.
  socket.on("connect_error", (err) => {
    if (err.message.startsWith("AUTH_")) teardown();
  });
}

function onSessionChange() {
  if (!currentToken()) return teardown();
  if (listeners.size > 0) connect();
}

function subscribe(listener: Listener): () => void {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  if (listeners.size === 0) window.addEventListener("storage", onSessionChange);
  listeners.add(listener);
  connect();

  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    window.removeEventListener("storage", onSessionChange);
    idleTimer = setTimeout(teardown, IDLE_CLOSE_MS);
  };
}

/** Several notifications often land together (payment + booking); refetch once for the burst. */
const DEBOUNCE_MS = 400;

/**
 * Refetch this view's data whenever the server says something it shows has changed, and once
 * after a reconnect. `refetch` should be the same loader the view uses on mount, and should
 * update in place — no loading skeleton — since the provider is looking at the data.
 */
export function useLiveRefresh(filter: LiveFilter, refetch: () => unknown) {
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  });

  const entitiesKey = filter.entities === "any" ? "any" : [...filter.entities].sort().join(",");
  const entityId = filter.entityId ?? null;

  useEffect(() => {
    const active: LiveFilter = {
      entities: entitiesKey === "any" ? "any" : (entitiesKey.split(",") as AccountEventEntity[]),
      entityId,
    };
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void refetchRef.current();
      }, DEBOUNCE_MS);
    };
    const unsubscribe = subscribe({
      onEvent: (event) => {
        if (matchesFilter(event, active)) schedule();
      },
      onResync: schedule,
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [entitiesKey, entityId]);
}

/**
 * A counter that ticks whenever `useLiveRefresh` would refetch. Add it to the dependencies of the
 * effect that already loads the view, so it re-runs its own loader. Only for effects that keep
 * the current data on screen while refetching — one that resets to a skeleton would flash.
 */
export function useLiveVersion(filter: LiveFilter): number {
  const [version, setVersion] = useState(0);
  useLiveRefresh(filter, () => setVersion((v) => v + 1));
  return version;
}
