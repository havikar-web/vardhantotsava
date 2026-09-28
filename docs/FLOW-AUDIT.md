# Flow audit and handoff

## Working local flows
- Booking: package and birth-detail handoff, dated ceremony request, demo-code verification bound to a phone, address checks, package selection, review, locally saved draft. Unknown Vedic details are not invented.
- Gifts: custom selection retained in a draft; store starts with an empty cart and saves a draft without claiming payment.
- Assignment: lookup uses the requested booking ID, rejects missing IDs and invalid scholars, and preserves the payment/booking state.
- Templates: 32 English drafts with search, category filtering, copy and Markdown/JSON downloads at /admin/templates.
- No message is sent by template-preview actions. No client-side provider or database credential is used by the revised adapters.

## Required before public launch
1. Deploy an authenticated server API; admin and assignment endpoints need role-based authorization and customer ownership checks. Current local admin pages are not secure admin authentication.
2. Move database access exclusively to that API. Rotate any database credentials previously shipped in the browser bundle; this change removes the direct client connection but cannot revoke a key.
3. Implement server-generated OTP with rate limits, TTL, attempt limits and an actual sender. Demo verification is not identity verification.
4. Create Razorpay orders server-side from authoritative prices. Verify signature, order ownership, amount, currency and capture/webhook state before confirming. Do not trust browser success callbacks alone.
5. Add WhatsApp opt-in, approved templates, server-only credentials, webhook delivery tracking and idempotent lifecycle jobs. Do not dispatch marketing at OTP verification.
6. Configure the official WhatsApp number, public domain, real stream/tracking links and refund policy. The supplied message pack intentionally leaves unconfirmed operational facts as variables.

## Provider references
https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates/

No real payment or outbound WhatsApp send was performed in this audit.

## Verification completed
- Production build: TypeScript and Vite passed (bundle-size advisory remains).
- Browser smoke checks: home, booking, gift wizard, store, dashboard, template library, WhatsApp desk, assignment; no page JavaScript errors.
- Booking end-to-end: wrong OTP rejected, correct preview code accepted, address error visible, saved draft and accurate dashboard.
- Missing assignment booking ID produces an empty state.
- Gift wizard required fields and draft completion passed.
- Store starts empty; item selection and checkout save a draft with no payment ID.
- All 32 templates have contiguous numbered variables, matching examples, and English language metadata.
- Mobile horizontal-overflow checks passed at 390px for booking, gift and template library.
- Browser verification blocked external requests; no customer data was sent to providers.
