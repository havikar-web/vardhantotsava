import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { setTimeout as delay } from 'node:timers/promises';

const source = resolve(import.meta.dirname, '../.next/standalone');
const withoutBackend = process.argv.includes('--without-backend');
const temporary = await mkdtemp(join(tmpdir(), 'mantrakshata-deployment-'));
const application = join(temporary, 'app');
let child;
let database;
let logs = '';
try {
  // Run outside the repository so missing packaged files cannot resolve from it.
  await cp(source, application, {
    recursive: true,
    dereference: true,
    filter: path => !basename(path).startsWith('.env'),
  });
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise(resolveClose => socket.close(resolveClose));
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    /^(path|systemroot|windir|temp|tmp|home|userprofile)$/i.test(key)));
  Object.assign(env, {
    NODE_ENV: 'production', PORT: String(port), HOSTNAME: '127.0.0.1',
  });
  if (!withoutBackend) Object.assign(env, {
    APP_ORIGIN: 'https://deployment-test.invalid',
    DATA_PATH: join(temporary, 'test.sqlite'),
    PERSISTENT_STORAGE_CONFIRMED: 'true',
    SESSION_SECRET: 'isolated-deployment-test-secret-at-least-32-characters',
  });
  child = spawn(process.execPath, ['server.js'], { cwd: application, env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => { logs = (logs + chunk).slice(-8000); });
  child.stderr.on('data', chunk => { logs = (logs + chunk).slice(-8000); });
  const base = `http://127.0.0.1:${port}`;
  console.log(`Checking packaged website at ${base} (${withoutBackend ? 'backend unconfigured' : 'backend configured'}).`);
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    assert.equal(child.exitCode, null, 'Packaged server exited');
    assert.ok(!logs.includes('Failed to prepare server'), 'Packaged server initialization failed');
    try {
      const response = await fetch(base + '/', { signal: AbortSignal.timeout(2000) });
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(250);
  }
  assert.ok(ready, 'Packaged server did not become healthy');
  const home = await fetch(base);
  assert.equal(home.status, 200);
  const html = await home.text();
  const script = html.match(/src="([^" ]*\/_next\/static\/[^" ]+\.js)"/);
  assert.ok(script, 'Home page must reference a Next.js JavaScript asset');
  assert.equal((await fetch(new URL(script[1], base))).status, 200);
  assert.equal((await fetch(base + '/assets/official-logo.webp')).status, 200);
  if (withoutBackend) {
    assert.equal((await fetch(base + '/about')).status, 200);
    assert.equal((await fetch(base + '/book')).status, 200);
    const health = await fetch(base + '/api/health');
    assert.equal(health.status, 503);
    assert.equal((await health.json()).status, 'degraded');
    const protectedResponse = await fetch(base + '/api/bookings');
    assert.equal(protectedResponse.status, 503);
    assert.match((await protectedResponse.json()).error, /unavailable/i);
    console.log('Unconfigured deployment passed: public pages and assets load; backend health and protected APIs return 503.');
  } else {
  const health = await fetch(base + '/api/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);
  assert.equal((await fetch(base + '/api/bookings')).status, 401);
  assert.equal((await fetch(base + '/api/settings')).status, 401);
  assert.equal((await fetch(base + '/api/webhooks/cashfree', { method: 'POST', body: '{}' })).status, 403);
  // An expired session is removed by the real 30-second worker without contacting providers.
  database = new DatabaseSync(env.DATA_PATH);
  database.prepare('INSERT INTO sessions(hash,phone,expires) VALUES(?,?,?)').run('deployment-test', '919999999999', 1);
  const deadline = Date.now() + 40000;
  while (database.prepare('SELECT 1 FROM sessions WHERE hash=?').get('deployment-test') && Date.now() < deadline) {
    await delay(500);
  }
  assert.equal(database.prepare('SELECT 1 FROM sessions WHERE hash=?').get('deployment-test'), undefined,
    'Standalone startup must run the background worker');
  console.log('Isolated standalone deployment passed: startup, page, JavaScript, image, protected APIs, webhook rejection and background worker.');
  }
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  database?.close();
  if (child && child.exitCode === null) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
  // temporary is the unique directory created above; never remove the source package.
  assert.equal(resolve(temporary).startsWith(resolve(tmpdir()) + (process.platform === 'win32' ? '\\' : '/')), true);
  await rm(temporary, { recursive: true, force: true });
}
