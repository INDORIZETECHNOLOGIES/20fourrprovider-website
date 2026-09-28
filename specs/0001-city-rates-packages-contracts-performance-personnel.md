# 0001 — City rate cards, packages, capacity, contracts, performance, personnel and live sync

| | |
| --- | --- |
| **Status** | draft |
| **Author** | Santosh Kumar |
| **Created** | 2026-09-28 |
| **Apps touched** | provider website (this repo) |
| **Branch** | |
| **PR** | |
| **Backend contract** | SecureConnect `backend/specs/`: 0011 headcount & capacity, 0012 city-scoped rate cards, 0013 package pricing, 0014 contracts, 0015 composite ranking, 0017 personnel profiles, 0020 real-time account events |
| **Mobile counterpart** | SecureConnect `mobile/specs/0019` |

Each part ships when its backend spec ships. The provider mobile app gets the same features in
`mobile/specs/0019`, and where the two differ the backend response is the tiebreaker. Follow this
repo's `CLAUDE.md`: `AppShell` for every new page, navy/brass tokens, `EmptyState` for empty lists,
and the design skills before building UI.

## Problem

The `/availability` page edits one rate card per category that applies in every city, with daily
and hourly rates only. Providers can't price cities differently, can't offer monthly or yearly
packages, can't see or accept multi-person bookings or long-term contracts, and can't see why
they rank where they do. Agencies can't say which staff go to a booking. Pages here also don't
update live: the only real-time events today are chat.

## Goal

A provider can do everything in backend 0011–0017 on the web as in the app, and open pages
update within seconds when their data changes.

## Non-goals / out of scope

- **Any money arithmetic** beyond rupee ↔ paise at the input and display edges (`lib/format.ts`).
- **Showing the ranking score or weights.** The server never sends them.
- **Per-individual availability.** This repo's `CLAUDE.md` already warns against UI that implies
  it. Capacity (part B) is agencies only, through `/staff-availability`.
- **Personnel logins.**
- **Web push notifications.**
- **The client website.**

## Parts

### A. City rate cards: `/availability` pricing section (0012, 0013)

1. **City dropdown** above the rate chart, from `GET /provider/cities/eligible`, grouped by state
   and marking cities that already have a card ("Priced").
2. The per-category form keeps today's fields (daily rate, hours/day, hourly toggle + rate +
   minimum hours, vehicle add-ons) and adds **Monthly package** and **Yearly package** (₹ per
   person). A warning appears when the server says a package is above the daily equivalent.
3. **Copy from another city** pre-fills the form. Nothing saves until **Save**.
4. Save → `PUT /provider/pricing/cities/:cityKey`. Stop using the wholesale `PUT /provider/pricing`
   and its `carryPricingFields` carry-over for rates. The per-city endpoint replaces only that
   city's rows. **Keep the documented ordering constraint** with `PUT /provider/profile` for
   category changes. Re-check it against the backend when 0012 lands, since `serviceCities` is
   now derived.
5. **Remove city**, with confirmation. `SC_1514` → "You have active bookings in this city."
6. Explainer line: "You only appear to clients in cities where you've saved rates." `SC_1511` →
   link to PSARA coverage (`/profile/licences`).
7. Update `CLAUDE.md` and `PRODUCT.md` "Rate model" once shipped. Both currently describe a
   single rate card.

**As built** (decisions taken while building A, with the whole Availability page redesigned):

- **City tabs with one card**, not a dropdown: one tab per priced city (primary first, then by
  name) showing "priced/offered" counts, plus an **Add city** tab. The add panel picks a state
  (defaulting to the provider's own), then a city from `GET /provider/cities/eligible`, with "My
  city isn't listed…" → `POST /provider/cities`.
- **Vehicle add-ons are per city**, not global.
- **The package check is local.** Each row shows what 30 and 365 days at the daily rate come to,
  and warns when a package is above that. No round trip is needed.
- **Services became immediate-save switches**, separate from rates. Turning a service off keeps its
  rates. The last service can't be turned off. The ordering constraint with `PUT /provider/pricing`
  no longer applies to this page, which never calls the wholesale endpoint.
- **Legacy rows with no city** are shown as a notice and offered as "Your current rates" to start
  a city from.
- Unsaved drafts per city survive switching tabs, carry a dot on their tab, and warn on page
  unload.
- **Site-wide font fix** shipped alongside. The `next/font` variables shared names with the
  `--font-*` tokens, which made a cycle, so every page rendered in the browser default serif.

### B. Capacity: `/staff-availability` (0011), agencies only

- Each date cell shows **booked / declared** per category from `GET /provider/capacity`.
- Copy: "Clients can book more than one person only on dates you've filled in", while the server
  reports `requireStaffAvailabilityForBulk`.

### C. Bookings with headcount + team assignment (0011, 0017)

- `/bookings` list and `/bookings/[bookingId]` show "× N".
- Accept failing with `SC_1503` → message plus a link to `/staff-availability`.
- Agencies: after accepting, an **Assign team** step on the booking page picks exactly N people.
  The booking shows "The client can't pay until you assign your team" until it's done.
  **Replace** a person before duty start and during contract cycles.

### D. Contracts: new `/contracts` (0014)

- `/contracts` list (tabs: Requests / Active / Ended) and `/contracts/[contractId]` detail: term,
  cycles with server amounts, headcount, location, shift, status, cycle payment status.
- **Accept** / **Reject** on requests (`SC_1534` → capacity message).
- **Suspended** banner: "Client payment overdue. Don't deploy from <date>."
- Cycle rows link to `/bookings/[bookingId]`, where the existing provider-invoice upload works per
  cycle. Contract cycles 2..n hide the duty OTP controls (0014 rule 9).
- **Give notice** with the server's effective date.
- Sidebar (`AppSidebar`) gains **Contracts**, only when the server reports contracts enabled.

### E. Performance: `/dashboard` card + `/performance` page (0015)

- A dashboard card "How clients find you" linking to `/performance`. There, each component shows a
  status chip, its importance (High/Medium/Low), the counts behind it ("2 no-shows in the last 90
  days") and the server's tip. Charts, if any, follow the `dataviz` skill. There's no number to
  chart, so this is likely a status list.

**As built:**
- `/performance` is a status list with no chart, since the server sends statuses and never numbers.
  - The Compliance nav gets a "Performance" link above Ratings.
  - The page opens with a one-line headline ("2 of 6 need attention: …").
  - Rows that need attention come first, then by importance.
- Each row shows:
  - a three-bar importance mark, with the word;
  - what the signal measures, in our copy;
  - the server's count line;
  - a status badge;
  - the server's tip, under "What helps", on rows that need attention.
- `newProviderBoost` shows an info banner.
- The dashboard's "How clients find you" row sits after Availability. It links to the page, with
  one mark per signal.
- **Server copy issue:** the count lines use "job(s)" and print "0.0★ from 0 rating(s)". That's a
  small backend follow-up, since the page renders these strings as sent.

### F. Team: new `/team` (0017), agencies only

- List / add / edit personnel: photo, name, phone, category, experience, languages, documents
  with expiry. Two required attestation checkboxes on add.
- "Can't be assigned" state with the reason (missing or expired document).
- Per-person ratings from clients.
- Linked from the Profile hub for agencies only, like `/staff-availability`.

### G. Live sync (0020)

- One socket per session listening for `account_event`. Reuse the existing chat socket
  connection if one exists. Invalidate the page data for the named entity (booking, contract,
  document, payment, rating) and refetch through `lib/api/*`. Never render the payload.
- On reconnect, refetch the current page once.
- The sidebar's unread-notification count (which `AppSidebar` self-fetches) refetches on every
  event.

**As built:**
- There was no chat socket to reuse, because chat polls. G adds one shared connection per tab,
  opened on first use and closed 5 s after the last view unsubscribes.
- Views refetch through `useLiveVersion` / `useLiveRefresh` (`lib/live/accountEvents.ts`):

  | Entities | Views |
  | --- | --- |
  | booking · payment | dashboard, bookings list, earnings, tax documents; booking detail and its payment, invoice and rating sections for that booking only |
  | document · account | documents |
  | account | penalties |
  | rating | ratings |
  | ticket | tickets list, and a ticket's detail for that ticket only |
  | any | notifications list, both unread badges |
  | account · document | sidebar's verified state |

  The dashboard listens to booking, payment, rating and account.
- Verified end to end against the local API. An admin action raised a notification, and the open
  Penalties page picked up a penalty created silently just before it, with no navigation. The
  unread badge also incremented.
- **Backend gap found:** `applyPenalty` only notifies when it suspends. An ordinary penalty raises
  no notification, and so no event.

## Acceptance criteria

1. The city dropdown lists only the server's eligible cities.
2. Saving Nagpur sends only Nagpur rows to `/provider/pricing/cities/mh-nagpur`. Reloading shows
   Mumbai unchanged.
3. ₹36,000 monthly is sent as `monthlyRate: 3600000`.
4. No wholesale `PUT /provider/pricing` call remains in the rate-card code path.
5. A `headcount: 4` booking shows "× 4" on the list and detail pages.
6. Assign team can't be submitted with the wrong count, and server errors are shown in words.
7. Contract cycles 2..n show no duty OTP controls.
8. `/performance` never renders a numeric score or weights.
9. With `/bookings/[id]` open, a client paying in another session updates the page status within
   5 s, without a reload.
10. `npm run lint` and `npm test` pass. Vitest covers the city rate-card form's paise conversion
    and the account-event → refetch mapping.
