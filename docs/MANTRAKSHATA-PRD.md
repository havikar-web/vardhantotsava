# Mantrakshata — Product Requirements Document

Version 1.0 · 27 September 2026 · Based on local source and browser audit

**Current implementation audit:** see [DEPLOYMENT-DIAGNOSTICS-2026-10-01.md](DEPLOYMENT-DIAGNOSTICS-2026-10-01.md). The implementation/evidence columns below describe the September baseline. The project now uses Next.js with a protected server; the October report records tested progress and remaining gaps.

## Product and outcome

Enable a family to plan and book a Vardhantotsava, receive a confirmed schedule, have a Main Acharya assign a Pandit, and receive accurate WhatsApp updates through the day after the ceremony. Offer gifting as a related journey. The service must preserve user-entered birth details and distinguish an enquiry, an unpaid request, a confirmed booking and a completed ceremony.

The current implementation is a Vite/React frontend with browser-local drafts. It is a demonstrable prototype, not a live booking system. This PRD defines the production target; requirements below must not be read as implemented features.

## Users and permissions

| Role | Required access |
|---|---|
| Visitor | Browse services, packages and FAQs; begin a request |
| Customer | Verify their phone, manage their own profile/family, book, view their own bookings and gifts |
| Main Acharya | View confirmed ceremony requests, assign/reassign an eligible Pandit, review availability |
| Pandit | View only their assigned ceremonies and necessary customer/Sankalpa details; report availability and completion |
| Operations admin | Manage bookings, fulfilment, refunds and failed notifications with an audit trail |

## Scope and decisions

Launch scope: English website and messages; Bengaluru home ceremonies; India-wide birthplace search with manual fallback; customer booking and gifting; role-protected operations; the nine-message WhatsApp sequence specified below.

Birthplace coverage is separate from service coverage. Searching an Indian village must not imply that a home ceremony or gift delivery is available there. Search cannot guarantee every village is indexed; manual entry is mandatory.

Decisions awaiting business confirmation: official WhatsApp number, exact approved hav_otp1 payload/language/buttons, package pricing and taxes, payable amount/deposit, service areas, cancellation/refund terms, actual Pandit directory and contacts, gifting delivery coverage, and whether the next-day message is feedback or another kind of reminder. Current interpretation: next-day thank-you and feedback to the customer. Subsequent business decisions: Bhatco Eventures Pvt Ltd owns the brand; hello@bhatco.com and +91 8296925577 are official contacts; full payment, Bengaluru coverage, minimum 48 hours notice and any requested time slot. Prices remain X pending approval; shipping, policies, support hours and coordinator contact remain unresolved.

Out of launch scope unless explicitly approved: all-India home ceremonies, automatic astrological certification, real livestream infrastructure, annual marketing campaigns, subscriptions and native apps. Existing promotional or demo screens do not establish these capabilities.

## Functional requirements and acceptance criteria

| ID | Requirement | Acceptance criteria | Current evidence |
|---|---|---|---|
| FR-01 | Browse services and compare packages | Prices, inclusions, exclusions and service coverage agree across pages and checkout; all CTAs lead to the intended flow | Pages exist; business sign-off pending |
| FR-02 | Capture celebrant details | Name/DOB validated; future birth date rejected; optional time; arbitrary birthplace accepted; manual Nakshatra/Rashi/Gotra/Pada with unknown states; no invented defaults | Manual fields and location fallback exist; validation coverage incomplete |
| FR-03 | Register via OTP | Server generates expiring, single-use OTP; limits attempts/resends; verifies phone ownership; creates secure session; registration message only once | Demo OTP only; code visible in browser |
| FR-04 | Collect ceremony request | Future date/time, timezone, validated address/contact, available service area and explicit quote; preserve entered details when moving back | Local five-step wizard works |
| FR-05 | Take payment | Server prices order; verifies provider signature, amount, currency and capture; duplicate/replayed callbacks cannot duplicate a booking | Disabled; draft-only save |
| FR-06 | Confirm booking | Persist transaction and availability decision before confirmation; show exact recorded state to customer and staff | Browser-local drafts; no production confirmation authority |
| FR-07 | Assign Pandit | Main Acharya authenticates; exact booking selected; prevent clashes; atomically save assignment; notify customer and Pandit once per version; retain history | Local assignment preview; no protected service or availability engine |
| FR-08 | Deliver WhatsApp lifecycle | Approved templates, consent records, server dispatch, delivery tracking, retries, deduplication and scheduling | Draft library; no sender/jobs |
| FR-09 | Customer portal | Own data only; available on another device after login; logout expires session; no cross-account family/booking exposure | Local profile UI; not production authentication |
| FR-10 | Gifts | Persist selected items, recipient/message, quote, payment and delivery state; check stock/coverage before confirmation | Draft wizard and store exist |
| FR-11 | Operations | Role-protected actions; validated state transitions; audit who changed what; retry failed notifications | Public local admin UI |
| FR-12 | Changes and exceptions | Cancel/reschedule/reassign with explicit confirmation; cancel stale jobs; refund from provider events; failed payment remains unconfirmed | Production exception handling missing |
| FR-13 | Trust and support | Real support channels; dedicated privacy/terms/cancellation pages; business-approved copy | Inconsistent contacts; policies point to FAQ |

## Required WhatsApp lifecycle

| # | Event | Recipient | Template | Trigger rule |
|---|---|---|---|---|
| 1 | OTP request | Customer | hav_otp1 | Exact user-supplied approved template; never invent its parameters |
| 2 | Registration complete | Customer | mantrakshata_welcome_catalog | First account creation after server OTP verification; not every login |
| 3 | Vardhantotsava confirmed | Customer | mantrakshata_booking_confirmed | Availability and required payment confirmed and booking persisted |
| 4 | Assignment needed | Main Acharya | mantrakshata_main_acharya_assignment | Confirmed booking needs a Pandit; authenticated booking-specific link |
| 5 | Pandit assigned | Customer | mantrakshata_customer_pandit_details | Committed current assignment; real name/contact/arrival time |
| 6 | Assignment brief | Assigned Pandit | mantrakshata_pandit_booking_details | Same committed assignment; ceremony, venue, customer and Sankalpa details |
| 7 | One-day reminder | Customer | mantrakshata_reminder_1day | 24 hours before confirmed ceremony start |
| 8 | Two-hour reminder | Customer | mantrakshata_reminder_2hours | 2 hours before confirmed ceremony start; does not assert Pandit departure |
| 9 | Next-day follow-up | Customer | mantrakshata_next_day_followup | Proposed 10 AM IST next day, only after recorded ceremony completion |

Messages 5 and 6 are two recipients of one committed assignment event, not two independent booking transitions. Pandit reminder copies are not assumed in the requested scope. Obtain appropriate consent and template approval; the drafted follow-up category is provisional. No template draft is evidence of provider approval.

Scheduler rules: store timestamps with timezone context; calculate from Asia/Kolkata ceremony time; skip elapsed reminders for late bookings; cancel jobs on cancellation; replace jobs on reschedule; invalidate old assignment notifications; deduplicate by booking, event, recipient and schedule/assignment version. Persist provider message IDs and delivery failures. Retry transient failures with a bounded policy and surface exhausted retries to operations. Never mark a message delivered without provider evidence.

## State and data model

Booking: draft → requested → awaiting_payment/availability → confirmed → completed. Cancellation and rescheduling are explicit audited transitions. Keep payment, assignment and notification status separate from booking status: assigning a Pandit must not imply payment, and payment must not imply an available slot.

Payment: created → pending → captured or failed; refunds separately requested → initiated → processed/failed. Gift orders: draft → awaiting_payment → confirmed → packed → shipped → delivered, plus cancellation/refund exceptions. Shipment events need a real carrier reference.

Persist: Customer, Consent, FamilyMember/Celebrant, Booking, QuoteSnapshot, Payment, Pandit, Availability, AssignmentHistory, GiftOrder/Items, NotificationOutbox, ScheduledJob, DeliveryEvent and AuditEvent. Use server-generated unique IDs, timestamps and ownership keys. Monetary amounts use integer minor units. Snapshot accepted prices and ritual details so later catalogue changes do not rewrite a booking.

## Technical boundaries

Retain the frontend where practical. Add an authenticated server API and durable database. Server owns validation, authoritative prices, booking transitions, OTP, provider credentials, payments and WhatsApp calls. Browser storage may keep optional drafts, never authoritative reservations or roles. Database credentials must not be VITE-exposed values.

Suggested API responsibilities: OTP request/verify/logout; profile and owned family records; quotes/bookings; payment-order creation and verified webhook handling; role-protected assignments; gifts/orders; message delivery webhooks; internal scheduled-job worker. Authenticate and authorize each request. Validate provider webhook signatures and reject replay/duplicate effects.

Use an outbox written in the same transaction as each business event. A worker sends WhatsApp messages and records acceptance/delivery state. Secret configuration remains server-only. Rotate credentials previously exposed to the frontend before production use; removal from source does not revoke a secret.

## UX, accessibility and performance requirements

- Compact desktop sections should fit typical screens when content permits; mobile forms may scroll naturally. Do not crop fields or constrain content to a fixed viewport merely to satisfy one-screen styling.
- Preserve entered values after recoverable failures; show visible error messages; do not show success if persistence failed.
- Programmatically associate every field label; keyboard navigation, visible focus, modal focus containment/return and Escape dismissal; readable contrast and reduced-motion support.
- Motion must not block booking or obscure text. Disable nonessential effects for reduced-motion users and check mobile scroll/frame performance.
- Proposed production acceptance targets: p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1; measure on deployed mobile traffic or a representative lab setup. No current measurement is claimed.
- Add route splitting, image loading budgets, unique page metadata, meaningful not-found pages and deployment deep-link support. Private operations pages should not be indexed.

## Analytics and operational requirements

Track a minimal funnel: package view, booking start, valid details, OTP request/verified, quote accepted, payment captured, booking confirmed, assignment complete and ceremony completed. Do not put phone, name or birth details in analytics URLs/events. Record notification failure rates, unassigned upcoming bookings and payment/booking mismatches. Product conversion targets should be set after a pilot baseline.

Require production error monitoring, webhook/job alerts, durable logs without secrets, database backups and a tested restore process. Name an operations owner for same-day exceptions and define support hours before promising response times.

## Delivery priorities

1. Foundation: approve business facts; configure server/database; rotate old credentials; implement identity, roles and data ownership. Gate: anonymous requests cannot access or change another account's data.
2. Transactions: persist bookings/quotes, verify payments, implement state transitions and assignment availability. Gate: verified payment and availability produce exactly one confirmed booking; failures do not.
3. Messaging: obtain hav_otp1 and remaining approvals; integrate provider/outbox/scheduler/webhooks. Gate: all nine events deliver to correct test recipients; duplicates, cancellations and schedule changes behave correctly.
4. Launch finish: policies/contact cleanup, accurate dashboards, accessibility, mobile admin overflow, performance and production deployment. Gate: business sign-off and monitored pilot.

These are dependency phases, not calendar estimates. Provider approval and business decisions can change elapsed time.

## Release gate / definition of done

- No open critical authorization, data-loss or payment-integrity issue.
- End-to-end staging evidence: fresh registration, successful booking, failed payment, duplicate webhook, customer/Pandit notifications, reminders, cancellation, reschedule and next-day follow-up.
- Cross-account and role-denial tests pass; no production secret in browser assets.
- Real customer can recover their booking from a second device.
- Actual policies/support channels and package facts approved.
- Accessible core journey tested on keyboard and mobile; performance measured; no blocking runtime error.
- Production domain/HTTPS/deep links, monitoring, backup restore and rollback verified.
- Small supervised pilot completed before general paid-booking release.

## Audit reference

See LAUNCH-READINESS.md and launch-scan-results.json for current findings and test boundaries. No real customer message, payment or production deployment was performed during the scan.
