export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      const { getRuntime, startWorker } = await import('./server/runtime.mjs');
      startWorker(getRuntime());
    } catch {
      // Public pages must remain available when the protected backend cannot start.
      console.error('Protected backend unavailable. Check APP_ORIGIN (HTTPS), DATA_PATH (writable persistent storage), PERSISTENT_STORAGE_CONFIRMED, SESSION_SECRET and pricing JSON. Public pages remain available; backend readiness is reported by /api/health.');
    }
  }
}
