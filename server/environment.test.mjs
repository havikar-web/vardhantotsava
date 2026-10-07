import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadServerEnvironment, checkBackendConfiguration, readPriceConfiguration, describeBackendFailure } from './environment.mjs';

test('standalone runtime finds the project environment and preserves hosted variables', () => {
 const root = mkdtempSync(join(tmpdir(), 'mantrakshata-env-'));
 const cwd = join(root, '.next', 'standalone');
 const key = 'MANTRAKSHATA_TEST_ENV_SETTING';
 const previous = process.env[key];
 try {
  mkdirSync(cwd, { recursive: true });
  writeFileSync(join(root, '.env.server'), key + '=project-value\n');
  delete process.env[key];
  loadServerEnvironment(cwd);
  assert.equal(process.env[key], 'project-value');
  process.env[key] = 'hosting-value';
  loadServerEnvironment(cwd);
  assert.equal(process.env[key], 'hosting-value');
  writeFileSync(join(cwd, '.env.server'), key + '=deployed-value\n');
  delete process.env[key];
  loadServerEnvironment(cwd);
  assert.equal(process.env[key], 'deployed-value');
 } finally {
  if (previous === undefined) delete process.env[key]; else process.env[key] = previous;
  rmSync(root, { recursive: true, force: true });
 }
});

test('startup diagnostics identify missing settings without returning secret values', () => {
 const secret = 'private-test-secret-with-more-than-32-characters';
 let failure;
 try { checkBackendConfiguration({ NODE_ENV: 'production', SESSION_SECRET: secret }); }
 catch (error) { failure = describeBackendFailure(error); }
 assert.deepEqual(failure, { code: 'BACKEND_CONFIGURATION', settings: ['APP_ORIGIN', 'DATA_PATH', 'PERSISTENT_STORAGE_CONFIRMED'] });
 assert.ok(!JSON.stringify(failure).includes(secret));
 assert.doesNotThrow(() => checkBackendConfiguration({
  NODE_ENV: 'production', SESSION_SECRET: secret,
  APP_ORIGIN: 'https://deployment-test.invalid', DATA_PATH: '/private/data.sqlite',
  PERSISTENT_STORAGE_CONFIRMED: 'true'
 }));
});

test('invalid pricing and filesystem errors produce safe actionable diagnostics', () => {
 assert.throws(() => readPriceConfiguration({ GIFT_PRICES_PAISE: 'private-invalid-value' }, 'GIFT_PRICES_PAISE'), error => {
  assert.deepEqual(describeBackendFailure(error), { code: 'BACKEND_CONFIGURATION', settings: ['GIFT_PRICES_PAISE'] });
  return !error.message.includes('private-invalid-value');
 });
 const failure = describeBackendFailure(Object.assign(new Error('private-filesystem-path'), { code: 'EACCES' }));
 assert.equal(failure.code, 'BACKEND_STORAGE_OR_ENV_FILE');
 assert.ok(!JSON.stringify(failure).includes('private-filesystem-path'));
});
