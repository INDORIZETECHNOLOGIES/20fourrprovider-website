# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary users (equal weight):**

1. **Individual security professionals** — guards, bouncers, armed gunmen, PSOs — who use this app to manage their profile, upload KYC/PSARA documents, set availability, accept or reject bookings, run their duty shift (OTP start/end, SOS, check-in), and track earnings and settlements.

2. **Security firm and agency administrators** — who manage a team of staff, handle firm-level PSARA licensing, field availability per category per date, and oversee earnings at the firm level.

Both audiences work within the same authenticated shell. Firm-specific surfaces (staff availability, firm headcount management) are a subset not yet built.

## Product Purpose

20fourr is a marketplace and ops platform for professional security services in India. It connects PSARA-licensed security providers (individuals and firms) with clients who need guard, bouncer, gunman, PSO, event-security, or corporate-security coverage — both pre-scheduled and on-demand. The provider app is the supply-side interface: it handles the full lifecycle from profile and credentialing through booking acceptance, duty execution, and post-shift settlement. A separate client-facing app handles the demand side.

Success for a provider means: profile verified, bookings flowing in, duty shifts executed cleanly with OTP/SOS, and earnings settled reliably after each completed shift and admin verification.

## Positioning

The differentiating mechanism is verified, licensed supply: every provider must hold a PSARA licence and pass KYC before accepting bookings. 20fourr is not a generic gig marketplace — it is a credentialed professional platform for a regulated industry, and the provider app is built to reflect that (credential-register aesthetic, verification-status badge, document upload flows).

## Operating Context

- **India, English-only UI.** Providers are based in India; currency is INR (displayed in rupees; wire values are in paise).
- **Pre-scheduled and on-demand bookings.** Providers may have shifts booked in advance or accept requests on short notice.
- **Duty lifecycle:** OTP-based shift start and end, live SOS, periodic check-in, incident reporting, absence alerting.
- **Rate model:** Daily rate (₹100–₹1,00,000 / 4–24 hours per day). Hourly, weekend multiplier, and vehicle rates exist on the backend but are not exposed in the current UI.
- **Settlement:** Payout issued after each completed shift and admin verification, via bank transfer. Not instant.
- **Regulated context:** PSARA licensing is a hard requirement. KYC document upload and admin verification gate full platform access. Verification status is surfaced throughout the authenticated app.

## Capabilities and Constraints

**Built features (current):** Auth (login, register, forgot/reset password, email + phone verify), provider profile setup, KYC document upload, PSARA state coverage, availability (toggle + days-off), bookings (list, detail, accept/reject, mark-complete), duty lifecycle (OTP + gate-guard start/end, SOS, check-in), per-booking chat, support tickets, notifications, earnings/settlements, bank account (add + confirm), tax profile (PAN + GST tier + turnover declaration), tax documents (list + detail + PDF download), account/DPDP (data export, consent withdrawal, erasure request), ratings (submit + own-ratings view), profile photo.

**Not yet built:** Gallery (`/provider/gallery*`), firm staff-availability, replacement requests, penalties/appeals, premium analytics, wallet, referral program, MFA, detailed sub-ratings, photo attachments on ratings, report-a-rating, PSARA document-ID picker for licence attachment.

**Technical constraints:**
- Next.js App Router (v16), React 19, TypeScript, plain CSS modules (Tailwind removed).
- No component library. Styling via CSS custom properties in `globals.css`; extend tokens rather than hardcode values.
- Frontend-only repo; communicates with a separate backend over HTTP.
- `AppShell` (sidebar + mobile bottom tab bar) wraps every authenticated page. `profile/setup` is the one exception (uses `AppTopBar`).
- Booking links use `booking._id` (Mongo id), not `booking.bookingId` (human reference).
- Rates are paise on the wire, rupees in the UI.

## Brand Commitments

- **Name:** 20fourr (the "24/7 always-on" promise is implicit in the name).
- **Palette:** Deep navy (`--color-navy: #1b2a4a`) + muted brass (`--color-brass: #a9782e`) on a cool paper surface (`--color-paper: #f5f6f8`). Light and dark themes defined.
- **Typography:** Roboto Slab (`--font-display`) for wordmark and headings; Public Sans (`--font-body`) for body and form UI.
- **Register:** Credential/ID-card register — authority and verification, not generic SaaS. Icon set is monoline SVG (`Icon` component, stroke `currentColor`); no emoji, no icon packages.
- **Voice:** Direct, professional, plain English. No superlatives or marketing inflation (e.g., no "instant payouts" claim).

## Evidence on Hand

- Full API reference: `apis-docs/PROVIDER_API_REFERENCE.md`
- Comprehensive implementation notes: `CLAUDE.md`
- Established visual implementation: auth shell, app shell, landing page, all built features listed above.
- No fabricated testimonials, customer logos, or benchmark data — do not invent them.

## Product Principles

1. **Verification is the product.** Trust is built through licensed credentials and admin sign-off, not self-reported claims. The UI makes verification status visible and central at every step.
2. **Provider livelihood is real.** Bookings and earnings are not abstract metrics — they are income. Accuracy, reliability, and transparency in earnings, settlement, and duty lifecycle come before aesthetic ambition.
3. **Professional context demands professional UI.** The credential-register aesthetic is a deliberate choice for a regulated industry, not a style preference. Maintain it consistently; do not introduce generic SaaS patterns.
4. **One interface, two provider types.** Individual professionals and firm administrators share the same shell. Build for both; never design a feature that only works for one without acknowledging the other.
5. **Extend, don't duplicate.** Shared primitives (`AppShell`, `PageHeader`, `RowList`, `EmptyState`, `Icon`, tokens) exist to maintain consistency. Every new surface extends this system.

## Accessibility & Inclusion

Focus-visible ring uses `--color-brass` outline (defined in globals.css). No formal accessibility standard has been explicitly required beyond this; WCAG 2.1 AA is a reasonable working target for a professional platform in a regulated industry.
