# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The provider-facing frontend for the platform documented in `apis-docs/PROVIDER_API_REFERENCE.md`
— the web app that guards/bouncers/gunmen/PSOs (individual or firm) use to manage their profile,
documents, pricing, availability, bookings, duty lifecycle, earnings/settlements, and support.
There is a separate client-facing app and a separate backend repo (`master` branch referenced
throughout the API doc); this repo is frontend-only and talks to that backend over HTTP.

This is a funded startup product, not a prototype — the UI/UX bar is production-grade. Before
building or reviewing any UI, use the design skills available in this environment
(`frontend-design`, `ui-ux-pro-max`, `design-consultation`, `design-review`, `dataviz` for any
charts/analytics views) rather than defaulting to generic component-library output. Avoid
templated "AI slop" layouts — get a deliberate aesthetic direction, then execute it consistently.

The project was scaffolded with `create-next-app` (Next.js App Router, TypeScript, ESLint). Every
provider-facing surface in the reference doc is now built: auth, profile setup, KYC documents,
availability, bookings (accept/reject), duty (OTP + gate-guard start/end), earnings/settlements,
per-booking chat, support tickets, notifications, and account/DPDP (data export, consent
withdrawal, erasure request). Nothing here has a payments/checkout flow, admin surfaces, or a
client-facing app — those are explicitly out of scope (see the API reference doc's own framing).

### Design direction established by the auth feature

Deep navy (`--color-navy`) + muted brass (`--color-brass`) against a cool paper surface, laid out as
a split panel (brand on one side, form on the other) — a credential/verification register, not a
generic SaaS look. Wordmark and headings use the slab-serif display font (`--font-display`, Roboto
Slab); body copy and form UI use the civic sans (`--font-body`, Public Sans). See
`src/components/auth/AuthShell.tsx` for the pattern. Keep new UI consistent with this direction
rather than introducing a second visual language — extend the token set in `globals.css` if a new
need comes up, don't hardcode one-off colors.

### Styling: raw CSS, not Tailwind

Tailwind was removed from the scaffold. Style with plain CSS: a `*.module.css` file colocated next
to each component/page (e.g. `page.tsx` + `page.module.css`), imported as `styles` and applied via
`className={styles.foo}`. Shared design tokens (color, spacing, radii, font stacks, light/dark via
`prefers-color-scheme`) live as CSS custom properties in `src/app/globals.css` — reuse those tokens
(`var(--space-4)`, `var(--color-fg-muted)`, etc.) rather than hardcoding values, and extend that
token set as new needs come up instead of introducing a second styling system.

**Before using a `--space-N` (or any) token that looks like it should exist, check it's actually
defined in `globals.css`.** `--space-5` was used across four component files (bookings,
availability) before anyone noticed it was never defined — a `padding`/`gap` shorthand referencing
an undefined custom property with no fallback computes to nothing, so every affected element
silently rendered with zero padding/gap. It looked fine at a glance (borders + line-height fake the
impression of spacing) and only showed up on close inspection. Verify visually, not just by
reading the JSX.

## Commands

- `npm run dev` — start the dev server (Turbopack). The backend runs locally on `:3000`, so the
  frontend dev server should run on a different port, e.g. `npm run dev -- -p 3001`.
- `npm run build` — production build
- `npm start` — run a production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npm test` — Vitest (jsdom environment, config in `vitest.config.mts`). Tests live next to the
  code as `*.test.ts(x)`. Run a single file with `npx vitest run path/to/file.test.ts`.

`NEXT_PUBLIC_API_BASE_URL` (see `.env.example`) points the API client at the backend; defaults to
`http://localhost:3000/api/v1` for local dev.

`AGENTS.md` at the repo root is auto-generated/rewritten by `next dev` itself (see the comment
inside it) — don't hand-edit it expecting the change to stick, and expect it to show as modified
after running the dev server.

## Architecture

### Talking to the backend

`apis-docs/PROVIDER_API_REFERENCE.md` is the authoritative reference for every endpoint this
frontend will call — read it before building any feature that touches the network. It's a snapshot
generated from the backend's source, not a live schema, so re-check the backend source it cites if
a field name matters in production. Conventions that should shape a shared API client, once one
exists:

- Base URL `/api/v1`; Bearer JWT auth (`Authorization: Bearer <accessToken>`), obtained from
  `/auth/login` or `/auth/verify-otp`. Provider routes require the account's `role === 'provider'`.
- Uniform envelope: `{ success, data, requestId }` or `{ success: false, error: { code: "SC_xxx", message } }`.
  Every `SC_xxx` code is catalogued in Appendix A of the reference doc.
- **Money is integer paise everywhere**, with two exceptions: the Wallet surface and the four
  `/provider/analytics/*` premium endpoints, both of which are whole rupees. Get this wrong and
  amounts are off by 100x.
- **Two billing engines**: `Booking.billingEngine` is `'v1'` (legacy) or `'v6'`. This project's
  direction is v6-only — build new UI against `/provider/tax-profile`, `/provider/psara-coverage`,
  `/provider/settlements`, `/documents/*`, not the v1-only `/invoices/*`, `/provider/earnings`, or
  `/provider/earnings/payout-history`, which exist only to serve historical bookings. The Earnings
  page (`src/app/earnings`) is a `/provider/settlements` ledger by deliberate choice — no aggregate
  "total earnings" figure, since that would require the v1-only `/provider/earnings` endpoint (or
  summing an unbounded, paginated v6 list client-side, which would be wrong/misleading unless every
  page were loaded). Until `PlatformSettings.billingV6.enabled` is flipped, expect this list to be
  empty for real accounts — that's correct, not a bug.
- `requireProviderVerified` gates the actions that commit a provider to work (accepting a booking,
  toggling availability, days-off/staff-availability) but deliberately not profile/documents/
  pricing/bank-details, since those are the path *to* verification.
- The booking lifecycle (`pending → provider_accepted → payment_pending → payment_done →
  duty_started → duty_ended → completed`, plus `provider_rejected`/`cancelled`/`disputed`) and the
  OTP-based duty-start/duty-end flow are the backbone of most provider screens — see Appendix C and
  the Duty section of the reference doc before building booking or duty UI.

### Where the running backend diverges from the reference doc

Verified directly against the backend source (a sibling repo on this machine,
`~/freelance-project/SecureConnect/backend`) while building profile setup — the reference doc does
not (yet) reflect this:

- **Registration auto-creates a blank `ProviderProfile`** for every provider account
  (`auth.service.ts`), so a profile always exists from the moment of registration.
- **`POST /provider/profile` therefore always 409s with `SC_1307`** ("already exists") for a real
  account — it's unreachable in practice. **Use `PUT /provider/profile` to fill in profile fields
  instead** (`src/lib/api/provider.ts`'s `updateProviderProfile`), even for a "brand new" provider.
- `updateProfile`'s controller was silently dropping `serviceCategories` even though its own
  validator accepted it — fixed backend-side (branch
  `fix/provider-profile-update-service-categories`, PR pending). If that fix isn't merged yet,
  `serviceCategories` won't save via PUT either.
- Since profile existence is no longer a useful signal, **treat a profile as "not set up yet" by
  content, not existence**: `isProfileComplete()` in `provider.ts` checks
  `serviceCategories.length > 0`. `pricing` still goes through the separate `PUT /provider/pricing`
  endpoint, exactly as documented.
- There is no list endpoint for a provider's own uploaded documents — `GET /provider/profile`'s
  `documents` object (keyed `${documentType}Url`, presigned) is the only way to know what's already
  uploaded. It only tells you presence, not per-document `verificationStatus` (that detail lives in
  the `Document` collection, which providers can't list); don't build UI that assumes richer
  per-document status is available without adding a backend endpoint for it first.
- **`GET /tickets` only filters by `status`** — its validator (`getMyTicketsValidator`) accepts
  `type`, `priority`, and `sortBy` too, and the reference doc documents all four, but
  `getMyTickets`'s handler never reads them off `req.query` beyond `status`. Not fixed backend-side
  (unlike the profile bug, nothing is blocked — it's a missing filter, not a broken flow), so
  `TicketsPanel` only exposes a status filter; don't add type/priority/sort controls that would
  silently do nothing.
- **A ticket's initial message can't carry an attachment** — `createTicket`'s validator accepts an
  `attachments` field, but the controller seeds `messages[0]` from `description` only and never
  reads `req.body.attachments`. Attachments only work on a *reply* (`addMessage` does apply them).
  `NewTicketForm` has no attachment field for this reason; `TicketDetail`'s composer does.
- **`GET /notifications` only filters by `isRead`** — same shape of bug as tickets: the reference
  doc documents a `type` query param, but `getMyNotifications` never reads it.
  `PUT /notifications/read-all` has the same gap for its documented `notificationType` body field —
  it always marks every unread notification read, there is no way to scope it. Neither is built as
  a control in `NotificationsPanel`.
- **The `Notification.type` enum doesn't match the reference doc at all** — the doc lists
  `payout_released`, `duty_started`, `otp_generated`, `ticket_update`, `admin_message`, etc.; the
  real schema enum (`src/models/Notification.ts`) has none of those — it's `payment_success`,
  `booking_completed`, `support_ticket`, `psara_expiry_warning`, and others instead (confirmed by
  hitting a Mongoose validation error while seeding test data with a documented-but-nonexistent
  type). Consequently `NotificationRow` never tries to map `type` to a label or icon — it just
  renders the backend's own `title`/`body` text, which sidesteps the mismatch entirely. Don't
  introduce a `type` → label lookup without re-deriving the real enum from the model first.
- **`GET /provider/account/data-export`'s "one export per 24 hours" claim is only a code comment**
  — there's no rate-limiting middleware on the route and no check inside the handler; confirmed by
  calling it twice in a row live and getting 200 both times. Don't build UI (a cooldown timer, a
  disabled-until state) around a limit that isn't actually enforced.
- **`POST /provider/account/erasure-request` really does what it says** — no divergence here, but
  worth flagging: it sets `user.isSuspended = true` synchronously, in the same request, before the
  30-day deletion window even starts (confirmed live: the test account couldn't log in immediately
  after). Never call it against an account you want to keep using — test with a disposable one.

### Frontend structure

App Router under `src/app/`, path alias `@/*` → `src/*`. The auth feature set the convention other
features should follow:

- `src/lib/api/client.ts` — shared `apiRequest` (JSON) and `apiUpload` (multipart `FormData`, for
  file uploads) fetch wrappers, both parsing the same `{success, data}` / `{success, error}`
  envelope and throwing `ApiError` (with `.status` and `.code`) on failure. Add new endpoint calls
  as functions in `src/lib/api/<domain>.ts` (see `auth.ts`, `documents.ts`) that call one of these,
  not raw `fetch`.
- `src/lib/validation/<domain>.ts` — plain functions returning `string | null` (an error message or
  no error), used for client-side field validation before hitting the API.
- `src/lib/auth/session.ts` — interim client-side session storage (tokens + user name in
  `localStorage`), read via the `useSession()` hook (`useSyncExternalStore`-based, so it's
  SSR/hydration-safe). This is a placeholder until the app has a real session strategy — likely
  httpOnly cookies via a backend-for-frontend — don't build further on `localStorage` tokens without
  revisiting this.
  - **Never gate a redirect-to-`/login` decision on `useSession()`'s value.** On a hard page load,
    that value is transiently `null` while `useSyncExternalStore` resyncs from the (always-null)
    server snapshot to the real localStorage value — an effect that redirects on that transient
    null will occasionally bounce a genuinely logged-in provider back to `/login` (this was a real,
    intermittent bug, found while testing the bookings feature). Use `useRedirectIfLoggedOut()`
    instead, which reads `readSession()` directly inside the effect — that read always reflects the
    true value, since effects only run after hydration completes. Keep `useSession()` for values
    used in rendering (name, tokens for a fetch), and gate data-fetching effects on `if (!session)
    return;` (wait for it to resolve) rather than redirecting from that effect.
- `src/components/ui/` — generic form primitives (`Field`, `Select`, `Textarea`, `Button`, `Banner`,
  `Switch`) shared across features.
- **`requireProviderVerified`-gated actions** (availability, days-off, accepting bookings, ...):
  check `profile.isVerified` up front and show the exact backend message
  ("Your account is pending verification…") proactively via `Banner`, rather than only reacting
  to an `SC_602` after a failed request — see `AvailabilityPanel`. For optimistic UI (e.g. a
  toggle), update state immediately on interaction, then roll it back if the request fails.
- `src/components/layout/AppTopBar` — the shell for authenticated pages (wordmark + sign out).
  `AuthShell` (split panel) is auth-only; authenticated feature pages use `AppTopBar` instead.
- **Duty (`/duty/:bookingId/*`) is not gated by `requireProviderVerified`** — by the time a booking
  reaches `payment_done`, accepting it already required verification, so duty start/end don't
  re-gate. `DutyControls` (rendered inline in `BookingRow` for `payment_done`/`duty_started`
  bookings) branches on `serviceCategory === 'guard'`: guard bookings use the no-OTP
  `confirm-guard-start/end` endpoints, every other category requires the 6-digit OTP the *client*
  generates and shares in person (`verify-start-otp`/`verify-end-otp`) — there is no
  provider-facing way to see that OTP, it must come from the client. Errors from these endpoints
  are plain `AppError`s with no `SC_` code (per Appendix A) — just show `error.message` as-is.
- `src/components/<feature>/` — feature-specific components (e.g. `auth/AuthShell`, `LoginForm`,
  `RegisterForm`, `profile/ProfileSetupForm`), each with a colocated `*.module.css`.
- Pages that require a session (`dashboard`, `profile/setup`, `documents`, `availability`,
  `bookings`) follow the same gate: `useSession()` for the value, `useRedirectIfLoggedOut()` for
  the redirect, and return `null` while an async check (session or profile-completeness) is in
  flight — see `src/app/dashboard/page.tsx`.
- **Chat (`/chat/:bookingId`)** is polling-based (5s interval, `ChatPanel`), not wired to the
  backend's Socket.IO events — the reference doc calls those emits "best-effort," so HTTP is the
  reliable source of truth and polling is the correct baseline; a socket connection would only be
  worth adding later as a latency optimization on top of it, not a replacement. There are two chat
  route surfaces on the backend (see the reference doc's Chat section) — this frontend only uses
  `/chat/:bookingId` (the fuller-featured one), never the nested `/bookings/:bookingId/chat/*`
  polling variant. `CHAT_ALLOWED_STATUSES` in `bookingStatus.ts` mirrors the backend's own gate
  (`payment_done`/`duty_started`/`duty_ended`/`completed`) and controls when `BookingRow` shows the
  "Chat" link — a booking outside those statuses has no chat UI entry point in this app.
- **Dynamic route params are a `Promise` in this Next version** (App Router, typed `PageProps<'/...'>`
  helper). A page needing client-side interactivity (hooks, state) can't `await` params itself
  since client components can't be async — split it: an `async` server-component `page.tsx` that
  awaits `props.params` and passes the resolved value as a prop to a `"use client"` child (see
  `src/app/bookings/[bookingId]/chat/page.tsx` + `ChatPage`, or `tickets/[ticketId]` + `TicketDetailPage`).
- **Ticket attachments are a two-step upload**: `POST /tickets/:id/upload` returns a raw (not
  presigned) S3 key — `TicketDetail` holds it as `pendingAttachment` until the provider sends a
  message, then includes it in that `POST /tickets/:id/message` call. `getTicket` presigns
  attachment keys on read. This mirrors the chat attachment flow but is two separate requests
  instead of one, because unlike chat, a ticket message's attachments are a field on the message
  body, not a dedicated "send with attachment" endpoint.
