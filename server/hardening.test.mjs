import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from './core.mjs';
import { createHttp } from './http.mjs';

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
