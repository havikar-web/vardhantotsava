# Mantrakshata — Launch readiness assessment

27 September 2026 · Local project: D:\HAVIKAR\mantrakshata-website - Copy

## Verdict

**Not ready to accept real paid bookings. Approximately 40% production-launch readiness (weighted rubric: 37.25/100).** The frontend is a useful demonstration; the transaction and operations backend is unfinished. The percentage is an engineering judgement of scope completion, not an automated test score, security certification, or forecast of remaining effort. Critical blockers override the numerical score.

| Area | Weight | Estimated completion | Weighted points |
|---|---:|---:|---:|
| Public frontend and content | 20 | 85% | 17.00 |
| Local booking/gifting journeys | 15 | 70% | 10.50 |
| Identity, ownership and persistence | 20 | 10% | 2.00 |
| Payments and financial state | 15 | 5% | 0.75 |
| WhatsApp and scheduled lifecycle | 15 | 20% | 3.00 |
| Operations and customer truthfulness | 10 | 20% | 2.00 |
| Release hygiene and observability | 5 | 40% | 2.00 |
| Total | 100 | | 37.25 |

Frontend credit reflects rendered pages, responsive public layouts and reusable forms. Local-flow credit does not mean data survives across devices. Backend/payment scores credit defined types and boundaries, not live integration. Messaging credit is for prepared content; scheduling and delivery are absent. Build/advisory checks provide some release credit, but production hosting and monitoring were not verified.

## Fresh evidence

- TypeScript + Vite production build: PASS. JavaScript main bundle 816.91 kB / 232.19 kB gzip; build emits its >500 kB advisory.
- npm audit: zero reported vulnerabilities in this scan. This checks known package advisories, not application security.
- Browser scan: 16 routes/states at 1440×900 and 390×844 (32 checks); zero JavaScript page errors. The local-image probe found no completed broken images; this is not proof all lazy images loaded.
- Mobile horizontal overflow: found on /admin/whatsapp. Other scanned states did not overflow.
- Automated label probe: 7 unassociated controls on initial booking step, 5 on gift step, 5 on homepage; a visual label is not necessarily an accessible label. Counts are heuristic, not a complete accessibility audit.
- Fresh booking regression: incorrect OTP rejected; correct preview code accepted; address error visible; draft saved; draft dashboard accurate; unknown assignment ID shows Booking not found.
- Fresh gift regression: required-field gate and draft completion pass; mobile booking/gift/template library have no horizontal overflow.
- Store checkout draft regression passed in the preceding repair session; it was not re-run in this scan.
- Fresh dependency and build checks passed. Earlier bundle scan found no database URI or VITE_WHATSAPP_TOKEN reference; secret rotation itself remains unverified.

Browser external requests were deliberately blocked during this scan. It did not validate live Photon availability, Google Fonts, Razorpay, Meta, production DNS/TLS, or provider delivery. Local code defines a disabled database adapter and disabled WhatsApp sender; there is no live server boundary to verify beyond the frontend. No real payment or outbound message was attempted.

## Findings ordered by launch impact

| ID / priority | Finding and evidence | Required resolution |
|---|---|---|
| L01 / P0 | No durable booking/account backend. src/lib/db.ts returns unavailable/false; store.ts persists to localStorage. Clearing browser data loses drafts; another device cannot retrieve them. | Authenticated API, database, ownership checks, backups and error propagation |
| L02 / P0 | OTP is explicitly demo-only. flowValidation.ts generates and stores the challenge in sessionStorage and UI displays it. It cannot prove phone ownership. | Server OTP with real approved hav_otp1, limits and secure session |
| L03 / P0 | Admin and assignment routes have no production access control. App.tsx renders them directly; AdminDashboardPage permits local status changes. Current impact is local preview data, but this design must not be connected to live data. | Server-enforced roles and permissions on every action |
| L04 / P0 | No verified payment flow. Booking/store save drafts; no authoritative server order, signature/capture processing or refund engine. | Payment integration and idempotent verified transitions; never confirm from browser callback alone |
| L05 / P0 | Nine-message flow is content, not automation. dispatchMetaCloudTemplate returns an error; no durable scheduler/outbox/webhook pipeline. hav_otp1 awaits the user template. | Provider approval/configuration, event binding, scheduler, retries and delivery reporting |
| L06 / P0 | Previously exposed database credentials were removed from frontend use, but revocation is unverified. | Rotate/revoke old keys; verify deployment history and new server-only secrets |
| L07 / P1 | Non-draft dashboard still selects ACHARYA_SCHOLARS[0] and marks milestones complete statically (DashboardPage.tsx). Draft guard fixes only draft display. | Read actual assignment and event states; remove fabricated arrival/livestream/chat claims |
| L08 / P1 | Preview message helpers do not fully match new nine-message templates. whatsapp.ts retains default OTP 1008 in a draft helper and hardcoded 8:00/8:30 reminder times. | Single event/template renderer using real booking data; remove legacy simulation defaults before live enablement |
| L09 / P1 | saveBooking catches storage errors without returning failure; UI can continue to success. | Propagate persistence result and keep user inputs on failure; production API errors must block success |
| L10 / P1 | Footer Privacy/Terms/Cancellation buttons route to /faqs; Contact and WhatsApp icon use different numbers; Instagram is generic. | Publish actual business-approved policies and one verified contact configuration |
| L11 / P1 | Birthplace search is broad but service coverage is Bengaluru. Placeholder content and operational details need owner review. | Explain the distinction; approve packages, service areas, delivery and actual scholar directory |
| L12 / P1 | Form label associations incomplete; WhatsApp admin mobile overflow; screenshot shows hero content extends below the initial mobile viewport. | Accessible labels and responsive operations UI; natural mobile scroll rather than clipped fixed-height sections |
| L13 / P2 | Template library says 32 drafts but current JSON contains 34 entries: nine core entries including pending OTP plus 25 optional templates. | Derive displayed count from data and clearly distinguish pending OTP from submit-ready drafts |
| L14 / P2 | Unknown routes render homepage instead of a not-found state; several page titles use generic fallback; no top-level public sitemap/robots found. | Real 404, route metadata and deliberate indexing/deep-link configuration |
| L15 / P1 | Production hosting, alerts, restore, consent handling and exception operations are not evidenced. | Staging/pilot checklist, monitored deployment and tested recovery |
| L16 / P2 | Large initial JS bundle; third-party payment script loads globally though live payments are disabled. | Route split/admin lazy loading; load checkout only when needed; measure deployed performance |

P0 blocks real booking launch. P1 must be resolved or explicitly scoped out before the relevant feature launches. P2 improves quality but does not replace P0 work.

## Immediate sequence to launch

1. Confirm business number, hav_otp1, package/coverage facts and policies. Establish server/database and roles; rotate old credentials.
2. Complete identity, persistent bookings, payment verification and accurate assignment/customer status.
3. Wire the nine-message sequence with schedule-change/cancellation handling and provider delivery events.
4. Fix the recorded accessibility/content/mobile issues; verify staging success and failure journeys; deploy a supervised pilot with monitoring.

A private stakeholder demo can run now with the preview banner and synthetic data. A public paid-booking release should wait. A brochure-only launch would be a separate reduced scope requiring removal/locking of unfinished transactional and admin flows plus verified contact/policy content.

## Deliverables

- MANTRAKSHATA-PRD.md: target scope, roles, requirements, data/state model, exact nine-message lifecycle and release acceptance criteria.
- launch-scan-results.json: raw route/layout/label probe results.
- launch-home-1440.png and launch-home-390.png: local first-viewport screenshots. External fonts were blocked in the scan, so typography is not a final production visual judgement.

This scan did not change application source or attempt to fix the listed findings.
