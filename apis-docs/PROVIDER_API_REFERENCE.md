# Provider API Reference

Every endpoint a **provider** (guard / bouncer / gunman / PSO, individual or firm) needs to build
a provider-facing frontend against. Generated from `src/routes/*.ts`, `src/validators/*.ts` and
the corresponding controllers on `master` as of 2026-09-10.

This is a reference snapshot, not a contract — re-check the source (paths below) before relying on
a field name in production, especially response shapes, which were extracted from controller code
rather than from a schema.

## Conventions

- **Base URL**: `/api/v1` (production: `https://indorize.com/api/v1`).
- **Auth**: Bearer JWT in `Authorization: Bearer <accessToken>`, obtained from `/auth/login` or
  `/auth/verify-otp`. Provider-role routes additionally require the account's `role === 'provider'`
  (`requireRole('provider')` at the mount point) — a client-role token gets `SC_109`.
- **Envelope** — success:
  ```json
  { "success": true, "data": { ... }, "requestId": "..." }
  ```
  (`message` sometimes accompanies or replaces `data` on write endpoints — noted per-endpoint below.)
  error:
  ```json
  { "success": false, "error": { "code": "SC_xxx", "message": "..." } }
  ```
- **Error codes**: every `SC_xxx` code is defined in `src/utils/errorCodes.ts` — that file is the
  canonical source, not this doc. Commonly-hit codes are called out per endpoint; the full catalog
  is summarized in [Appendix A](#appendix-a--error-code-catalog).
- **Money**: all amounts are **integer paise** unless explicitly marked otherwise. Two documented
  exceptions in the whole API: `Wallet.transactions.amount` (whole rupees) and the premium
  analytics endpoints (`/provider/analytics/*`), which return rupees with no unit suffix on the
  field names — see the analytics section for the specific fields.
- **Two billing engines — build against v6.** `Booking.billingEngine` is `'v1'` or `'v6'`, stamped
  at booking creation and immutable. **This project's direction is v6-only going forward** — v1 is
  the legacy engine for bookings created before the cutover and should not be the basis for new
  frontend flows. As of this writing `PlatformSettings.billingV6.enabled` still defaults to `false`
  in code, so confirm with the backend team whether it's been flipped in the environment you're
  pointing at before assuming v6 responses are populated. The v1-only endpoints below
  (`/invoices/*`, `/provider/earnings/payout-history`) are documented for completeness/migration
  purposes only — **do not build new UI against them**. Build against the v6 endpoints:
  `/provider/tax-profile`, `/provider/psara-coverage`, `/provider/settlements`, `/documents/*`.
- **Verification gate**: `requireProviderVerified` (checks `ProviderProfile.isVerified`, not the
  `verificationStatus` review-workflow enum) blocks the handful of actions that commit a provider
  to work — accepting a booking, toggling availability, editing the days-off/staff-availability
  calendars. It deliberately does **not** gate profile, documents, pricing or bank details, since
  those are the steps that produce verification. Gated endpoints are marked below.
- **Pagination**: list endpoints that accept `page`/`limit` return
  `{ ..., pagination: { page, limit, total, pages } }` unless noted otherwise.

---

## Auth — `/api/v1/auth/*`

Shared by both `client` and `provider` roles — pass `role: 'provider'` on register/login so a
provider account can't authenticate as a client and vice versa.

`register`/`login` take `role: 'client'|'provider'` — a mismatch between the requested role and
the stored account role is rejected with `SC_109`, so a provider account cannot authenticate
against a client-app login call and vice versa. No other request/response shape differs by role.

### POST /api/v1/auth/register
Body: `{ name, email, phone (10-digit Indian mobile), password, confirmPassword?, role: 'client'|'provider', referralCode?, termsAcceptedAt, termsVersion?, dpdpConsentVersion?, dpdpConsentPurposes?: {marketing?, analytics?, profiling?} }`
Password policy: 8–128 chars, needs lower+upper+digit+special char.
Response `data`: `{ userId, email, phone, role, message, tokens: { accessToken, refreshToken } }`
Errors: `SC_204` email taken (by a verified account) · `SC_205` phone taken (by a verified account) · `SC_206` weak/same-as-identity password.
Notes: a colliding *unverified* zombie account is silently deleted and registration proceeds. Fires a phone OTP (MSG91) fire-and-forget — failure doesn't block registration.

### POST /api/v1/auth/login
Body: `{ email, password, role?: 'client'|'provider' }`
Response `data`: `{ user: { _id, name, email, phone, role, profilePhoto, emailVerified, phoneVerified }, tokens: { accessToken, refreshToken }, requiresVerification: boolean }`
Errors: `SC_101` invalid credentials · `SC_102` locked (too many failed attempts) · `SC_103` suspended · `SC_109` role mismatch.
Notes: `requiresVerification: true` means email/phone OTP is still pending — route to the OTP screen rather than treating it as a hard error.

### POST /api/v1/auth/refresh-token
Body: `{ refreshToken }` → `data: { accessToken, refreshToken }`. Errors: `SC_108`.

### POST /api/v1/auth/send-otp
Body: `{ phone }`. Rate-limited. Message-only response.

### POST /api/v1/auth/verify-otp
Body: `{ phone, otp: <6 digits> }`. Message-only. Errors: `SC_207`.

### POST /api/v1/auth/forgot-password
Body: `{ email }`. Message-only, deliberately identical whether or not the email exists (enumeration-safe).

### POST /api/v1/auth/reset-password
Body: `{ token, password, confirmPassword }`. Message-only.

### POST /api/v1/auth/device-token
Auth required. Body: `{ token, platform? ('ios'|'android'|'web', default 'android') }`. Keeps the last 5 tokens per user. Duplicates `POST /notifications/device-token` below — either works; pick one for consistency.

### DELETE /api/v1/auth/device-token
Auth required. Body: `{ token }`.

### POST /api/v1/auth/logout
Auth required, no body. Invalidates the stored refresh token.

### POST /api/v1/auth/send-email-verification
Auth required, no body. 10-min OTP, 60s cooldown, max 5/day.

### POST /api/v1/auth/verify-email
Auth required. Body: `{ otp }`.

### POST /api/v1/auth/accept-terms
Auth required.

### GET /api/v1/auth/me
Auth required. Response `data`: `{ user: { _id, name, email, phone, role, profilePhoto, emailVerified, phoneVerified, kycStatus } }`
Errors: `SC_110` (account not found — deleted mid-session).

### PATCH /api/v1/auth/profile-photo
Auth required. Multipart `file` field → uploads to S3 `avatars/`. Response `data`: `{ profilePhoto: string|null }` (S3 key, presigned on the next `/me` read). Errors: `SC_805` no file attached.

### POST /api/v1/auth/change-password/send-otp
Auth required, rate-limited. Same 10-min/60s-cooldown/5-per-day pattern as email OTP.

### POST /api/v1/auth/change-password
Auth required. Body: `{ otp, newPassword, confirmPassword }`. Message-only, forces re-login.

### MFA — /api/v1/auth/mfa/{setup,confirm,verify,disable}
Auth required, TOTP-based.
- `POST /mfa/setup` → `data: { secret, qrCode }`
- `POST /mfa/confirm` body `{ token }` → `data: { backupCodes: string[] }`, activates MFA
- `POST /mfa/verify` body `{ token, useBackupCode? }` → message-only, used at login when MFA is on
- `POST /mfa/disable` body `{ token, password }` → message-only

---

## Direct-to-S3 uploads — `/api/v1/uploads/*`

Auth required (any role). Alternative to the multipart `uploadSingle → uploadToS3` chain used
inline by `/provider/documents/upload`, `/provider/gallery`, `/ratings/photo`, `/tickets/:id/upload`,
`/chat/:bookingId/upload` — those still work and are not being retired. Prefer this path for large
files (KYC docs) since the bytes never transit the API.

### POST /api/v1/uploads/presign
Body: `{ folder: 'documents'|'avatars'|'gallery'|'chat'|'tickets'|'ratings', contentType, contentLength, fileName? }`
Response `data`: `{ uploadUrl, key, expiresIn: 300, contentType, contentLength }`
Client then does `PUT <uploadUrl>` with the exact `contentType`/`contentLength` (they're bound into
the signature — a mismatch is rejected by S3 itself), body = raw file bytes.
Errors: `SC_301` bad folder/contentType/size (>configured `MAX_FILE_SIZE`) · `SC_503` S3 not configured.

### POST /api/v1/uploads/confirm
Body: `{ key }` (the `key` returned by `/presign`)
Response `data`: `{ key, size, mimeType }`
Errors: `SC_301` — unknown key (not yours, or nothing PUT yet, or empty file, or size/type/magic-byte
mismatch — server deletes the object in every rejection case).
Notes: **Required** — no downstream handler accepts a raw presigned key; it must be confirmed first.

---

## Provider profile, documents, pricing, availability, bookings, earnings & account — `/api/v1/provider/*`

Mounted with `authenticate + requireRole('provider')`. "Gated" = `requireProviderVerified` also
applies (blocks until `ProviderProfile.isVerified === true`, else `SC_602`).

### POST /api/v1/provider/profile
Gated: no
Request body: see `createProviderProfileValidator` — `providerType?` ('individual'|'firm'), `serviceCategories[]` (min 1, each one of `guard|bouncer|gunman|pso`), `serviceCity`, `serviceCities[]?` (max 20), `serviceState`, `yearsExperience` (0–50), `pricing[]` (min 1, each `{category, dailyRate (paise, ₹100–₹1,00,000), totalHoursPerDay (4–24)}`) — plus unvalidated passthrough `businessName`, `description`.
Response `data`: `{ profile: <full ProviderProfile doc as created> }`
Errors: `SC_1307` profile already exists · `SC_408` missing serviceCategories · `SC_210` missing pricing.
Notes: sets `responsibilityDeclarationAccepted: true` automatically on creation.

### PUT /api/v1/provider/profile · PATCH /api/v1/provider/profile
Gated: no
Both verbs hit the same `updateProfile` handler (PATCH was added because the mobile app's
responsibility-declaration screen only ever sent PATCH, which 404'd before this fix). Request body:
see `updateProviderProfileValidator` (bio, certifications, vehicleOptions, bankDetails, languages,
serviceRadius, specializations, skills, ex-serviceman/police-veteran flags, adminData.\* private
fields, etc. — full field list in that validator) — also accepts unvalidated `name`, `phone`
(written to `User`, not `ProviderProfile`), `psaraLicense.{number,issuingState}`,
`weaponLicense.number`.
Response `data`: `{ profile: <updated ProviderProfile doc> }`
Errors: `SC_601` no profile.
Notes: submitting **any** `bankDetails` field resets `bankDetails.verified = false` — only an
admin can re-verify. If the account number or IFSC changed, `bankDetails.razorpayLinkedAccountId`
is cleared, so the next payout re-provisions a Razorpay Route linked account. `adminData.*` (DOB,
home address, emergency contact) is private and never shown on the client-facing public profile.
Gallery is not editable here — use `/gallery` below.

### GET /api/v1/provider/tax-profile
Gated: no. v6 spec 0004 — **build against this**: this is the primary tax-profile surface for the
v6 direction this project is taking. It currently ships dark (no pricing path reads it until
`PlatformSettings.billingV6.enabled` is on), but a provider frontend should collect this data now
so providers are v6-ready when the flag flips.
Response `data`: `{ taxTier: 'registered'|'unregistered', panPresent, panMasked, panHolderType, panVerificationStatus: 'unsubmitted'|'pending'|'verified'|'rejected', gstin, gstinStatus: 'not_applicable'|'unverified'|'active'|'cancelled', stateCode, stateName, turnoverDeclaration: {financialYear, amountPaise, declaredAt}|null, psaraCoverage: [{stateCode, stateName, licenceNumber, issuedAt, expiresAt, verificationStatus, expired}], taxProfileComplete: boolean, blockingReasons: string[] }`
Errors: `SC_601`. Never returns the raw PAN — masked only.

### PUT /api/v1/provider/tax-profile
Gated: no
Request body: `{ panNumber, taxTier: 'registered'|'unregistered', gstin?, turnoverDeclaration?: {financialYear, amountPaise} }`
Response `data`: same shape as the GET above.
Errors: `SC_601` · `SC_1401` PAN missing · `SC_1402` invalid PAN checksum · `SC_1407` PAN holder type inconsistent with `providerType` · `SC_1403` GSTIN missing when `taxTier=registered` · `SC_1404` invalid GSTIN · `SC_1405` GSTIN already claimed by another provider · `SC_1406` declared turnover exceeds the exemption threshold for `unregistered`.
Notes: changing PAN resets `panVerificationStatus` to `pending`; GSTIN always saves as `unverified` (only the admin verify flow flips it to `active`).

### PUT /api/v1/provider/psara-coverage
Gated: no
Request body: `{ licences: [{stateCode, licenceNumber, issuedAt?, expiresAt, documentId?}] }` (max 40)
Response `data`: same tax-profile shape.
Errors: `SC_601` · `SC_1408` invalid GST state code · `SC_1409` `expiresAt` in the past · `SC_1410` duplicate state in the array.
Notes: full-array replace — resubmitting the same (stateCode, licenceNumber) pair preserves its prior `verificationStatus`; anything new/changed resets to `pending`.

### GET /api/v1/provider/profile
Gated: no
Response `data`: `{ profile: <full ProviderProfile doc — populated userId {name,email,phone,profilePhoto}, bankDetails.accountNumber masked to last 4, every S3 key (documents, licences, gallery, photo) presigned to a short-lived GET URL> }`
Errors: `SC_601` no profile.
Notes: this is the provider's own full profile, unlike the allowlisted client-facing view at `GET /public/providers/:id` — it includes `adminData` and every document URL.

### POST /api/v1/provider/bank-details/confirm
Gated: no. No body.
Response: `{ success: true, message, data: { confirmedByProvider: true } }`
Errors: `SC_601` · 400 if there's no admin-verified bank account to confirm yet.
Notes: one-tap attestation. Required (alongside admin `bankDetails.verified`) before any Razorpay Route payout fires.

### POST /api/v1/provider/documents/upload
Gated: no
Request: multipart `file` (`uploadSingle` → S3), body `{ documentType: <one of PROVIDER_DOCUMENT_TYPE_IDS — see appendix>, expiryDate? }`
Response `data`: `{ document: { _id, providerId, documentType, fileUrl (presigned), fileName, fileSize, mimeType, verificationStatus, uploadedAt, ... } }`
Errors: `SC_805` missing file/documentType · `SC_500` S3 upload failed.
Notes: re-uploading `bankAccountProof` after admin verification resets `bankDetails.verified`/`confirmedByProvider` to `false`. Auto-promotes `verificationTier` `none → basic_verified` once core KYC docs are present (individual: aadhaar+pan+policeVerification; firm: incorporationCertificate+psaraLicense+policeVerification) — higher tiers are admin judgment calls only.

### POST /api/v1/provider/gallery
Gated: no. Multipart `file` (image/video), body `{ type? ('photo'|'video', default photo), caption? (max 200) }`.
Response `data`: `{ item: { key, url (presigned), type, caption } }`
Errors: `SC_500` upload failed · `SC_601` · `SC_210` gallery cap reached (max 12 items).

### POST /api/v1/provider/gallery/remove
Gated: no. Body: `{ url: <the stored S3 key> }` → `data: { removed: <key> }`
Errors: `SC_601` · `SC_1301` item not found.

### PUT /api/v1/provider/pricing
Gated: **no** (deliberately — pricing is part of the path *to* verification, not gated behind it)
Request body: see `updatePricingValidator` — `{ pricing: [{category, dailyRate (paise, ₹100–₹1,00,000), totalHoursPerDay?, hourlyEnabled?, hourlyRate? (paise ₹50–₹10,00,000, required if hourlyEnabled), weekendMultiplier? (1–3), vehicleWithDriverRate? (paise, ≤₹5,00,000), vehicleRate? (paise, ≤₹5,00,000)}] }`
Response `data`: `{ pricing: <array as saved> }`
Errors: `SC_210` missing/invalid, or pricing not supplied for every category in `serviceCategories` · `SC_601`.

### PUT /api/v1/provider/availability
Gated: **yes**. Body: `{ isAvailable: boolean, reason? (accepted but not stored) }` → `data: { isAvailable }`
Errors: `SC_601`.

### GET /api/v1/provider/availability/days-off
Gated: no. Response `data`: `{ daysOff: [{date, reason}], isAvailable, workingHours }`. Prunes stale past dates on read.

### POST /api/v1/provider/availability/days-off
Gated: **yes**. Body: `{ date: 'YYYY-MM-DD', reason? }` → `data: { daysOff: [...] }`
Errors: `SC_400` bad/past date · `SC_601` · `SC_1307` already blocked · `SC_400` 365-day cap.

### DELETE /api/v1/provider/availability/days-off/:date
Gated: **yes**. Path param `date`. → `data: { daysOff: [...] }`
Errors: `SC_400` invalid format · `SC_601` · `SC_404` not found.

### GET /api/v1/provider/staff-availability
Gated: no. Query: `month?` ('YYYY-MM'). Response `data`: `{ staffAvailability: [{date, counts:{guard,bouncer,gunman,pso,exServiceman}, notes, off}], maxStaff: <profile.numberOfPersonnel|null> }`
Errors: `SC_601`. For firms/agencies tracking per-date headcount across categories.

### PUT /api/v1/provider/staff-availability
Gated: **yes**. Body: `{ date, counts?, notes? }` → `data: { staffAvailability: [...] }`
Errors: `SC_209` invalid date, or per-date total exceeds `numberOfPersonnel`.

### PUT /api/v1/provider/staff-availability/bulk
Gated: **yes**. Body: `{ startDate, endDate, counts?, off? }` → `data: { updatedDays, off }`
Errors: `SC_209` invalid/out-of-order dates, range >366 days, or over-strength count.
Notes: overwrites (not merges) every date in the range; `off: true` zeroes counts across it.

### PUT /api/v1/provider/bookings/:bookingId/accept
Gated: **yes**. Body: `{ acceptedAt? (accepted but unused) }` → `data: { booking }` (now `provider_accepted`)
Errors: `SC_401` not found · `SC_109` not this provider's booking · `SC_402` not `pending` (including a lost atomic-claim race).

### PUT /api/v1/provider/bookings/:bookingId/reject
Gated: no (deliberate — a provider who can't accept must still be able to decline). Body: `{ rejectionReason (required, max 500) }`
Response: `{ success, message: "Booking rejected" }` (no `data`).
Errors: `SC_401` · `SC_109` · `SC_402` not pending.

### PUT /api/v1/provider/bookings/:bookingId/complete
Gated: no (stays open so an accepted booking can't strand mid-lifecycle if verification is later revoked). Body: `{ completionNotes? (accepted but unused) }`
Response: `{ success, message }` (no `data`).
Errors: `SC_401` · `SC_109` · `SC_402` must already be `duty_ended`.
Notes: no money moves here — the v1 70% final payout was already scheduled by `verifyEndOtp`; a background job executes the transfer.

### GET /api/v1/provider/bookings
Gated: no. Query: `status?`, `page?`, `limit?`. Response `data`: `{ bookings: [<Booking docs, populated clientId {name,email,phone}>], pagination }`

### GET /api/v1/provider/earnings
Gated: no. **v1-only, legacy** — reads `Payment.providerPayoutAmount`, never populated by v6
settlement. Useful only for a provider's historical (pre-cutover) bookings.
Response `data`: `{ totalEarnings (paise), totalEarningsINR, thisMonthEarnings (paise), thisMonthEarningsINR, lastMonthEarnings (paise), lastMonthEarningsINR, pendingPayout (paise), pendingPayoutINR, totalBookings, averageRating, monthlyBreakdown: [{month:'YYYY-MM', earnings (paise), earningsINR}] (last 6 months) }`

### GET /api/v1/provider/earnings/payout-history
Gated: no. **v1-only, legacy**. Query: `page? (default 1)`, `limit? (default 20, max 50)`.
Response `data`: `{ payouts: [{id, payoutDate, amount (paise), status:'completed', bookingId, bookingReference, serviceCategory, bookingDate, bookingCount:1}], pagination }`

### GET /api/v1/provider/settlements
Gated: no. **v6 — build against this one, not the payout-history endpoint above.** Query: `page?`, `limit? (max 50)`, `state?`.
Response `data`: `{ settlements: [{bookingId, bookingReference, grossPaise, tcsPaise, tdsPaise, netPaise, state, releaseScheduledFor, releasedAt, utr}], pagination }`

### POST /api/v1/provider/bookings/:bookingId/request-replacement
Gated: no. Body: `{ reason (required, max 500) }` → `data: { ticket }` (auto-opened support ticket, `type:'absence', priority:'high'`)
Errors: `SC_401` · `SC_109`. Also flags `booking.replacementRequested = true`.

### GET /api/v1/provider/penalties
Gated: no. Query: `page? (default 1)`, `limit? (default 50)`. Response `data`: `{ penalties: [...], total, page, limit }`

### POST /api/v1/provider/penalties/:penaltyId/appeal
Gated: no. Body: `{ appealReason (required) }` → `data: { penaltyId, appealStatus: 'pending', message }`
Errors: `SC_209` · `SC_404` · `SC_109` · 409 (no SC_ code) already appealed/waived.

### GET /api/v1/provider/analytics/{growth,demand-heatmap,pricing-suggestions,performance}
Gated: no, but requires an admin-activated `premiumAnalytics` subscription — 403 `SC_PREMIUM_REQUIRED` otherwise.

⚠️ **These four endpoints return money fields in whole rupees, not paise** — the only place in the
provider API besides the Wallet surface where that's true, and unlike Wallet there's no `xINR`
suffix convention here to flag it.

- `growth` → `{ ownMonthlyTrend: [{month, bookings, revenue (rupees)}], marketMonthlyTrend: [{month, bookings}], repeatClientRate (%), totalUniqueClients }` (6-month lookback)
- `demand-heatmap` → `{ heatmap: [{day:'Sun'..'Sat', hour:0-23, count}], hourlyDemand: [{hour, count}], peakHour, nightSharePct, insight }` (3-month, city-wide for the provider's categories)
- `pricing-suggestions` → `{ suggestions: [{category, myDailyRate (rupees), marketAvgDaily (rupees), marketMinDaily, marketMaxDaily, diffPercent, suggestedDailyRate, recommendation, totalProvidersInMarket}] }` (skips categories with no market data or no pricing entry)
- `performance` → `{ bookings: {total, completed, cancelled, disputed, pending, completionRate%, acceptanceRate%, cancellationRate%}, earnings: {totalRupees}, ratings: {average, total, distribution:[{star,count}]}, surchargeBookings: {nightShift, urgent}, marketRank: {rank, outOf, topPercent} }`

### GET /api/v1/provider/account/data-export
Gated: no. DPDP Act §11. Response `data`: a large export object — `exportedAt, exportVersion, legalBasis, dataRetentionPolicy, profile{...}, consent{...}, erasureStatus{...}, clientProfile: null, providerProfile: {providerType, businessName, gstStatus, serviceCategories, yearsExperience, serviceCity, serviceState, verificationStatus, isVerified, rating, totalBookings, totalEarnings, psaraLicense:{expiryDate,verified}, weaponLicense:{expiryDate,verified}, createdAt}, bookings: {count, records ≤500 (last 3yr)}, payments: {count, records ≤500}, documents, wallet, ratingsGiven, ratingsReceived, contact:{dpo, grievance}`.

### POST /api/v1/provider/account/consent-withdrawal
Gated: no. DPDP Act §6. Body: `{ purposes: ('marketing'|'analytics'|'profiling')[], reason? (max 500) }` → `data: { withdrawnPurposes, withdrawnAt }`
Errors: `SC_400` empty/unknown/mandatory purpose · `SC_701` user not found.

### POST /api/v1/provider/account/erasure-request
Gated: no. DPDP Act §12. Body: `{ reason? (max 1000) }`
Response (202): `{ success, message, data: { requestedAt, expectedCompletionBy (+30 days), grievanceContact: 'dpo@secureconnect.in' } }`
Errors: `SC_701` · `SC_409` an active booking exists (`pending` through `duty_ended`).
Notes: also sets `user.isSuspended = true` immediately.

---

## Bookings (shared surface) — `/api/v1/bookings/*`

Mounted with `authenticate + requireRole('client','provider')`. Three of the routes here have no
role gate at the route layer but are client-only in practice — the controller checks
`booking.clientId === userId` and throws `SC_109` otherwise. A provider frontend should not surface
these as callable in a provider session: `GET /:bookingId/documents`, `POST /:bookingId/cancel`,
`POST /:bookingId/waivers`.

### GET /api/v1/bookings/:bookingId
Auth: client or provider party to the booking — the one genuinely dual-role read here.
Response `data`: `{ booking, isContactVisible: boolean, clientThreatProfile: object|null }`
Errors: `SC_401` not found/deleted party · `SC_109` not a party.
Notes — implements the root `CLAUDE.md` PII rule exactly:
- `isContactVisible` becomes `true` once `booking.status` ∈ `{payment_done, duty_started, duty_ended, completed}`. Before that, when the **client** views the booking, the populated `providerId.name/email/phone` are overwritten with `'Security Professional'`/`'****'`/`'****'`. This masking is one-directional — the client's own identity is not separately masked in the provider's view (`clientId` is always populated with `name, email, phone`).
- `clientThreatProfile` is populated only for the **provider** caller, and only once `isContactVisible` is true — never shown to the client themself, never shown pre-payment. Sourced from `ClientProfile.threatAssessment`.

### GET /api/v1/bookings/:bookingId/documents — client-only (403 `SC_109` for a provider)
### POST /api/v1/bookings/:bookingId/cancel — client-only
### POST /api/v1/bookings/:bookingId/waivers — client-only

### POST /api/v1/bookings/:bookingId/absence-alert (client or provider — SRS §13.2)
Body: `{ reason (required) }` → `data: { ticket }` (support ticket auto-created)
Errors: `SC_401` · `SC_109` · `SC_402` wrong status (must be `payment_done` or `duty_started`).
Notes: applies a penalty against the **provider** regardless of which party filed the report — a
percentage of `finalPayableAmount` from `PlatformSettings` (`penaltyL2Rate`/`penaltyL3Rate`),
suspends the provider (`User.isSuspended` + `ProviderProfile.isSuspended`, kept in sync), and
PSARA-blocks the provider on the critical-window (L3) tier only.

### POST /api/v1/bookings/:bookingId/firm-documents (provider-only in practice — 403 `SC_109` unless caller is `booking.providerId`)
Body: `{ documentType, fileUrl, fileName, fileSize?, mimeType? }` → `data: { document }`
Errors: `SC_209` missing field · `SC_401` · `SC_109` · `SC_403` — reused code: this is normally `BOOKING_ALREADY_ACCEPTED` but here it means "only firm-type providers can upload per-booking documents." Individual providers get this 403.
Notes: `ProviderProfile.providerType` must be `'firm'`. Document is auto-shared with the client (`isSharedWithClient: true`).

(`raiseDispute` is client-only per the route gate and isn't detailed here.)

---

## Duty — OTP-based shift lifecycle — `/api/v1/duty/:bookingId/*`

Mounted with `authenticate + requireRole('client','provider')`; individual routes are further
role-restricted as noted. `generate-start-otp`/`generate-end-otp` are **client-only** — included
because a provider frontend needs to know where the OTP the guard is asked for actually comes
from. `verify-*`/`confirm-guard-*` are **provider-only**. `GET /status` is open to both parties.

### POST /api/v1/duty/:bookingId/generate-start-otp (client only)
Precondition: `booking.status === 'payment_done'`.
Response `data`: `{ otp, expiresIn: 1800, message }` — **the plaintext OTP is returned directly in
the response**; there is no SMS gateway wired for this today, so the client shows/shares it with
the provider in person.
Errors: plain `AppError` (no `SC_` code) — 404 not found, 403 not-your-booking, 400 wrong status, 400 duty already started.

### POST /api/v1/duty/:bookingId/verify-start-otp (provider only)
Body: `{ otp, latitude?, longitude? }` → `data: { message, dutyStartedAt }`
Errors: 404, 403, 400 (wrong status / bad OTP) · `SC_601` no ProviderProfile · 409 already started (lost the atomic claim race).
Notes:
- PSARA licence is **re-validated at this exact moment** — a licence that was fine at booking time but has since expired or been blocked hard-blocks duty start here.
- If `latitude`/`longitude` are supplied, records a check-in geofence result (`checkInGeofence: { verified, distanceMeters, withinFence }`) against `booking.serviceLocation` — never blocks OTP verification even if outside the fence.
- Marks the 30% advance as released (`Payment.advanceReleasedAt = now`) unconditionally, with no
  `billingEngine` check — **verified safe in practice, not a bug**: `booking.controller.ts`
  explicitly sets `providerPayoutAtBooking: 0` for every v6 booking (the 30/70 split doesn't exist
  in v6 — "one transfer, after duty-end," per that file's own comment), so
  `Payment.providerAdvanceAmount` is always `0` on a v6 booking. `payoutProcessor.job.ts`'s
  `settleAdvancePayout()` no-ops on `amount <= 0` before ever calling `razorpayService.transferToProvider`,
  so no real transfer fires. The only cosmetic side effect: `advanceReleasedAt` gets timestamped and
  a "30% advance payment released" log line is written even on a v6 booking where nothing moved —
  harmless, but don't read `advanceReleasedAt != null` as "a payout happened" without also checking
  `advancePayoutStatus`/`providerAdvanceAmount`.
- Transitions `payment_done → duty_started` via an atomic `findOneAndUpdate` claim.

### POST /api/v1/duty/:bookingId/generate-end-otp (client only)
Precondition: `booking.status === 'duty_started'`. Response `data`: `{ otp, expiresIn: 3600, message }` — plaintext OTP again.

### POST /api/v1/duty/:bookingId/verify-end-otp (provider only)
Body: `{ otp }` → `data: { message, dutyEndedAt }`
Errors: 404, 403, 400, 409 already ended.
Notes — the richest side-effect endpoint in the API:
- Transitions `duty_started → duty_ended` atomically.
- Calls the v6 end-of-duty hook (no-op on v1 bookings): issues the service document + settlement statement, recognises revenue, books TCS/TDS — this is the "revenue recognised at OTP end-shift" rule from root `CLAUDE.md`.
- Schedules the v1 final 70% payout for **T+2** (`Payment.finalPayoutScheduledFor`).
- Atomically increments `ProviderProfile.successfulJobCount`; awards `trusted_provider` at 10 jobs (+₹200 SecurePoints) and `elite_provider` at 50 jobs (+₹500 SecurePoints) — strictly sequential, elite only unlocks from trusted.
- Triggers referral rewards (deferred signup bonus, referrer reward, milestone bonus) if this is the referred client's qualifying first booking, non-blocking on failure.

### POST /api/v1/duty/:bookingId/confirm-guard-start (provider only, gate-guard category only)
No OTP. Same effects as `verify-start-otp` (advance release, atomic claim), gated to `booking.serviceCategory === 'guard'`.
Errors: 400 if not a guard booking, plus the same PSARA re-check as the OTP path.

### POST /api/v1/duty/:bookingId/confirm-guard-end (provider only, gate-guard only)
No OTP. Identical side-effect chain to `verify-end-otp` (v6 doc issuance, T+2 schedule, badge award,
referral trigger) — implemented as a **separate copy of that whole block**, not a shared function.
A change to one must be mirrored in the other.

### GET /api/v1/duty/:bookingId/status (client or provider)
Response `data`: `{ bookingStatus, dutySession: { startOtpVerified, dutyStartedAt, endOtpVerified, dutyEndedAt } | null }`

---

## Protection — SOS / live location / incidents — `/api/v1/protection/*`

Mounted with `authenticate` only; role checks per-route.

### POST /api/v1/protection/:bookingId/sos (client or provider)
Precondition: `booking.status === 'duty_started'`. Body: `{ latitude?, longitude?, address?, note? }`
Response `data`: `{ sosId, status: 'active', message }`
Errors: `SC_1309` not a party · `SC_1201` debounced (one SOS per booking per 30s).
Notes: fires an admin notification + counterparty push notification synchronously.

### POST /api/v1/protection/:bookingId/location (provider only — GPS heartbeat)
Precondition: duty in progress. Body: `{ latitude, longitude, accuracy? }`
Response `data`: `{ recorded: true, withinFence: boolean|null, geofenceBreached: boolean, flagged: boolean, reasons: string[] }`
Errors: `SC_1309` role check · 404 no duty session · 422 invalid coords.
Notes: appends to `dutySession.liveLocations` (capped at the last 100); runs spoof/staleness
heuristics against the previous fix; flags (does not block) a geofence breach and notifies admins +
client only on the first breach per duty.

### POST /api/v1/protection/:bookingId/incidents (client or provider)
Precondition: `booking.status` ∈ `{duty_started, duty_ended, completed, settled}`.
Body: `{ category, description (5–4000 chars), severity? ('low'|'medium'|'high'|'critical', default medium), attachments? (max 10 URLs), latitude?, longitude?, address? }`
Response `data`: `{ incident }`

### GET /api/v1/protection/:bookingId/incidents (parties or admin)
Response `data`: `{ incidents: [<populated reporter: {name, role}>] }`

### GET /api/v1/protection/incidents/:incidentId (reporter/counterparty via booking, or admin)
Response `data`: `{ incident }`

Admin-only `GET /sos`, `PATCH /sos/:sosId`, `PATCH /incidents/:incidentId` exist but aren't
provider-facing — listed in the routes file only.

---

## Chat — two parallel surfaces on the same data

⚠️ There are **two** chat route surfaces and they are easy to confuse. Both read/write the same
`ChatMessage` collection — a message sent through one is visible through the other, they're
interoperable, not divergent stores — but they have different shapes. `/chat/:bookingId`
(standalone, mounted at `/api/v1/chat`) is the fuller-featured one: real `page`/`limit`/`total`
pagination, a global unread counter across all bookings, and an upload endpoint. Given the richer
feature set, treat **`/chat/:bookingId` as the primary surface for a new frontend**; the nested
`/bookings/:bookingId/chat/*` variant looks like it was added for simple `?since=`-timestamp
polling clients and lacks upload/unread-count. Both enforce the same gate: chat is only available
once `booking.status` ∈ `{payment_done, duty_started, duty_ended, completed}`.

### GET /api/v1/chat/:bookingId (client or provider)
Query: `page? (default 1)`, `limit? (1–100, default 50)`.
Response `data`: `{ messages: [...], pagination: { page, limit, total, pages } }`
Errors: `SC_401` booking not found · `SC_103` not a party / pre-payment.
Notes: auto-marks incoming messages read in the background; attachment keys presigned before return.

### POST /api/v1/chat/:bookingId
Body: `{ content (max 1000 chars) }` → `data: { message }` (populated `senderId: {name, role}`)
Errors: `SC_301` — **reused code**: `SC_301` is normally `KYC_NOT_VERIFIED`, here it just means empty/too-long content.
Notes: also emits a `new_message` Socket.IO event on room `booking_${bookingId}` (best-effort).

### PUT /api/v1/chat/:bookingId/read → `data: { markedRead: <count> }`
### GET /api/v1/chat/unread → `data: { unreadCount }` (across all of the caller's bookings)

### POST /api/v1/chat/:bookingId/upload (multipart field `file`)
Response `data`: `{ message }` with `messageType: 'image'|'file'`, `fileUrl` presigned.
Errors: `SC_301` if no file (same reused-code quirk as above).

### GET /api/v1/bookings/:bookingId/chat (nested surface)
Response `data`: `{ chat: { _id, bookingId, clientId, providerId, lastMessageAt, messageCount, isClient } }`

### GET /api/v1/bookings/:bookingId/chat/messages?since=<ISO> — `data: { messages }` (no pagination envelope, capped 50/200)
### POST /api/v1/bookings/:bookingId/chat/messages — body `{ content }` → `data: { message }`
### PUT /api/v1/bookings/:bookingId/chat/read — `data: { markedRead }`

---

## Payments — `/api/v1/payments/*`

### GET /api/v1/payments/booking/:bookingId (client or provider party, or admin)
Response `data`: `{ status, amount (paise), amountINR (rupees), platformFee (paise), providerPayout (paise), createdAt }`
Errors: `SC_501` no Payment doc for this booking · `SC_109` not a party.

Not provider-facing: `createOrder`/`verifyPayment` are client-initiated (order creation/confirmation);
`webhookHandler` is Razorpay-only and unauthenticated by design; `releaseCompletionPayout` and
`refundPayment` are `requireRole('admin')`.

---

## Ratings — `/api/v1/ratings/*`

Symmetric — either party rates the other after `completed` status.

### POST /api/v1/ratings/
Body: `{ bookingId, toUserId, rating (1-5), review? (max 500), detailedRatings? {professionalism,punctuality,communication,cleanliness,compliance}, tags? (max 10, from a fixed enum), anonymous?, photos? (S3 keys from /ratings/photo) }`
Response `data`: `{ ratingRecord }` (full Rating doc as created)
Errors: `SC_209` missing field · `SC_1004` rating out of range · `SC_401` booking not found · `SC_109` not a party / wrong `toUserId` · `SC_402` booking not `completed` · `SC_1002` already rated this booking/direction.
Notes: when the ratee is a provider, `ProviderProfile.rating.average`/`.count` are recomputed synchronously from all client-authored ratings on every submit.

### POST /api/v1/ratings/photo
Multipart `file` (via `uploadSingle`+`uploadToS3('ratings')`). Response `data`: `{ fileUrl (S3 key, not a URL despite the name), fileName, fileSize }`
Errors: `SC_309` no file. Collect the returned key into `photos[]` for the submit call above.

### GET /api/v1/ratings/user/:userId
Query: `page?`, `limit?`, `sortBy?` ('recent'|'helpful'|'rating').
Response `data`: `{ ratings: [...], pagination }`. Only `visibility: 'public'` ratings are returned; if `anonymous && isAnonymousApproved`, `fromUserId` is redacted to `{ name: 'Anonymous', profilePhoto: null }`. Photo keys presigned to short-lived URLs.

### GET /api/v1/ratings/my-status
Query: `page?`, `limit?`. Response `data`: `{ ratingRequired: boolean, pendingRatings: [{_id}] }` — the "you have completed bookings pending a rating" nudge surface.

### POST /api/v1/ratings/:ratingId/report
Body: `{ reason (required, one of 'inappropriate'|'spam'|'fake'|'offensive'|'other'), description? (max 500) }`
Response: `{ success, message: 'Rating reported for review' }` (no `data`)
Errors: `SC_209` missing reason · `SC_1001` not found.

---

## Wallet — `/api/v1/wallet/*`

⚠️ **Every amount field in this surface is whole rupees, not paise** — confirmed against
`Wallet.ts:69`, the sole documented exception to the platform's paise rule. Do not run a
paise→rupee conversion on anything returned here. SecurePoints/SecureCoins are v1 wallet
machinery; the wallet endpoints themselves have no `billingEngine` branch — the "OFF on v6" rule
from root `CLAUDE.md` is enforced in the booking/pricing path (`SC_1424`), not here.

### GET /api/v1/wallet/
Response `data`: `{ coinBalance, coinLifetimeEarned, coinLifetimeSpent, pointBalance, pointLifetimeEarned, pointLifetimeSpent (all rupees), pointUsageLimitPct (e.g. 20), walletExpiryDays, transactions: [<last 20, newest first: {currency:'coin'|'point', type:'credit'|'debit', amount (rupees), reason, expiresAt?, bookingId?}>] }`

### GET /api/v1/wallet/transactions
Query: `page?`, `limit? (max 100)`, `currency?` ('coin'|'point').
Response `data`: `{ transactions, totalCount, page, limit, totalPages }`
Errors: 400 (no `SC_` code) if `limit > 100`.

---

## Referral — `/api/v1/referral/*`

### GET /api/v1/referral/my-code
Response `data`: `{ referralCode, shareLink }` — `shareLink` is a hardcoded `https://app.secureconnect.com/signup?ref=...` (a client-app domain); a website integration likely wants to build its own share link from `referralCode` instead.
Errors: `SC_110`.

### POST /api/v1/referral/apply
Body: `{ referralCode? }` (omitted → success no-op).
Response `data`: `{ message, pointsEarned (rupees, instant signup reward), deferredPoints (rupees, credited after first booking), deferredMessage }`
Errors: `SC_110`, plus plain `AppError` 400s (invalid code, self-referral, already referred) with **no `SC_` code** — worth normalizing if the frontend needs to branch on error type.
Notes: atomic — Referral creation + `User.referredBy` + `Wallet.creditPoints` in one transaction.

### GET /api/v1/referral/stats
Response `data`: `{ totalReferred, successfulBookings, totalEarned (rupees), milestones: [{count, reward, achieved}], referrals: [{id, refereeName, refereeEmail, status, createdAt}] }`

### GET /api/v1/referral/leaderboard
Response `data`: `{ leaderboard: [{rank, userId, name, successfulReferrals, earnings}], period: 'current_month' }`

### GET /api/v1/referral/milestones
Response `data`: `{ milestones: [{count, reward, achieved, progress}], currentProgress }`

Admin-only `GET /admin/campaign-status`, `POST /admin/toggle-double-rewards` exist, not detailed here.

---

## Invoices — `/api/v1/invoices/*` (v1 billing engine — legacy, do not build new UI against this)

Per root `CLAUDE.md`'s two-billing-engine split, this surface applies only to `billingEngine: 'v1'`
bookings — i.e. bookings created before the v6 cutover this project is moving to. Documented here
for completeness/handling-historical-bookings only. **New provider frontend work should use the
Tax Documents surface below instead.**

### POST /api/v1/invoices/generate/:bookingId (client or provider party)
Response `data`: `{ invoice: { invoiceNumber, type: 'client'|'provider', lineItems, taxLines: [{label, sac, rate, base, amount, taxType}], subtotalAmount, platformFee, gstAmount, serviceGstAmount, tcsAmount, totalAmount (all paise), clientSnapshot/providerSnapshot: {name,email,phone}, bookingRef, serviceCategory, serviceStartDate, serviceEndDate } }`
Errors: plain `AppError`s with **no `SC_` code** at all in this handler — e.g. "Invoice is available only after payment. Current status: X".
Notes: idempotent — returns the existing invoice if one was already generated for this booking+type. Only invoiceable once `status` ∈ `{payment_done, duty_started, duty_ended, completed}`. **v1-only**; there is no on-demand generate for v6 — those documents are issued automatically by the billing pipeline at duty-end.

### GET /api/v1/invoices/
Query: `page?`, `limit?`. Response `data`: `{ invoices: [<filtered to type:'provider' for a provider caller>], pagination }`

### GET /api/v1/invoices/:invoiceId
Response `data`: `{ invoice }` (populated `bookingId`, `paymentId`). Errors: plain 404/403, no `SC_` code.

### GET /api/v1/invoices/:invoiceId/pdf
Streams `application/pdf` (not JSON). Same auth as `getInvoice`.

---

## Tax Documents — `/api/v1/documents/*` (v6 billing engine — build against this)

The v6 counterpart to Invoices, and the one this project's frontend should be built around. Read-only by design — there is deliberately no POST; issuance is
lifecycle-driven (at OTP end-shift), not on-demand. A provider is authorized to read a document
based on the **booking's** `clientId`/`providerId` (not a snapshot on the document itself), so
renaming a business doesn't lose access. `docType === 'settlement_statement'` is visible **only**
to the provider — never to the client, even on their own booking, per root `CLAUDE.md`'s "explicitly
not a tax invoice" rule.

### GET /api/v1/documents/
Query: `bookingId?`, `docType?` (`platform_fee_invoice`|`service_tax_invoice`|`bill_of_supply`|`settlement_statement`|`platform_credit_note`|`service_credit_note`), `from?`/`to?` (issuedAt range), `series?`, `financialYear?`, `page?`, `limit?`.
Response `data`: `{ documents: [<header-only: documentNumber, series, docType, financialYear, bookingId, issuedAt, status, totalPaise, issuer.party, recipient.party, reversesDocumentId>], pagination }`
Notes: scoped to bookings the caller is a party to; a client's list never includes `settlement_statement` rows. `reversesDocumentId` is non-null for credit notes, letting the UI nest them under the original document.

### GET /api/v1/documents/:documentId
Response `data`: full document — line items, tax lines, full issuer/recipient snapshots, `totalPaise`.
Errors: `SC_1440` not found · `SC_1441` not authorized (including a client trying to read a settlement statement).

### GET /api/v1/documents/:documentId/pdf
Streams `application/pdf`. Same auth/errors as above.

---

## Support tickets — `/api/v1/tickets/*`

### POST /api/v1/tickets/
Body: `{ type (one of dispute|misconduct|payment|absence|misbehaviour|quality|grievance|other), subject (5-100 chars), description (10-1000 chars), bookingId?, priority? (low|medium|high|urgent, default medium), attachments? }`
Response `data`: `{ ticket }` (`messages[0]` seeded from `description`)
Errors: `SC_209` missing type/subject/description.

### GET /api/v1/tickets/
Query: `status?`, `type?`, `priority?`, `sortBy?`, `page?`, `limit?`.
Response `data`: `{ tickets, pagination }` — scoped to `raisedBy: <caller>` only.

### GET /api/v1/tickets/:ticketId
Response `data`: `{ ticket }` — populated `raisedBy` (name/email/phone), `assignedTo` (name/email), attachment keys presigned.
Errors: `SC_901` not found · `SC_109` not the raiser (and not admin/support).

### POST /api/v1/tickets/:ticketId/message
Body: `{ message (required), attachments? }` → `{ success, message: 'Message added' }` (no `data`)
Errors: `SC_209` no text · `SC_901` not found · `SC_902` ticket already `closed` (open a new one instead) · `SC_109` unauthorized.

### POST /api/v1/tickets/:ticketId/upload
Response `data`: `{ fileUrl (raw S3 key, not presigned), fileName, fileSize }`
Errors: `SC_309` no file · `SC_901` not found.
Notes: persist the returned key into a message's `attachments[]`; `getTicketById` presigns on read.

### PUT /api/v1/tickets/:ticketId/close
Response: `{ success, message: 'Ticket closed' }` (no `data`)
Errors: `SC_901` · `SC_109` · `SC_903` already closed.

---

## Notifications — `/api/v1/notifications/*`

### GET /api/v1/notifications/
Query: `page?`, `limit?`, `isRead?` ('true'/'false'), `type?` (one of a fixed set: `booking_request`, `booking_accepted`, `booking_rejected`, `booking_cancelled`, `payment_received`, `payout_released`, `duty_started`, `duty_ended`, `otp_generated`, `rating_received`, `ticket_update`, `admin_message`, `system`).
Response `data`: `{ notifications, pagination }`

### GET /api/v1/notifications/unread-count
Query: `type?`. Response `data`: `{ unreadCount }`

### PUT /api/v1/notifications/read-all
Body: `{ notificationType? }` → `{ success, message: '<n> notifications marked as read' }` (no `data`)

### POST /api/v1/notifications/device-token
Body: `{ token, platform ('ios'|'android'|'web'), deviceName? }` → `{ success, message }` (no `data`)
Errors: `SC_702` — reused code (client-profile-incomplete), used here loosely to mean "user not found."
Notes: upserts by `token` into `User.deviceTokens[]`. Duplicates `POST /auth/device-token` above — functionally equivalent, pick one.

### PUT /api/v1/notifications/:notificationId/read
Response `data`: `{ notification }`. Errors: `SC_1101` not found/not owned.

### DELETE /api/v1/notifications/:notificationId
Response: `{ success, message: 'Notification deleted' }` (no `data`). Errors: `SC_404` not found/not owned.

Admin-only `POST /admin/notifications/broadcast` and its status endpoint exist, not detailed here.

---

## Appendix A — Error code catalog (`src/utils/errorCodes.ts`)

This file is the single source of truth for every `SC_xxx` code — this table is a snapshot for
convenience, not a substitute for it. Ranges are contiguous by domain:

| Range | Domain |
| --- | --- |
| `SC_101`–`SC_110` | Authentication (bad credentials, locked, suspended, token issues) |
| `SC_201`–`SC_210` | Validation (generic field errors, OTP, duplicate email/phone) |
| `SC_301`–`SC_309` | KYC & document verification |
| `SC_401`–`SC_413` | Booking lifecycle |
| `SC_501`–`SC_512` | Payment (order, verification, refund, payout) |
| `SC_601`–`SC_613` | Provider (verification, PSARA/weapon licences, bank details) |
| `SC_701`–`SC_703` | Client (profile, KYC gate) |
| `SC_801`–`SC_805` | File upload |
| `SC_901`–`SC_903` | Support tickets |
| `SC_1001`–`SC_1004` | Ratings |
| `SC_1101` | Notifications |
| `SC_1201`–`SC_1203` | Rate limiting |
| `SC_1301`–`SC_1310` | Generic/server (404, 500, 409, 400, 403...) |
| `SC_1401`–`SC_1425` | v6 tax profile & pricing (PAN/GSTIN/PSARA/turnover, wallet/coupon discount blocking) |
| `SC_1440`–`SC_1446` | v6 tax documents |
| `SC_1460`–`SC_1470` | v6 settlement/payout |
| `SC_1480`–`SC_1485` | v6 ledger & reconciliation |

Codes a provider frontend will hit most often:

- `SC_601` `PROVIDER_NOT_FOUND` (404) — no `ProviderProfile` yet; usually means "call `POST /provider/profile` first."
- `SC_602` `PROVIDER_NOT_VERIFIED` (403) — from `requireProviderVerified`; message is overridden per-context to be provider-facing ("Complete your documents to start accepting work").
- `SC_603` `PROVIDER_SUSPENDED` (403)
- `SC_604`–`SC_612` — PSARA / weapon-licence / ex-serviceman KYC gates, each keyed to a specific PSARA section.
- `SC_512` `PROVIDER_PAYOUT_DETAILS_MISSING` (400) — bank details missing/unverified, payout on hold.
- `SC_109` `UNAUTHORIZED_ROLE` (403) — reused very broadly across controllers for "you are not a party to this resource," not just role mismatches — don't assume it always means an RBAC failure.

⚠️ A few endpoints documented above reuse an error code for an unrelated meaning instead of
allocating a new one (against the root `CLAUDE.md` convention, but reflecting current behaviour, so
noted here rather than silently "corrected"): chat's empty-content and no-file errors return
`SC_301` (nominally `KYC_NOT_VERIFIED`); `POST /bookings/:bookingId/firm-documents`'s
individual-provider-not-allowed error returns `SC_403` (nominally `BOOKING_ALREADY_ACCEPTED`);
`POST /notifications/device-token`'s not-found error returns `SC_702` (nominally
`CLIENT_PROFILE_INCOMPLETE`). Branch on the HTTP status and message text for these three rather
than the code alone.

A number of endpoints — `duty` OTP generation, `invoice.controller.ts`, `referral.apply`'s failure
paths — throw a plain `AppError` with **no `SC_` code at all**; these surface as
`{ success: false, error: { message: "..." } }` with `error.code` absent or a generic fallback.

---

## Appendix B — Provider document catalog (`src/constants/providerDocuments.ts`)

The `documentType` values accepted by `POST /provider/documents/upload`. `appliesTo` is which
`providerType` can upload it; `requiredFor` is which `providerType` the admin verification gate
requires it for before approval.

| id | Label | Section | Applies to | Required for |
| --- | --- | --- | --- | --- |
| `aadhaar` | Aadhaar Card | Identity & KYC | individual | individual |
| `pan` | PAN Card | Identity & KYC | individual, firm | individual, firm |
| `selfieVerification` | Selfie / Live Face Verification | Identity & KYC | individual | individual |
| `passport` | Passport | Identity & KYC | individual | — |
| `drivingLicense` | Driving Licence | Identity & KYC | individual | — |
| `exServicemanCert` | Discharge Book / Retirement Certificate | Professional Verification | individual | — (required if ex-serviceman) |
| `serviceId` | Service ID | Professional Verification | individual | — |
| `characterCertificate` | Character Certificate | Professional Verification | individual | — |
| `certificate` | Security Training Certificate | Professional Verification | individual | — |
| `weaponLicense` | Firearms Licence | Professional Verification | individual, firm | — (required for gunman category) |
| `firstAidCertificate` | First Aid / CPR Certificate | Professional Verification | individual | — |
| `bankAccountProof` | Bank Account Proof | Bank & Tax | individual, firm | individual, firm |
| `gst` | GST Registration | Bank & Tax | individual, firm | firm |
| `udyamRegistration` | UDYAM Registration | Bank & Tax | individual | — |
| `incorporationCertificate` | Certificate of Incorporation / Partnership Deed / Proprietorship Proof | Business Documents | firm | firm |
| `authorizedSignatoryId` | Authorized Signatory ID Proof | Business Documents | firm | firm |
| `psaraLicense` | PSARA Licence | Licensing | firm | firm |
| `addressProofRegisteredOffice` | Address Proof of Registered Office | Compliance | firm | firm |
| `epfRegistration` | EPF Registration | Compliance | firm | — |
| `esicRegistration` | ESIC Registration | Compliance | firm | — |
| `professionalTaxRegistration` | Professional Tax Registration | Compliance | firm | — |
| `labourLicence` | Labour Licence | Compliance | firm | — |
| `insurance` | Public Liability Insurance | Compliance | firm | — |
| `workmenCompensationInsurance` | Workmen / Employee Compensation Insurance | Compliance | firm | — |
| `policeVerification` | Police Verification / Background Check | Compliance | individual, firm | individual, firm |
| `pastEmploymentCheck` | Past Employment Check | Compliance | individual, firm | individual, firm |
| `selfDeclaration` | Self Declaration (PSARA Compliance) | Compliance | individual, firm | individual, firm |

`mobile/src/constants/providerDocuments.js` must be kept in sync with this list per a comment in
the source file — if a new document type appears there but not here, the backend hasn't shipped it
yet.

---

## Appendix C — Booking lifecycle

```
pending → provider_accepted → payment_pending → payment_done → duty_started → duty_ended → completed
                ↓                                                                              ↑
        provider_rejected                                              (also: cancelled, disputed
                                                                          reachable from most states)
```

Provider-callable transitions: `pending → provider_accepted` (`PUT /provider/bookings/:id/accept`),
`pending → provider_rejected` (`PUT /provider/bookings/:id/reject`), `duty_started` (duty-start
OTP/guard-confirm), `duty_ended` (duty-end OTP/guard-confirm), `duty_ended → completed`
(`PUT /provider/bookings/:id/complete`). Payout timing differs by engine: **v1** splits 30% at the
duty-start OTP and 70% at T+2 after the duty-end OTP; **v6** makes one provider transfer released at
duty-end OTP + T+2, with duty-start being a ledger/policy event only (see the open question flagged
in the Duty section above).

Contact-detail and threat-profile visibility flips at `payment_done` — see
`GET /bookings/:bookingId` above.

---

## Appendix D — Things worth knowing before you build against this

Findings surfaced while compiling this reference, not necessarily bugs to fix — flagged so a
frontend integration doesn't get surprised by them:

- **Rupees vs. paise inconsistency.** Everything is paise except: `Wallet` (whole rupees, by
  documented design) and the four `/provider/analytics/*` premium endpoints (rupees, with no field
  naming convention to signal it — unlike `getEarnings`, which pairs every paise field with an
  `...INR` rupee twin).
- **Two chat surfaces, two duty-confirm code paths.** See the Chat section (`/chat/*` vs
  `/bookings/:bookingId/chat/*`) and the Duty section (`confirm-guard-end` duplicates
  `verify-end-otp`'s entire side-effect chain as separate code rather than a shared function).
- **Reused error codes.** `SC_301`, `SC_403`, `SC_702` each carry a second, unrelated meaning in at
  least one handler — see Appendix A.
- **Duplicate device-token registration.** `POST /auth/device-token` and
  `POST /notifications/device-token` do the same thing.
- **Some validated fields are silently unused server-side**: `toggleAvailabilityValidator`'s
  `reason`, `acceptBookingValidator`'s `acceptedAt`, `markServiceCompleteValidator`'s
  `completionNotes` are all accepted and validated but never read by the controller. Sending them
  is harmless but has no effect.
- **v1 double-charges commission** (see root `CLAUDE.md` — added to the client's price and
  deducted from the provider again). This is a known, documented bug in the historical engine, not
  something to "fix" client-side.
- **This project is moving to v6-only; v1 is legacy.** As of this writing
  `PlatformSettings.billingV6.enabled` still defaults to `false` in code, so confirm the flag's
  actual state in whatever environment you're pointing the frontend at. Until it's flipped, every
  *existing* booking is `billingEngine: 'v1'` and the v6 endpoints (`/documents`, `/settlements`,
  tax-profile) will respond but see no data for them — that's expected, not a bug. Build the new
  frontend against the v6 endpoints regardless, so it's ready the moment the flag flips; treat
  `/invoices/*` and `/provider/earnings/payout-history` as legacy-only, kept for bookings that
  predate the cutover.
