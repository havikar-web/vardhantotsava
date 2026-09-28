# Current website repair report — 28 September 2026

Project: D:\HAVIKAR\mantrakshata-website - Copy

## Fixed in this pass

- Found a new regression: the draft button called processSuccessfulPayment('demo_no_payment'), set confirmed, and dispatched booking/assignment messages. Draft completion now persists draft status, sends neither confirmation nor assignment, and shows accurate success copy.
- Removed real OTP/promotional dispatch from demo OTP flows in booking and portal. Browser-generated/displayed preview codes do not establish real phone ownership. New preview profiles are no longer marked truly verified.
- Booking verification no longer falls back to a different active profile when the entered phone has no matching profile.
- Added two calendar days of booking notice at date input, step progression and final save. Future DOB and blank names are rejected. A production server must repeat validation in Asia/Kolkata and define calendar-day versus exact 48-hour policy.
- Booking, gift and store save helpers return failure when browser storage fails; callers do not continue to success. Multi-key browser writes are still not transactional; durable production persistence remains required.
- Removed duplicate explicit booking database sync from the page; the existing store sync remains. Draft save still means local persistence, not proof that cloud sync succeeded.
- Dashboard no longer automatically marks birth details verified. Preparation no longer follows assignment as a claimed completed event. Support link uses +91 8296925577.
- Dashboard respects bookingId links and reports an unknown ID instead of silently showing another booking.
- Footer WhatsApp links use the supplied official number; generic Instagram link replaced with hello@bhatco.com.
- Privacy, terms and cancellation now have distinct routes with explicit pending-policy notices. These are not final legal policies: no terms or refund deadlines were invented.
- Unknown routes now show Page not found with a working home button.
- Added programmatic labels to adjacent form controls in booking, gifts, store, portal, homepage and operations source where applicable. Remaining nested/unassociated controls need a full accessibility pass.
- Removed the unused globally loaded Razorpay checkout script. Existing credential settings were preserved.
- Restored a visible draft/pricing/two-day notice so incomplete operations are not presented as live reservations.

## Verification

- Production TypeScript/Vite build passed before final copy edits; final build rerun as part of handoff.
- 32 route/viewport checks: zero page JavaScript errors and zero horizontal overflow at 1440px and 390px in the scanned states. Local image probe found no completed broken images. This is not exhaustive image/animation/accessibility verification.
- Initial booking and gift steps: zero unassociated fields in the route probe after the label repair. Other pages retain some nested-label issues.
- Booking browser regression: wrong OTP rejected, correct preview OTP accepted, address error shown, completion reaches an accurate draft dashboard; missing assignment ID reports not found.
- Gift browser regression: required-field gate and draft completion passed.
- New regression checks: simulated storage failure returns false; invalid ceremony date blocked by two-day guard; all policy routes, 404 and unknown dashboard booking links render expected states.
- All browser test external requests blocked. No live WhatsApp sends, provider registrations, payments or remote database changes were performed by the tests.

## Still open — do not treat these as completed

1. **Server security and secrets:** current db.ts directly uses Neon from the browser; whatsapp.ts directly calls Meta and has browser-managed credentials. Credentials were preserved per instruction, but this is unsuitable for public release. Move them into a server, revoke exposed credentials, and verify browser bundles contain no secrets.
2. **Authentication and authorization:** OTP remains a local demonstration, admin/assignment routes have no server-enforced roles, local data is not a secure account boundary. Customer portal/global family/bookings need backend ownership enforcement and session handling; the single profile fallback fix does not solve full account isolation.
3. **Payments:** no verified server payment-order/capture/webhook path; draft saves are not reservations. Numeric prices, shipping and business policies are pending.
4. **Automation:** template helpers alone do not implement durable 24-hour, two-hour and next-day jobs. Need idempotency, reschedule/cancel rules, approved templates, delivery webhooks and consent. The promotional welcome must not be sent merely because OTP was entered.
5. **Operations:** actual booking availability, custom Pandit details, completed-event records and authoritative milestones need a durable service. Public admin controls can still change local state and may invoke configured integrations; protect them before sharing publicly.
6. **Data migration:** this patch does not rewrite earlier falsely confirmed records. Review existing records against actual payments/availability before treating them as real.
7. **Persistence reliability:** store currently catches/returns local errors but remote sync failures are not an authoritative booking result; implement server transactions and retry/error state. Browser data may be lost when storage is cleared.
8. **Release quality:** large initial bundle (~984 kB before final copy edits), full keyboard/modal/contrast audit, canonical/SEO metadata, production host/deep-link tests, monitoring, backups and rollback remain.

Backups of the main files before this repair are in D:\HAVIKAR\v2\loose-ends-backup-20260928. No credentials were printed or rotated. No claim of production readiness is made.
