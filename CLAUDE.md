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

The project was scaffolded with `create-next-app` (Next.js App Router, TypeScript, ESLint).

**Built**: auth, provider profile setup, KYC document upload, availability, bookings (list, detail
view, accept/reject, mark-complete), duty (OTP + gate-guard start/end), earnings/settlements,
per-booking chat, support tickets, notifications, account/DPDP (data export, consent withdrawal,
erasure request), duty safety (SOS + live check-in), incident reporting, absence-alert, ratings
(submit + own-ratings view), payout bank details (submit + one-tap confirm), payment status, tax
profile (PAN + GST tier + turnover declaration), PSARA state coverage, tax documents (list +
detail + PDF download), forgot/reset password, email verification, profile photo.

**Not built yet** — a previous status note here claimed the provider surface was fully complete;
it wasn't, and a full pass against the reference doc turned up real gaps, roughly in order of how
much they matter for a working provider app:
- Gallery (`/provider/gallery*`), firm staff-availability (`/provider/staff-availability*`),
  replacement requests, penalties/appeals, premium analytics, wallet (v1 legacy), referral
  program, MFA — lower priority, none built.
- Within ratings: no detailed sub-ratings (professionalism/punctuality/etc.), no photo
  attachments, no report-a-rating flow. `submitRating` only sends `rating`, `review`, `tags`.
- Within PSARA coverage: no way to attach a specific uploaded document to a state licence
  (`licences[].documentId` in the request body) — there's no endpoint that lists a provider's own
  uploaded documents by `_id` for a picker to select from (see the existing documents divergence
  note below). `updatePsaraCoverage` never sends `documentId`.

Before claiming a feature area is "complete" in this file, verify against the actual route list in
the reference doc's table of contents (or grep the backend's route files) rather than trusting
this file's own prior summary — check the current section above for what's since been added.

### Design direction established by the auth feature

Deep navy (`--color-navy`) + muted brass (`--color-brass`) against a cool paper surface, laid out as
a split panel (brand on one side, form on the other) — a credential/verification register, not a
generic SaaS look. Wordmark and headings use the slab-serif display font (`--font-display`, Roboto
Slab); body copy and form UI use the civic sans (`--font-body`, Public Sans). See
`src/components/auth/AuthShell.tsx` for the pattern. Keep new UI consistent with this direction
rather than introducing a second visual language — extend the token set in `globals.css` if a new
need comes up, don't hardcode one-off colors.

### The authenticated app shell: `AppShell`/`AppSidebar`, not `AppTopBar`

Every signed-in page wraps its content in `<AppShell title="...">` (`src/components/layout/
AppShell.tsx`), not `<AppTopBar />`. `AppShell` renders a fixed 240px desktop sidebar (`AppSidebar`
— nav, verification-status badge, user row, sign-out), a bottom tab bar on mobile (< 1024px), and a
thin wordmark bar on mobile only. There is deliberately no desktop top bar: the sidebar carries the
brand and each page's own `<h1>` carries the title — an earlier version repeated the page name in a
sticky desktop header directly above an identical `<h1>`. `title` only sets the browser tab (a
`<title>` element, which React 19 hoists into `<head>`). If you add a new top-level page, wrap it in
`AppShell` from the start (`AppTopBar` survives only for `profile/setup` — see below).
`AppSidebar` self-fetches `isVerified`/unread-notification-count on mount; it takes no props, so
don't re-plumb those through a page just to satisfy it.

**`AppShell` owns the page's single `<main>` landmark and all page padding.** Panels render a plain
`<div className={styles.page}>` — they used to render their own `<main>`, which nested inside
`AppShell`'s and was invalid HTML (and confusing to screen readers). Content is left-aligned to the
sidebar edge, not centred in the viewport; each page sets only its measure through its `.column`
max-width: ~560–640px for forms, 800px for lists, 1000px for the dashboard. Don't reintroduce
`justify-content: center` or padding in a panel's `.page` rule.

**Empty lists use `src/components/ui/EmptyState.tsx`**, not a bare "No X here yet." line: an icon, a
title, a sentence saying what fills the list, and — only when there's a real next step — an action
link. With a filter active, the copy just says nothing matches. The dashboard's version is
context-aware (unverified → check documents; paused → turn availability back on). Short inline
notes inside a section ("No days off blocked.") stay as plain text.

**The dashboard leads with one thing, and it is never a grid of links to other pages.** It used to
end in a "Quick actions" grid of eight cards that duplicated the sidebar nav item for item — that's
gone; the sidebar is the navigation. The lead slot holds either the next shift (the booking the
provider is on, else the soonest `payment_done` one that hasn't ended — a navy panel, the only
raised element on the page) or, while setup is incomplete, a checklist of what's actually blocking
bookings (documents uploaded vs. required per `PROVIDER_DOCUMENT_CATALOG`, bank account added/
verified/confirmed, verification). Both come from data the page already fetches: the checklist adds
no request, and the shift is picked out of the same `payment_done`/`duty_started` calls that feed
the counters (`pagination.total` remains the source of the counts — the fetched page is only used
to choose the shift). The checklist disappears once every item is done rather than sitting there as
a row of ticks. The counters below it are one bordered strip divided by hairlines, not three
separately-shadowed cards each with a gradient accent bar — that was the page's main slop tell.

**Four shared primitives carry every signed-in page — use them instead of re-declaring the same
CSS per module.** `PageHeader` (`src/components/ui/`) is the page's title block: title, optional
intro, optional single page-level action (Support's "New ticket", Notifications' "Mark all read").
Ten modules had their own identical `.heading`/`.subtext` rules before it existed. `RowList` is the
list container — one border, one background, hairline dividers supplied by the container
(`.list > * + *`), so a row component carries no border, radius, shadow or bottom margin of its own;
every list (bookings, settlements, ratings, tickets, notifications, tax documents, documents,
days off) renders through it. `LoadMore` is the paginated "Load more" button that five lists had
five copies of. `Stars` draws the rating stars as SVG with the same geometry as `Icon`'s star —
ratings used to concatenate "★"/"☆" text characters, which take the body font's metrics and can't
be sized or half-filled. Rows follow one shape: identity and timing on the left, the number (amount,
net payout) right-aligned in the display face, then a `Badge` for status — and per-row actions sit
below a hairline inside the row, only on the statuses that can act.

**Link to a booking with `booking._id`, never `booking.bookingId`.** The detail route and
`GET /bookings/:bookingId` take the Mongo id; `bookingId` is the human-readable reference. The first
dashboard design linked recent bookings by the reference, so every one of those links 404'd.
`/bookings?status=<status>` preselects the list filter (the dashboard's stat cards use it) —
`BookingsPanel` reads it with `useSearchParams`, which is why `bookings/page.tsx` wraps the panel in
`<Suspense>`: a static route needs that boundary or the build fails.

**`profile/setup` is the one page that intentionally still uses `AppTopBar`.** It's only reachable
before the provider profile is complete (every other page redirects here until it is), so a sidebar
full of links to Bookings/Earnings/Ratings/etc. would be premature — those features assume a
complete profile. Don't "fix" this by migrating it to `AppShell`.

**Emoji are not icons — use `src/components/ui/Icon.tsx`.** An earlier pass at this design used raw
emoji (📋 🗓 📄 🔔 💬 ⚙, plus 🛡️ ⚡ 🎪 🔫 🕵️ on the landing page) for every nav item, quick-action
card, and feature/category card. Emoji render full-color regardless of the surrounding text color,
which reads as an obvious templated/AI-slop tell against this app's disciplined navy/brass palette
— it was the single biggest thing wrong with the design pass this file used to point to. `Icon` is
a small hand-drawn monoline SVG set (stroke `currentColor`, so it inherits the surrounding text
color and tints correctly on hover/active states) — add new glyphs there rather than reaching for
an emoji or pulling in an icon package. The four security-category icons on the landing page
(guard/bouncer/gunman/PSO) are deliberately all variations on a shield/protection motif rather than
literal objects (a circus tent for "Bouncer" was one of the emoji it replaced) — keep that
consistency if you add a fifth category.

Two other slop patterns fixed in the same pass, worth not reintroducing: a single word recolored
inside an otherwise plain-colored headline (`Get booked. **Work.** Get paid.` — the accent span is
gone, the whole headline is one color now), and a `→` appended to CTA button text as the default
affordance for every call-to-action (now used at most once per page, as an actual `Icon
name="arrow-right"`, not the `→` character).

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

**`validateDayOffDate` (`src/lib/validation/availability.ts`) has a UTC-vs-local day bug, and its
own test is time-of-day-flaky as a result.** It parses the input date string with `new Date(date)`
(interprets a bare `YYYY-MM-DD` as UTC midnight) but computes "today" with a local
`new Date(); .setHours(0,0,0,0)`. In a timezone ahead of UTC (IST, `+05:30`), between local midnight
and ~5:30am the UTC calendar day is still "yesterday" — so the test's `new Date().toISOString()
.slice(0,10)` (a UTC-dated string) reads as being in the past compared to local "today", and
`validateDayOffDate` wrongly rejects it. Confirmed live at 01:47 IST. Not fixed here — it's a
pre-existing logic bug unrelated to whatever you're working on if you hit this test failing; don't
assume your own change caused it before checking the wall-clock time.

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
- **`POST /bookings/:id/absence-alert` also really does what it says, and is just as destructive**:
  confirmed live that it sets `user.isSuspended = true` on the *provider* and `booking.absence.
  penaltyApplied = true` **regardless of which party (client or provider) calls it** — a provider
  filing an absence alert against a no-show client still gets their own account suspended. See
  `AbsenceAlertControl.tsx`'s two-step confirm and warning copy; the API function
  (`raiseAbsenceAlert` in `src/lib/api/bookings.ts`) also carries this warning in a comment. Never
  call this against an account you want to keep using — test with a disposable one, same as
  erasure-request.
- **`POST /protection/:bookingId/location` 404s with "Duty session not found" unless a
  `DutySession` document exists for the booking** — a booking whose `status` is `duty_started` but
  was seeded/created without going through the real duty-start OTP flow (so no `DutySession` row
  exists) will fail check-in even though the UI gates on booking status alone, matching the
  reference doc. Not a frontend bug: in the real flow duty-start always creates the session first.
  Only matters when seeding test data directly in Mongo.
- **`POST /protection/:bookingId/incidents`'s response doesn't populate `reporter`** — it returns
  the raw created document, where `reporter` is a bare ObjectId, while `GET
  /protection/:bookingId/incidents` (`listIncidents`) populates it to `{name, role}`. Using the
  create response directly to update UI state renders a blank reporter name until the next reload.
  `IncidentsSection.tsx` works around this by refetching the full list via `listIncidents` after a
  successful `createIncident` rather than trusting the create response's shape.
- **`PUT /provider/profile`'s response never includes `bankDetails.accountNumber`** — the schema
  field is `select: false` (so it's excluded from every query by default), and unlike `getMyProfile`
  (which does `.select('+bankDetails.accountNumber')` then masks it before responding),
  `updateProfile`'s `findOneAndUpdate` never re-selects it. Confirmed live: a successful bank-details
  save returns `bankDetails` with `ifscCode`/`accountName` present but `accountNumber` silently
  missing, even though the write itself succeeded (a follow-up `GET /provider/profile` shows the
  masked value correctly). `BankDetailsSection.tsx` works around this by calling
  `getProviderProfile()` again after a successful `updateBankDetails()` rather than trusting the PUT
  response for display — do this for any other bank-details-writing UI too.
- **`GET /ratings/my-status`'s documented `page`/`limit` query params are validated but never
  applied** — same shape of bug as the tickets/notifications filters above: the handler fetches
  *all* of the caller's completed bookings and filters client-side, unpaginated. Not an issue at
  today's data volumes, but don't build "load more" UI around this endpoint expecting it to
  actually page.
- **`POST /ratings/:ratingId/report`'s validator and the `Rating` model's `reportReason` enum
  disagree** — the validator (matching the reference doc) accepts `'inappropriate'|'spam'|'fake'|
  'offensive'|'other'`, but the schema enum is `'abusive'|'spam'|'inappropriate'|'false'|'other'`.
  `'fake'`/`'offensive'` aren't in the schema enum, yet the controller writes them anyway via
  `findByIdAndUpdate` without `runValidators`, so they save without error despite falling outside
  the declared enum. Not built in this frontend yet (see "Not built yet" above); if it is, use the
  validator's list, not the model's.
- **`POST /auth/send-email-verification` fails the whole request on an email-delivery failure**,
  even though the OTP and rate-limit cooldown are already durably persisted before the send is
  attempted — unlike `forgotPassword`, which wraps its `sendEmailViaMsg91` call in try/catch and
  never lets delivery failure surface as a request failure. Confirmed live: with this environment's
  configured `MSG91_AUTH_KEY` invalid (`sendEmail: MSG91 request failed ... 401 Unauthorized` in
  the backend logs on every attempt), every "Send verification code" click 500s with `SC_502`
  ("OTP service is temporarily unavailable"), yet the cooldown is still set — so a retry within 60s
  correctly reports the cooldown instead, and the user is stuck until it expires with a code they
  were never actually sent. `POST /auth/verify-email` itself works correctly once a valid OTP
  exists (confirmed by seeding `CoordinationKey` directly and calling it) — the bug is specifically
  in the unguarded send path. Local dev testing of this flow therefore requires seeding
  `CoordinationKey` (`_id: "email-otp:<userId>"`, `value: sha256(otp)`, a future `expiresAt`) rather
  than actually receiving a code — see git history around this note for the exact seed script shape
  if you need to redo it. **Not something to work around in the frontend** — the fix belongs in
  `authService.sendEmailVerification` (wrap the send in try/catch, matching `forgotPassword`), which
  wasn't done here per the "only fix backend bugs with explicit go-ahead" rule.
- **OTP/reset-token/rate-limit state for `/auth/*` lives in MongoDB (`CoordinationKey` collection,
  `src/config/coordination.ts`'s `setValue`/`getValue`/`claimOnce`/`incrementCounter`), not Redis**
  — despite `config/redis.ts`'s own docstring describing Redis as the home for "rate-limit counters,
  caches." Don't go looking in Redis for an email OTP hash, a password-reset token, or an OTP-resend
  cooldown while debugging locally; query `CoordinationKey` by `_id` instead (the key names match
  what the service code uses, e.g. `email-otp:<userId>`, `password-reset:<token>`).

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
- **Per-booking action controls are shared between the bookings list and the booking detail page**
  (`src/app/bookings/[bookingId]`) — `PendingBookingActions` (accept/decline), `DutyControls`
  (start/end), and `CompleteBookingControl` (`duty_ended → completed`, `PUT
  /provider/bookings/:id/complete`) each take a booking id/object + `accessToken` + `onUpdated` and
  render identically in both places. Add a new per-booking action the same way rather than
  duplicating the state/handler logic inline in both call sites.
- **Duty safety, incidents, and absence-alert live only on the booking detail page**
  (`src/components/bookings/SosControl.tsx`, `IncidentsSection.tsx`, `AbsenceAlertControl.tsx`,
  wired into `BookingDetail.tsx`), gated on `booking.status`: SOS/check-in only `duty_started`
  (matches the backend's own gate); incidents `duty_started`/`duty_ended`/`completed`; absence-alert
  `payment_done`/`duty_started`. All three share `SafetyControls.module.css`. Absence-alert is the
  one genuinely destructive control here — see the divergence note above before touching it.
- **Rate-the-client (`RateBookingControl.tsx`) also lives on the booking detail page**, gated on
  `booking.status === "completed"`. There's no per-booking "have I rated this" endpoint — it checks
  membership in `GET /ratings/my-status`'s `pendingRatings` array (all of the caller's completed
  bookings not yet rated, unpaginated — see the divergence note above) on mount, and fails closed
  (treats an error as "already rated") rather than risk showing a form that 400s with `SC_1002` on
  submit. `toUserId` for the rating is `booking.clientId._id` — `BookingClient` was extended with
  `_id` for this (Mongoose `.populate(field, 'name email phone')` includes `_id` by default, so this
  was always present on the wire, just not modeled).
- **Payment status (`PaymentStatusSection.tsx`) is a small addition inside the existing "Payment"
  card**, not a separate section — it shows the live Razorpay-side `status` (Created/Authorized/
  Paid/Failed/Refunded) next to the amounts breakdown that's computed from the `Booking` doc itself.
  Gated on `CHAT_ALLOWED_STATUSES` (payment must exist by then); renders nothing if the fetch fails
  (e.g. `SC_501` no Payment doc), so a booking pre-payment just shows the existing breakdown as
  before.
- **Payout bank details (`src/components/earnings/BankDetailsSection.tsx`) live on the Earnings
  page**, above the settlements list — it's payout configuration, not account/DPDP settings, so it
  sits with the money surface rather than on `/account`. Submitting any field resets
  `bankDetails.verified` server-side (see the existing profile divergence note above); the "Confirm
  this is my account" button only appears once `verified && !confirmedByProvider`.
- **"Your ratings" is a new page** (`/ratings`, `RatingsPanel.tsx`) showing the provider's own
  average/count (`ProviderProfile.rating`, added to the `ProviderProfile` type along with the
  populated `userId` object) and their full received-ratings list via `GET /ratings/user/:userId`
  using their own id — there's no "ratings about me" shortcut endpoint, so this calls
  `getProviderProfile()` first purely to read `profile.userId._id`.
- **Two flex-layout components inline-block elements with no gap between them** was a real bug
  (`BookingRow`'s "View details"/"Chat with…" links rendered flush against each other with zero
  spacing, since adjacent `display: inline-block` elements in JSX have no whitespace node between
  them unless the layout itself provides a gap). Fixed by wrapping multi-link/multi-button rows in
  a flex container with `gap` rather than relying on individual element margins — do this for any
  new row of adjacent inline links/buttons instead of an `inline-block` + `margin` pattern.
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
- **Tax profile, PSARA coverage, and tax documents are three separate pages** (`/tax-profile`,
  `/tax-documents`), not folded into `/documents` (which is KYC document *uploads* — a different
  concept from tax profile data entry or reading auto-generated invoices). `TaxProfilePanel.tsx`
  fetches `GET /provider/tax-profile` once and passes it down to `TaxProfileForm.tsx` (PAN/tier/
  GSTIN/turnover) and `PsaraCoverageSection.tsx` (state licences, full-array replace on every
  save), both of which call back up with the response's updated tax profile rather than each
  re-fetching. GSTIN comes back **unmasked** in the tax-profile response (unlike PAN, which is
  always masked) — safe to prefill the GSTIN field, never the PAN field. `src/lib/constants/
  indianStates.ts` now carries two lists: `INDIAN_STATES` (free-text names, pre-existing, used by
  profile setup) and `GST_STATES` (name+two-digit-code pairs, mirroring the backend's
  `GST_STATE_CODES` table) — PSARA coverage and anything else keyed on a GST state code needs the
  latter, not the former.
- **Tax documents are read-only and PDF downloads need a raw-binary fetch**, not the JSON
  `{success,data}` envelope every other endpoint uses. `apiDownload()` (`src/lib/api/client.ts`)
  is a third fetch wrapper alongside `apiRequest`/`apiUpload` for this — returns a `Blob`, then
  `TaxDocumentRow.tsx` triggers the save via the same `URL.createObjectURL` + `<a download>`
  pattern `AccountPanel.tsx`'s data export already uses. `TaxDocumentRow` also lazy-fetches
  `GET /documents/:id` (full line items/tax lines) only when a row is expanded, rather than
  fetching every document's detail up front. Credit notes aren't nested under the document they
  reverse (`reversesDocumentId`) — the list renders flat, sorted by `issuedAt desc` same as the
  backend's default.
- **Forgot/reset password are unauthenticated pages** (`/forgot-password`, `/reset-password/
  [token]`) using `AuthShell` like login/register. The reset link the backend emails is path-based
  (`${APP_URL}/reset-password/:token}`, from `auth.service.ts`'s `forgotPassword`) — the dynamic
  route here mirrors that shape exactly (`ResetPasswordRoute` awaits `props.params` server-side,
  same split pattern as the chat/ticket detail pages, then passes `token` to a client
  `ResetPasswordForm`). Both `forgotPassword`/`resetPassword`/`sendEmailVerification`/`verifyEmail`
  are message-only responses (no `data` key at all — see `apiRequest`'s envelope) — these API
  functions return `Promise<void>`, and the UI shows its own static copy rather than parsing a
  backend message string. `ForgotPasswordForm` deliberately shows the same "check your email"
  screen on any successful call regardless of whether the address exists (matching the backend's
  own enumeration-safety), but does surface a thrown error (rate limit, network) since those aren't
  an enumeration leak.
- **Email verification and profile photo live on the Account page** (`EmailVerificationSection.tsx`,
  `ProfilePhotoSection.tsx`), above the DPDP sections — `AccountPanel.tsx` fetches `GET /auth/me`
  once (not carried in the localStorage session, which only has tokens + name) and passes the
  result down; both children call back up to patch that local state rather than re-fetching.
  `PATCH /auth/profile-photo` needed `apiUpload()` extended with an optional `method` param (it was
  hardcoded to `POST`; every other existing upload endpoint happens to be `POST`, this one isn't).
  Both `GET /auth/me` and the photo-upload response return `profilePhoto` **already presigned** —
  render it directly as an `<img src>`, no separate presign step needed (unlike provider documents).
