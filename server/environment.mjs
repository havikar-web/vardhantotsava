import { basename, dirname, resolve } from 'node:path';

export function loadServerEnvironment(cwd = process.cwd()) {
 const candidates = [resolve(cwd, '.env.server'), resolve(cwd, '.env.production'), resolve(cwd, '.env')];
 // The generated Next.js server changes cwd to .next/standalone.
 if (basename(cwd) === 'standalone' && basename(dirname(cwd)) === '.next') {
  candidates.push(resolve(cwd, '../..', '.env.server'), resolve(cwd, '../..', '.env.production'), resolve(cwd, '../..', '.env'));
 }
 for (const file of candidates) {
  try { process.loadEnvFile(file); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
 }
}

export class BackendConfigurationError extends Error {
 constructor(settings) {
  super('Check server settings: ' + settings.join(', '));
  this.settings = settings;
 }
}

export function checkBackendConfiguration(env) {
 const missing = [];
 if (env.NODE_ENV === 'production') {
  try {
   const origin = new URL(env.APP_ORIGIN || '');
   if (origin.protocol !== 'https:' || origin.origin !== env.APP_ORIGIN) missing.push('APP_ORIGIN');
  } catch { missing.push('APP_ORIGIN'); }
  if (!env.DATA_PATH) missing.push('DATA_PATH');
  if (env.PERSISTENT_STORAGE_CONFIRMED !== 'true') missing.push('PERSISTENT_STORAGE_CONFIRMED');
 }
 if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) missing.push('SESSION_SECRET');
 if (missing.length) throw new BackendConfigurationError(missing);
}

export function readPriceConfiguration(env, key) {
 try {
  const value = JSON.parse(env[key] || '{}');
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error();
  return value;
 } catch { throw new BackendConfigurationError([key]); }
}

export function describeBackendFailure(error) {
 if (error instanceof BackendConfigurationError) {
  return { code: 'BACKEND_CONFIGURATION', settings: error.settings };
 }
 if (['EACCES', 'EPERM', 'EROFS', 'ENOENT', 'ENOTDIR', 'EEXIST', 'ERR_SQLITE_ERROR'].includes(error?.code)) {
  return { code: 'BACKEND_STORAGE_OR_ENV_FILE', settings: ['DATA_PATH', '.env.server permissions'] };
 }
 return { code: 'BACKEND_INITIALIZATION_FAILED', settings: [] };
}
