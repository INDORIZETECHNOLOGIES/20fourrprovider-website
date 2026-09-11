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

The project was scaffolded with `create-next-app` (Next.js App Router, TypeScript, ESLint). Auth
(login/register), provider profile setup, and KYC document upload are built; everything else
(availability, bookings, duty, earnings) is still unbuilt.

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
  `/provider/settlements`, `/documents/*`, not the v1-only `/invoices/*` or
  `/provider/earnings/payout-history`, which exist only to serve historical bookings.
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
- `src/components/ui/` — generic form primitives (`Field`, `Select`, `Textarea`, `Button`, `Banner`)
  shared across features.
- `src/components/layout/AppTopBar` — the shell for authenticated pages (wordmark + sign out).
  `AuthShell` (split panel) is auth-only; authenticated feature pages use `AppTopBar` instead.
- `src/components/<feature>/` — feature-specific components (e.g. `auth/AuthShell`, `LoginForm`,
  `RegisterForm`, `profile/ProfileSetupForm`), each with a colocated `*.module.css`.
- Pages that require a session (`dashboard`, `profile/setup`) follow the same gate: read
  `useSession()`, redirect to `/login` if absent, and return `null` while an async check (session or
  profile-completeness) is in flight — see `src/app/dashboard/page.tsx`.
