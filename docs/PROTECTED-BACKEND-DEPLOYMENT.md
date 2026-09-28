# Protected backend and reminders — implementation / deployment

28 September 2026 · Mantrakshata

## Implemented

- Real server-issued six-digit WhatsApp OTP. No code is returned by the API or displayed by the frontend. OTP values are HMAC-hashed using a private secret, expire after 10 minutes and are single-use with five verification attempts. Resend and phone/IP hourly limits are persisted.
- Meta approval/language/parameter checks before dispatch. Uses the existing hav_otp1 (observed approved, en_US, four body variables and dynamic URL button). No fallback sample values or invented provider message IDs.
- Random opaque 24-hour sessions stored hashed in the database. HTTP-only, SameSite=Strict cookies; Secure and __Host- prefix on HTTPS. Logout invalidates the server session. Mutation routes enforce exact Origin and JSON content type.
- Server-verified customer identity, ownership checks, and staff roles derived from ADMIN_PHONES. Browser localStorage roles, profile flags and booking status cannot grant API privileges.
- Authenticated profile/consent creation and persistent ceremony requests. Final price comes from server configuration; client prices are ignored. Bengaluru address checks and at least 48 hours' notice. Time is explicitly Asia/Kolkata (+05:30).
- Staff confirmation checks a captured Razorpay payment against currency, server price and booking_id in payment notes. It does not trust a client callback. This is a verification endpoint, not a complete customer checkout/order-creation integration.
- Staff assignment accepts a different Pandit name/number/arrival for each booking. Assignment sends customer and Pandit lifecycle jobs. Main Acharya notification uses the booking-specific URL button.
- Durable reminder queue: 24h, 2h, and 10 AM IST next day after recorded completion. Next-day feedback and catalogue welcome respect optional marketing consent. Schedule changes cancel obsolete jobs; cancellations suppress reminders. Job IDs deduplicate lifecycle events.
- Provider failures visible to staff; bounded retry for explicitly rate-limited responses. Timeouts/crash-in-flight are marked unknown and are not blindly retried. Exactly-once external delivery cannot be guaranteed across provider/network failures. Staff must inspect provider status before retrying unknown outcomes.
- Signed Meta delivery webhook handler and message-ID status records. Admin queue shows provider delivery status where available.
- New protected frontend for /book, /dashboard, /admin, assignment, WhatsApp operations and the account panel. Old local admin/booking screens are no longer routed for these operations.
- Existing credentials preserved in ignored .env.server. Browser credential accessors and direct database/Meta dispatch removed. Existing Neon URL remains preserved but is not the new active database.

## Current database choice and deployment boundary

This implementation uses Node 24's built-in SQLite module (experimental in the tested Node 24.13 runtime) with WAL, transactions, and a single Node application/worker. Tests cover file persistence and restart. **Use a private persistent disk, one app instance and one worker.** This is not designed for ephemeral serverless storage or multiple independent app replicas.

Hostinger's current documentation says Cloud plans support Node.js apps:
https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/

That does not confirm the exact storage lifecycle of this account. Before launch, confirm that DATA_PATH survives app restarts AND redeployment, is outside public files, supports SQLite WAL, and is backed up. If Hostinger only provides ephemeral app storage, do not deploy this database there; use a persistent-volume host or implement a managed PostgreSQL adapter (the preserved Neon connection is available for that future migration). Never set PERSISTENT_STORAGE_CONFIRMED=true just to bypass the guard.

Production startup refuses an HTTP origin or missing persistent-storage confirmation. Database snapshots/restore, provider delivery, and the actual Hostinger deployment have not been tested here.

## Run locally

Node 24 required. In two terminals, from the website directory:

```text
npm run dev:api
npm run dev
```

Website: http://127.0.0.1:3201. Vite proxies /api to 127.0.0.1:3202. APP_ORIGIN must match the browser URL exactly. Existing credentials were migrated without printing them; .env.server is private and ignored. Do not copy it into public_html or a downloadable ZIP.

The API sends real messages when someone deliberately requests an OTP through the connected UI. Automated tests use an injected mock provider and synthetic data; no real OTP/customer message was sent during testing.

## Hostinger configuration

Use hPanel's Node.js Web App deployment, not static-file-only hosting. Choose Node 24, build command `npm run build`, start command `npm start`. The server serves dist and /api from the same origin, uses Hostinger's PORT when supplied, and requires API_HOST=0.0.0.0 for hosted operation. Set NODE_ENV=production.

Configure privately using .env.server.example as a field list:

| Variable | Purpose |
|---|---|
| APP_ORIGIN | https://www.mantrakshata.com (exact canonical origin; redirect other hostname) |
| SESSION_SECRET | Generated high-entropy secret, at least 32 characters; persistent across restarts |
| DATA_PATH | Absolute private persistent database file path |
| PERSISTENT_STORAGE_CONFIRMED | true only after the storage/restore checks above |
| API_HOST | 0.0.0.0 on Hostinger |
| WHATSAPP_TOKEN / PHONE_NUMBER_ID / WABA_ID | Existing values have been preserved in local server configuration |
| META_API_VERSION | v23.0 used in the successful read-only metadata check |
| META_APP_SECRET | Needed for webhook HMAC verification; still requires configuration |
| WHATSAPP_VERIFY_TOKEN | Generated private challenge token for webhook setup |
| ADMIN_PHONES | Comma-separated authorised staff numbers including 91; verify current list with owner |
| MAIN_ACHARYA_PHONE | Main Acharya's actual opted-in number; currently not guessed/configured |
| PACKAGE_PRICES_PAISE | JSON map of package IDs to integer paise; empty until prices finalised |
| RAZORPAY_KEY_ID / KEY_SECRET | Preserved existing values; server-only |
| TRUST_PROXY | false by default; enable only with a verified controlled proxy that overwrites forwarding headers |

Staff access is granted by server environment, never a UI toggle. Staff then log in using their own WhatsApp OTP. First verify that ADMIN_PHONES contains only the intended people.

## Meta setup and live findings

Read-only provider check performed with the existing credentials; token values were not printed. Results on 28 September:

| Template | Observed state |
|---|---|
| hav_otp1 | APPROVED, en_US |
| mantrakshata_welcome_catalog | APPROVED, en |
| mantrakshata_booking_confirmed | APPROVED, en |
| mantrakshata_main_acharya_assignment | APPROVED, en; dynamic URL |
| mantrakshata_pandit_booking_details | APPROVED, en; 11 body variables |
| mantrakshata_customer_pandit_details | PENDING |
| mantrakshata_reminder_1day | PENDING |
| mantrakshata_reminder_2hours | PENDING |
| mantrakshata_next_day_followup | Not found in the returned provider listing; confirm/create it before use |

Provider adapter rechecks approval and parameter shape. After approvals, staff can retry failed jobs that are still within their deadline. Confirm the actual approved dynamic URL points to this production domain and path; a working suffix cannot correct an approved wrong base URL.

After HTTPS deployment, configure Meta callback:
`https://www.mantrakshata.com/api/webhooks/whatsapp`
Use the server WHATSAPP_VERIFY_TOKEN, set META_APP_SECRET, and subscribe the WhatsApp messages field. Verify delivery/read/failure events using agreed test numbers. Signed webhooks update delivery records but do not confirm payments.

## Tests completed

- Seven server test groups: OTP secrecy/hash/attempt limits/cooldown/expiry; session/logout; customer ownership and roles; authoritative price/lead time; confirmation and reschedule jobs; persistent database restart and timed reminder sends; cancellation/ambiguous timeout behavior; HTTP origin/session/webhook rejection.
- Browser against the real HTTP API with an injected mock sender: wrong code rejected; OTP login; profile registration; server booking saved/reloaded; staff access denied; HTTP-only cookie inaccessible to JavaScript; logout; 390px layout; no page errors.
- TypeScript/Vite build passed before the final queue-retry UI change; final build is part of handoff.
- Built JavaScript scan: no PostgreSQL URI, long Meta token pattern, graph.facebook.com dispatch URL or demo OTP storage key found.

## Still required before public paid bookings

1. Complete hPanel deployment and verify private persistent storage and single-instance worker uptime/restart. Interval worker checks due jobs every 30 seconds while the app runs; it cannot deliver while the host is stopped. Alert on downtime and missed/expired jobs.
2. Supply final prices, Main Acharya number, shipping/policies; validate staff phone allowlist. Full customer Razorpay order creation/checkout and refunds remain separate unfinished work; confirmation currently requires an independently captured, correctly tagged payment.
3. Finish pending Meta approvals/next-day template and webhook configuration; test actual delivery with agreed recipient numbers. Provider metadata approval is not a delivery test.
4. Rotate previously exposed credentials before public release. Moving them server-side does not undo prior exposure.
5. Gifts/family legacy local data have not been migrated to the protected store. Do not treat old local profiles/bookings as trusted server records. Gift fulfilment backend is not enabled.
6. Backups/restore, monitoring, pricing/availability operations and final production security review. Confirmation still requires the staff operator to verify availability; automated calendar conflict detection is not implemented.

No public deployment, real payment, or real customer-message test was performed. The work is implemented and locally verified, not yet certified live.
