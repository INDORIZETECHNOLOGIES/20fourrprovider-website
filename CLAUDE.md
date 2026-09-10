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

The project was scaffolded with `create-next-app` (Next.js App Router, TypeScript, ESLint) and is
otherwise a blank slate: no API client or auth flow exist yet beyond the placeholder home page in
`src/app/`.

### Styling: raw CSS, not Tailwind

Tailwind was removed from the scaffold. Style with plain CSS: a `*.module.css` file colocated next
to each component/page (e.g. `page.tsx` + `page.module.css`), imported as `styles` and applied via
`className={styles.foo}`. Shared design tokens (color, spacing, radii, font stacks, light/dark via
`prefers-color-scheme`) live as CSS custom properties in `src/app/globals.css` — reuse those tokens
(`var(--space-4)`, `var(--color-fg-muted)`, etc.) rather than hardcoding values, and extend that
token set as new needs come up instead of introducing a second styling system.

## Commands

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm start` — run a production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

No test runner is configured yet — don't assume one exists.

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
  `/provider/settlements`, `/documents/*`, not the v1-only `/invoices/*` or
  `/provider/earnings/payout-history`, which exist only to serve historical bookings.
- `requireProviderVerified` gates the actions that commit a provider to work (accepting a booking,
  toggling availability, days-off/staff-availability) but deliberately not profile/documents/
  pricing/bank-details, since those are the path *to* verification.
- The booking lifecycle (`pending → provider_accepted → payment_pending → payment_done →
  duty_started → duty_ended → completed`, plus `provider_rejected`/`cancelled`/`disputed`) and the
  OTP-based duty-start/duty-end flow are the backbone of most provider screens — see Appendix C and
  the Duty section of the reference doc before building booking or duty UI.

### Frontend structure

App Router under `src/app/`, path alias `@/*` → `src/*`. Nothing beyond the default template exists
yet — there's no established folder convention for API clients, feature modules, or shared UI to
follow, so the first real feature built here effectively sets that convention.
