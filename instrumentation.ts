export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    try {
      const { getRuntime, startWorker } = await import('./server/runtime.mjs');
      startWorker(getRuntime());
    } catch (error) {
      const { describeBackendFailure } = await import('./server/environment.mjs');
      // Public pages must remain available when the protected backend cannot start.
      console.error('Protected backend startup failed:', JSON.stringify(describeBackendFailure(error)));
    }
  }
}
