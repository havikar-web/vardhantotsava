import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createService } from './core.mjs';
import { createHttp } from './http.mjs';
import { cashfreeProvider } from './provider.mjs';

function setup() {
  let clock = Date.parse('2026-10-01T00:00:00Z'), sent = [];
  const service = createService({
    database: ':memory:',
    secret: 'hardening'.repeat(7),
    now: () => clock,
    adminPhones: ['919876543210'],
    prices: { basic: 10000 },
    origin: 'http://localhost',
    send: async (to, kind, args) => {
      sent.push({ to, kind, args });
      return { id: 'test-' + sent.length };
    },
    verifyPayment: async id => ({ id, status: 'captured', currency: 'INR', amount: 10000, notes: {} })
  });
  return { service, sent, advance: ms => clock += ms };
}

test('Health endpoint returns healthy status and metadata', async () => {
  const x = setup();
  const server = createHttp(x.service, { origin: 'http://localhost', secure: false });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const root = 'http://127.0.0.1:' + server.address().port;
  try {
    const res = await fetch(root + '/api/health');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
  } finally {
    await new Promise(r => server.close(r));
    x.service.db.close();
  }
});

test('WhatsApp parameters reject newlines and strip duplicate IST', () => {
  const sanitize = (val) => String(val || '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const rawAddress = "Line 1\nLine 2\r\nCity, 560001\tNear Temple";
  const cleaned = sanitize(rawAddress);
  assert.equal(cleaned.includes('\n'), false);
  assert.equal(cleaned.includes('\r'), false);
  assert.equal(cleaned.includes('\t'), false);
  assert.equal(cleaned, "Line 1 Line 2 City, 560001 Near Temple");

  const rawSlot = "09:00 AM IST";
  const strippedSlot = rawSlot.replace(/\s*IST\s*$/i, '').trim();
  assert.equal(strippedSlot, "09:00 AM");
});

test('Rate limiting enforces attempt restrictions on OTP requests', async () => {
  const x = setup();
  // First request succeeds
  const res1 = await x.service.requestOtp('9123456789', 'client-ip');
  assert.ok(res1.challengeId);

  // Immediate second request from same phone triggers 429
  await assert.rejects(
    () => x.service.requestOtp('9123456789', 'client-ip'),
    (err) => err.status === 429
  );
  x.service.db.close();
});

test('Cashfree provider formats requests and normalizes responses properly', async () => {
  let capturedHeaders, capturedBody;
  const mockFetcher = async (url, opts) => {
    capturedHeaders = opts.headers;
    capturedBody = opts.body ? JSON.parse(opts.body) : null;
    if (url.endsWith('/orders')) {
      return {
        ok: true,
        json: async () => ({
          cf_order_id: 998877,
          order_id: capturedBody.order_id,
          order_amount: capturedBody.order_amount,
          order_currency: 'INR',
          order_status: 'ACTIVE',
          payment_session_id: 'session_cf_xyz123'
        })
      };
    }
    if (url.includes('/payments')) {
      return {
        ok: true,
        json: async () => ([
          {
            cf_payment_id: 112233,
            order_id: 'PO-TEST',
            payment_amount: 100.00,
            payment_currency: 'INR',
            payment_status: 'SUCCESS',
            payment_group: 'upi'
          }
        ])
      };
    }
    return { ok: true, json: async () => ({}) };
  };

  const cf = cashfreeProvider({
    CASHFREE_APP_ID: 'cf_test_app',
    CASHFREE_SECRET_KEY: 'cf_test_secret',
    CASHFREE_ENV: 'sandbox',
    CASHFREE_API_VERSION: '2023-08-01'
  }, mockFetcher);

  const orderRes = await cf.createOrder({
    amount: 10000,
    currency: 'INR',
    receipt: 'PO-TEST',
    customer: { name: 'Ramesh', phone: '919876543210', email: 'ramesh@example.com' },
    notes: { target_id: 'BK-1', target_kind: 'booking' }
  });

  assert.equal(orderRes.id, 'PO-TEST');
  assert.equal(orderRes.payment_session_id, 'session_cf_xyz123');
  assert.equal(orderRes.amount, 10000);
  assert.equal(capturedBody.order_amount, 100);
  assert.equal(capturedBody.customer_details.customer_phone, '9876543210');
  assert.equal(capturedHeaders['x-client-id'], 'cf_test_app');
  assert.equal(capturedHeaders['x-client-secret'], 'cf_test_secret');
  assert.equal(capturedHeaders['x-api-version'], '2023-08-01');

  const paymentsRes = await cf.orderPayments('PO-TEST');
  assert.equal(paymentsRes.items.length, 1);
  assert.equal(paymentsRes.items[0].id, '112233');
  assert.equal(paymentsRes.items[0].status, 'captured');
  assert.equal(paymentsRes.items[0].amount, 10000);
});

test('Cashfree webhook signature is verified with timestamp and body HMAC; forged requests rejected', async () => {
  const x = setup();
  const secretKey = 'cf_webhook_secret_key_123';
  let capturedEvent = null;
  x.service.commerce = {
    webhook: async (event, id) => {
      capturedEvent = { event, id };
      return { ok: true };
    }
  };

  const server = createHttp(x.service, {
    origin: 'http://localhost',
    secure: false,
    cashfreeSecretKey: secretKey
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const root = 'http://127.0.0.1:' + server.address().port;

  try {
    const timestamp = '1728000000';
    const bodyObj = {
      data: {
        order: { order_id: 'PO-123', order_amount: 150.00 },
        payment: { cf_payment_id: 888999, payment_status: 'SUCCESS', payment_amount: 150.00 }
      },
      type: 'PAYMENT_SUCCESS_WEBHOOK'
    };
    const rawBody = JSON.stringify(bodyObj);

    // 1. Missing signature returns 403
    const resNoSig = await fetch(root + '/api/webhooks/cashfree', {
      method: 'POST',
      body: rawBody
    });
    assert.equal(resNoSig.status, 403);

    // 2. Bad signature returns 403
    const resBadSig = await fetch(root + '/api/webhooks/cashfree', {
      method: 'POST',
      headers: {
        'x-webhook-timestamp': timestamp,
        'x-webhook-signature': 'invalid_signature_base64=='
      },
      body: rawBody
    });
    assert.equal(resBadSig.status, 403);

    // 3. Valid HMAC-SHA256 Base64 signature returns 200
    const validSignature = createHmac('sha256', secretKey)
      .update(timestamp + rawBody)
      .digest('base64');

    const resValid = await fetch(root + '/api/webhooks/cashfree', {
      method: 'POST',
      headers: {
        'x-webhook-timestamp': timestamp,
        'x-webhook-signature': validSignature
      },
      body: rawBody
    });
    assert.equal(resValid.status, 200);
    const data = await resValid.json();
    assert.equal(data.ok, true);
    assert.equal(capturedEvent.id, '888999');
    assert.equal(capturedEvent.event.type, 'PAYMENT_SUCCESS_WEBHOOK');
  } finally {
    await new Promise(r => server.close(r));
    x.service.db.close();
  }
});

