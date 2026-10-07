# Next.js protected runtime deployment

Use Node.js 24 and one persistent process. The supported entry point is **`npm start` → `node server/next.mjs`**. It runs the Next.js pages, protected API and 30-second durable queue worker together. Do not deploy this version as a static `dist` folder, use `next start` directly, or treat the SQLite/worker service as Vercel serverless-ready.

1. Confirm your hosting supports the custom entry point and permanent private disk. Keep one replica while using SQLite. If the plan cannot run it, use an appropriate Node/VPS backend before proceeding.
2. Install locked dependencies (`npm ci`) and build (`npm run build`). Set the Hostinger output directory to `.next`, build command to `npm run build`, and start command to `npm start`. Upload source/server files and `.next` according to the Node hosting workflow, not the old Vite instructions. Development output is isolated in `.next-development`. The custom `npm start` automatically uses `.next` for production. Restart any running development server after updating this configuration.
3. Configure secrets privately, outside the public document root. `.env.server` is read by the runtime; environment variables already supplied by hosting take precedence. Never upload it as a publicly downloadable file.
4. Set `APP_ORIGIN=https://www.mantrakshata.com`, `DATA_PATH` to an absolute private persistent SQLite file, and `PERSISTENT_STORAGE_CONFIRMED=true` only after a restart/persistence check. Production startup refuses to proceed without these settings. Supply hosting `PORT`/`WEB_PORT`; the default is 3201.
5. Set `SESSION_SECRET`, WhatsApp provider IDs/token, `META_APP_SECRET`, webhook verify token, `ADMIN_PHONES`, `MAIN_ACHARYA_PHONE`, Razorpay keys and approved `PACKAGE_PRICES_PAISE` (integer paise JSON). Preserve existing values privately; rotate exposed keys before release. Default empty prices intentionally prevent confirmation/payment.
6. Reverse proxy HTTPS to the Node service. If the trusted proxy supplies client IPs, configure `TRUST_PROXY=true` only after confirming its forwarding chain. No-store API responses and HttpOnly/Secure/SameSite session cookies are set by the service.
7. Configure Meta webhook URL `https://www.mantrakshata.com/api/webhooks/whatsapp`, complete verification and subscribe delivery status events. Check signatures and queue statuses on the operations page.
8. Use `/api/health` as a process check; it does not verify WhatsApp delivery, backups or payment readiness. Monitor process restarts and failed/unknown jobs separately.
9. Back up SQLite using a consistent SQLite backup method and test a restore; copying only the main database file during writes may omit WAL data. Protect backup files and define retention/access.

The deployment diagnostics report lists remaining application and business release blockers. This run did not connect to hosting or perform deployment.
