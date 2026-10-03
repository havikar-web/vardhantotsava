# Payments and manual gift shipping

## Implemented flow

Local verification on 1 October 2026: 24 backend test groups, TypeScript and production build passed. Browser checks passed 20 routes and both staff-approved checkout journeys, including India Post tracking visible to the customer. Providers/Checkout were mocked; no real payments or messages were sent. The final credential scan passed for source and both development/production browser bundles.

Customers sign in with WhatsApp OTP and save a ceremony or gift request. Staff approve ceremony availability or gift stock/delivery coverage. Approval snapshots the server price. The customer then pays the full approved amount through Razorpay Checkout. The browser never supplies the payable amount.

The server verifies the checkout HMAC against its recorded Razorpay order, then fetches the payment and checks capture, amount, currency and order association. Duplicate callbacks are idempotent. A captured ceremony queues confirmation/assignment/reminders; a captured gift becomes paid. The persistent worker also polls recorded Razorpay orders to recover a missed browser callback. Signed Razorpay webhooks provide another recovery path.

Staff pack paid gifts, enter the India Post consignment number and save shipment. The customer sees the same stored tracking number in their portal. Staff manually confirm delivery after checking it. The site does not scrape India Post or claim automatic tracking/delivery updates.

Gift payment confirmation and shipment messages are queued once. They need the two approved templates below before automatic dispatch works. Staff can also use **Open WhatsApp shipment update** to compose a manual message; opening that link does not mark delivery confirmed.

## Private server configuration

Set these in hosting environment variables or the private `.env.server` file. Existing Razorpay credentials are retained server-side. No real payment/order was created during implementation tests.

```dotenv
# All-inclusive package totals in paise, using actual package IDs.
PACKAGE_PRICES_PAISE={"aarambha":0,"sampoorna":0,"parampara":0}
# Replace zero placeholders with final product amounts in paise.
GIFT_PRICES_PAISE={"sandalwood-bracelet":0,"japa-mala":0}
# Leave blank until decided. Set 0 explicitly only for free shipping/packaging.
SHIPPING_PAISE=
GIFT_BOX_PAISE=
```

All supported gift IDs/names are in `server/catalog.json`. Unknown/unpriced items cannot be paid for. Gift quantity, shipping and packaging charges are snapshotted into the approved quote. Current shipping is one fixed server-configured charge for manually approved addresses; staff must reject unsupported addresses before approval. If variable charges are needed later, add a reviewed quote mechanism before charging different rates. Updating configuration requires restarting the process; staff approval refreshes an unpaid request's quote before order creation. An existing provider order freezes its quote.

Set Razorpay automatic capture in your account. Authorized-but-uncaptured payments are not confirmed. Configure webhook URL `https://www.mantrakshata.com/api/webhooks/razorpay` with `RAZORPAY_WEBHOOK_SECRET` and events `payment.captured`, `order.paid`, `refund.created`, `refund.processed`, `refund.failed`. Razorpay's webhook secret is separate from the API key secret.

Refund initiation remains a deliberate staff action in the Razorpay dashboard until final cancellation/refund policies are supplied. Signed refund events or polling record provider-confirmed refunds; fully refunded gifts cannot be shipped, and fully refunded active ceremonies are cancelled. Partial refunds do not automatically cancel fulfilment. No cancellation button automatically moves money.

## WhatsApp without Meta delivery webhooks

Sending an approved template needs the configured WhatsApp access token and account/phone IDs. A Meta delivery webhook is **not required merely to send**. Without it, operations can show provider acceptance but cannot establish delivered/read/failed handset outcomes. OTP delivery failure and API rejection still produce errors; network ambiguity is never blindly retried. Do not call provider acceptance “delivered”. Keep the optional signed Meta webhook endpoint for later use.

### Additional utility templates to submit

**`mantrakshata_gift_order_confirmed`** — English — four body parameters:

> Namaskara {{1}}, payment of INR {{4}} has been received for your Mantrakshata gift order #{{2}} for {{3}}. We are preparing your selected gifts. Your India Post tracking number will be shared after dispatch. Thank you.

Parameters: customer name, gift order ID, recipient name, paid total in rupees.

**`mantrakshata_gift_shipped`** — English — five body parameters:

> Namaskara {{1}}, your Mantrakshata gift order #{{2}} for {{3}} has been shipped through India Post. Consignment number: {{4}}. Track your shipment here: {{5}}. Thank you.

Parameters: customer name, gift order ID, recipient name, India Post number, official tracking-site URL. No buttons required for either draft. Draft category is Utility; Meta approval determines actual eligibility. The original next-day follow-up template also remains pending creation/approval.

## Launch checks still needed

Supply final all-inclusive prices/shipping, coordinator details and policies. Confirm hosting runs Node 24 continuously with private persistent disk; your hosting confirmation is accepted, but HTTPS/restart/persistence checks still need deployment evidence. Configure provider dashboard capture/webhooks and perform supervised Razorpay test-mode and live handset tests. Rotate previously exposed credentials before release. The local mock tests establish implementation behavior, not live settlement or handset delivery.

Implementation follows [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/) and [Razorpay webhook validation](https://github.com/razorpay/markdown-docs/blob/master/webhooks/validate-test.md).

Delivery status reference: [Meta WhatsApp status objects](https://www.postman.com/meta/whatsapp-business-platform/folder/fuaee8l/statuses-object).
