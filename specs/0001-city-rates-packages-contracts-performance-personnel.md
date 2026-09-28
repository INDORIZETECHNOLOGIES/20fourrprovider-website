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

**As built (B + C headcount):**
- **Calendar cells:** each cell shows booked / declared with a hairline meter, and a segmented
  filter shows All or one offered category.
  - "All" sums every category, one capacity call per category.
  - A day marked off that still has bookings says so in red.
  - A date outside the calendar that has bookings shows "N booked".
- **Day editor:** shows "N already booked" under each count and warns when a count drops below it.
- **Bulk rule copy:** follows `requireStaffAvailabilityForBulk` both ways.
- **Headcount display:** rows and the detail heading read "6 × Bouncer", and the detail page adds a
  People row.
- **Staffing preview:** a pending request for more than one person shows a Staffing section that
  previews the accept check (short, off and unset days). `SC_1503` on Accept links to the staff
  calendar.
- **Assign team moves to part F.** It picks from the personnel roster that F builds, so it ships
  with F.

### D. Contracts: new `/contracts` (0014)

- `/contracts` list (tabs: Requests / Active / Ended) and `/contracts/[contractId]` detail: term,
  cycles with server amounts, headcount, location, shift, status, cycle payment status.
- **Accept** / **Reject** on requests (`SC_1534` → capacity message).
- **Suspended** banner: "Client payment overdue. Don't deploy from <date>."
- Cycle rows link to `/bookings/[bookingId]`, where the existing provider-invoice upload works per
  cycle. Contract cycles 2..n hide the duty OTP controls (0014 rule 9).
- **Give notice** with the server's effective date.
- Sidebar (`AppSidebar`) gains **Contracts**, only when the server reports contracts enabled.

**As built:**
- **"Enabled" is detected from the API.** `GET /provider/contracts?limit=1` succeeding means
  contracts are on; `SC_1530`, or any error, means off. `/contracts` shows an honest
  "not open yet" empty state if reached directly.
- **List:** Requests / Active / Ended tabs with counts. It opens on Requests when any are waiting.
  Rows show "24 × Security guard", the term, the location, the provider's price per month (before
  GST, all people) and a status badge.
- **Detail:**
  - Terms: dates and months, shift, people, location, how the client pays (mandate status only)
    and the provider's total over the term.
  - A month list with dates, days and the provider's price. Status badges show once accepted.
    Each month links to its booking.
  - Suspended banner: "Client payment overdue. Don't deploy from <paused month's start>."
  - A notice banner with the server's end date. Accept/Decline with an optional inline reason.
    "Give notice" reads "Cancel before it starts" while `accepted`, because the server cancels
    outright then.
- **`SC_1534` wording:** besides capacity, it's also raised when a provider day off (`SC_406`)
  falls inside the term, so the message names both: "…or a day you've blocked falls inside it."
- **Booking pages:** a contract month shows "Month N of a long-term contract". Duty-code
  controls are hidden where the platform runs the transition (every month after the first, and
  every month's end), replaced by a one-line note. See `dutyRunsItself()`.
- Verified against the local API with contracts switched on in the local database only: the
  refusal on accept (24 guards against 20 declared) and notice with the server's end date.

### E. Performance: `/dashboard` card + `/performance` page (0015)

- A dashboard card "How clients find you" linking to `/performance`. There, each component shows a
  status chip, its importance (High/Medium/Low), the counts behind it ("2 no-shows in the last 90
  days") and the server's tip. Charts, if any, follow the `dataviz` skill. There's no number to
  chart, so this is likely a status list.

### F. Team: new `/team` (0017), agencies only

- List / add / edit personnel: photo, name, phone, category, experience, languages, documents
  with expiry. Two required attestation checkboxes on add.
- "Can't be assigned" state with the reason (missing or expired document).
- Per-person ratings from clients.
- Linked from the Profile hub for agencies only, like `/staff-availability`.

**As built (F + C-team):**
- **`/team` roster:**
  - A summary line ("11 people · 8 ready to assign") and a category filter with counts.
  - Inactive people are hidden behind a switch.
  - One row per person: initials or photo, category, experience and languages, per-person stars,
    and a Ready / Can't be assigned / Inactive badge. The block reason is spelled out under the
    name.
- **Editing in place:** a row expands inline, with no modal, to:
  - the photo (five-minute presigned URL, never cached);
  - each document the category requires, with state (valid / expires soon within 30 days /
    expired / not uploaded) and an inline upload with an expiry date and an optional number,
    which is stored encrypted and never shown again;
  - details, and a switch to mark the person inactive or active.
- **Adding a person:** an inline form with both rule-3 attestations as required checkboxes. The
  new person's editor opens next, for the photo and documents.
- **Booking page Team section (agencies):**
  - Pick exactly N people of the booking's category. Ready people are listed first; blocked
    people show their reason.
  - Documents are checked through the booking's last day, the same rule as the backend, so a
    document that lapses mid-booking is caught before saving.
  - Change the whole team, or replace one person, from acceptance until duty starts. It is
    read-only after that.
  - Swapping is labelled "Confirm swap", distinct from each row's "Replace <name>".
  - The team errors `SC_1582`/`1584`/`1585`/`1589`/`1590` map to plain messages.
- **Payment gate copy:** the spec's "The client can't pay until you assign your team" is not
  shown. `personnel.requireAssignmentBeforePayment` is off by default and isn't exposed to
  providers, so the copy says only what is always true: the client sees who's coming before
  they pay.
- Verified end to end against the local API: roster and document uploads (S3), assigning six,
  and replacing one. History is kept, one entry `replacedAt`.

### G. Live sync (0020)

- One socket per session listening for `account_event`. Reuse the existing chat socket
  connection if one exists. Invalidate the page data for the named entity (booking, contract,
  document, payment, rating) and refetch through `lib/api/*`. Never render the payload.
- On reconnect, refetch the current page once.
- The sidebar's unread-notification count (which `AppSidebar` self-fetches) refetches on every
  event.

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
