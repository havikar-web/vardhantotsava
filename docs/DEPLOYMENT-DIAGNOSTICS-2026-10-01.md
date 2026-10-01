# Deployment diagnostics — 1 October 2026

## Release decision

**Do not launch paid bookings yet.** The current Next.js application can accept protected ceremony requests, but payment checkout, gifts fulfilment and several production prerequisites are incomplete. A successful build does not establish live OTP delivery or a paid launch.

The source was audited against `MANTRAKSHATA-PRD.md`. Its September implementation descriptions are historical; this report records the October state.

## Fixed during this audit

- Reconnected the visible booking/customer/staff/Pandit flows to server OTP and HttpOnly cookie sessions. Browser-generated verification no longer grants access to these flows.
- Removed unauthenticated profile/database/settings/message/payment bypass handlers. Legacy endpoints now use the same protected service and cannot arbitrarily send messages or change records.
- Removed embedded credentials from the legacy browser adapters/admin screen; preserved configuration in ignored `.env.server`.
- Added a Next.js custom start that serves pages, protected API and a durable reminder worker together. Repaired the previous Vite deployment mismatch and missing refresh routes.
- Restored birthplace manual/search input and optional birth time to the protected form. Dates reject calendar rollovers; server owns phone, amount and booking status.
- Added Pandit assignment scoping, assignment history and a conservative three-hour clash guard. Main Acharya configuration receives staff access. This is not a full availability/calendar system.
- Delivery states cannot regress when webhook events arrive out of order. Invalid JSON returns 400; webhook signatures and request-body limits are enforced.
- Retired browser-amount gift checkout. A blocked payment reports failure and does not mark an order paid.
- Replaced the portal modal entry with the full secure portal, avoiding its hydration mismatch. Added route wrappers, sitemap and private-route robots exclusions.

## Test evidence

**Final results:** production build/type checks passed; 10/10 server test groups passed; 14/14 tested route refreshes returned 200; the browser OTP-to-booking journey passed with no runtime errors; mobile booking had no horizontal overflow. The final configured-secret scan passed with zero matches in source/browser assets. Dependency audit reported zero advisories. These checks cover the implemented protected request flow; incomplete PRD flows are not marked as passed.

`npm run test:server`: 10 passing test groups. Covers hidden/hashed OTP, cooldown, five-attempt lockout, expiry, single use, delivery failure, sessions/logout, cross-account and staff denial, server price authority, strict dates/manual data, Pandit isolation/clash/history, signed webhooks, obsolete API denial, malformed JSON, assignment notifications, cancellation/rescheduling, persisted once-only reminders, next-day consent/completion and ambiguous provider outcomes.

`scripts/browser-diagnostics.mjs` tests the **production-built website** with a mock provider and an isolated in-memory database. It checks route refreshes, wrong OTP rejection, correct OTP login, registration, server-persisted ceremony request, dashboard reload, mobile overflow and logout. See `browser-diagnostics-2026-10-01.json` for the latest run outcome. Provider sends and payment charges are not real in this test.

Read-only live Meta evidence: `provider-readiness-2026-10-01.json`. Credential leak scan: `secret-scan-2026-10-01.json`. Build/type-check and dependency audit are local checks, not hosting or field-performance measurements.

## PRD compliance

| Requirement | Current position / remaining work |
|---|---|
| FR-01 Catalogue | Public pages render; catalogue price/inclusion/shipping copy needs one approved source and consistent display. Legacy sample amounts are not payable prices. |
| FR-02 Birth details | Protected form preserves manual birthplace/time and Vedic inputs; dates validated. No certified automatic astrological calculation is claimed. |
| FR-03 OTP | Secure service wired to UI; mock/browser security checks pass. Real handset delivery and webhook receipt still require a supervised live test. |
| FR-04 Requests | Owned, durable requests with IST time, 48-hour notice and Bengaluru PIN prefix. PIN prefix is a coarse boundary; exact address/serviceability and availability remain human checks. |
| FR-05 Payment | **Incomplete.** Provider capture/amount/currency/booking-reference verification exists for staff confirmation. Customer order/quote checkout and verified payment/refund webhooks are not implemented. Checkout remains blocked. |
| FR-06 Confirmation | Atomic protected confirmation and outbox exist. Needs approved server prices and an explicit recorded availability decision before paid release. |
| FR-07 Assignment | Protected staff assignment/reassignment, history, notification versions, basic clash guard and scoped Pandit view exist. Pandit directory/availability and schedule-conflict checks on rescheduling remain incomplete. |
| FR-08 WhatsApp | Protected dispatch, persistent worker/jobs, bounded retry and signed delivery webhook exist. Eight templates approved; next-day template missing. App secret and live recipient tests pending. |
| FR-09 Portal | Server-backed owned bookings and logout work. Family/profile management, consent-change/history and fuller customer portal features remain incomplete. |
| FR-10 Gifts | Browse/wizard exists; **persistent quotes, owned orders, pricing, stock, shipping, payment and fulfilment backend incomplete.** No paid success is fabricated. |
| FR-11 Operations | Staff actions, audit records and queue/retry exist. Refunds, fulfilment, audit UI, incident alerts and granular coordinator/admin permissions incomplete. |
| FR-12 Exceptions | Cancel/reschedule invalidate pending jobs; completed records are protected. Refund lifecycle and revised customer/Pandit messages after rescheduling remain incomplete. |
| FR-13 Policies | Contact/business identity present. Dedicated policy pages explicitly await business approval; they are not final legal policies. |

## Resolve before deployment

### Business/account details you must provide

1. Final package/product prices, taxes and shipping rules. Until then, X prices must remain non-payable and public sample prices need reconciliation.
2. Main Acharya name/mobile and the authorised staff phone list. Pandit details can still be supplied per ceremony.
3. Approved privacy, terms, cancellation/refund policies and support hours.
4. Create/approve **`mantrakshata_next_day_followup`**, English, three body parameters. Use the existing English template document for the exact draft. All other required templates are approved as of this live check.
5. Configure the Meta app secret, subscribe WhatsApp delivery webhooks and confirm the public webhook verification flow.
6. Confirm hosting supports **Node.js 24, a continuously running custom server and persistent private storage**. “Hostinger Cloud” alone does not prove these capabilities; if unavailable use a suitable Node/VPS backend. Supply the actual deployment access/configuration before testing hosting.

### Engineering still required for the full PRD

- Authoritative quote/order creation and customer Razorpay checkout; verified idempotent capture/refund webhook reconciliation; failed/duplicate payment tests.
- Server-owned gift orders and fulfilment; stock/serviceability; shipping charge validation.
- Family records, consent history and updates, reschedule availability/conflict checks, changed-schedule notifications, granular staff permissions.
- Consistent public catalogue/pricing/copy; page-specific metadata; route/bundle splitting where useful; complete keyboard/accessibility/performance audit.
- Production monitoring, queue alerts, backups with a tested restore and rollback procedure.

### Final staging release gate

Run a real OTP to an authorised test handset; confirm eight approved lifecycle deliveries with designated recipients, plus the ninth after approval. Run payment success/failure/duplicate/refund scenarios using Razorpay test mode before controlled live settlement. Verify HTTPS cookies, restart persistence, reminders after restart, signed public webhooks, deep links, backup restore, mobile performance and a supervised pilot. No real customer messages, charges or deployment occurred during this audit.

## Current live Meta approvals

| Template | Status |
|---|---|
| `hav_otp1` | Approved, en_US, four body parameters plus dynamic URL |
| `mantrakshata_welcome_catalog` | Approved, en, one parameter |
| `mantrakshata_booking_confirmed` | Approved, en, nine parameters |
| `mantrakshata_main_acharya_assignment` | Approved, en, seven parameters plus dynamic URL |
| `mantrakshata_customer_pandit_details` | Approved, en, seven parameters |
| `mantrakshata_pandit_booking_details` | Approved, en, eleven parameters |
| `mantrakshata_reminder_1day` | Approved, en, seven parameters |
| `mantrakshata_reminder_2hours` | Approved, en, five parameters |
| `mantrakshata_next_day_followup` | Not found in account |

Approval is not evidence of successful handset delivery. Removed source credentials should still be rotated before production because deleting a secret does not revoke earlier exposure.
