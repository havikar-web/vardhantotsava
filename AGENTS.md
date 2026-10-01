# Project: Mantrakshata

## What this product does
Mantrakshata is a sacred Vedic ritual and Vardhantotsava booking platform. It connects families with certified Havikar purohits, automated Panchanga Muhurta calculations, auspicious gift hampers, and end-to-end WhatsApp notifications for ceremony coordination.

## Stack
- Frontend: Next.js 15 (App Router) + React 18 + Tailwind CSS + Lucide Icons + Framer Motion
- Backend: Next.js API Routes / Node.js Server (`server/http.mjs`, `server/core.mjs`, `server/runtime.mjs`)
- Database: Cloud PostgreSQL via Neon Serverless (`@neondatabase/serverless`) + SQLite operational store
- Auth: Passwordless phone authentication via Meta WhatsApp Cloud API OTP (`hav_otp1`) with HttpOnly session cookies
- Payments: Razorpay Payment Gateway with cryptographic HMAC-SHA256 signature verification
- Notifications: Meta WhatsApp Business Cloud API with pre-approved bilingual templates
- Hosting: Hostinger Node.js Web App with SSL at `https://www.mantrakshata.com`

## Sacred Design & Architecture Rules
- Strictly ZERO EMOJIS in UI, code, comments, logs, and documentation. Always use Lucide icons.
- Never commit secrets. All secrets reside in server-side environment variables.
- Database queries must always be parameterized using tagged SQL template literals.
- All payment callbacks must verify HMAC-SHA256 signatures before updating booking or gift status.
- WhatsApp message parameters must be strictly sanitized: strip all newlines (`\n`, `\r`), tabs (`\t`), multiple spaces, and duplicate "IST" strings to comply with Meta Graph API rules.
- Maintain role isolation: Customer Portal (`/portal`), Pandit Panel (`/pandit`), Acharya Assignment (`/assign`), and Admin Dashboard (`/admin`).
- Continuous verification: all changes must pass TypeScript validation (`npx tsc --noEmit`), server tests (`npm test`), and production build (`npm run build`).
