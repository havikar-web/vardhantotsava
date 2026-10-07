import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  let backendReady = false;
  let backendFailure: { code: string; settings: string[] } | undefined;
  try {
    const { getRuntime, startWorker } = await import('../../../server/runtime.mjs');
    startWorker(getRuntime());
    backendReady = true;
  } catch (error) {
    const { describeBackendFailure } = await import('../../../server/environment.mjs');
    backendFailure = describeBackendFailure(error);
  }
  const memory = process.memoryUsage();
  return NextResponse.json({
    ok: backendReady,
    status: backendReady ? 'healthy' : 'degraded',
    ...(backendFailure ? { backend: backendFailure } : {}),
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: '1.0.0',
    service: 'mantrakshata-production',
    system: {
      memoryUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      memoryTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
      nodeVersion: process.version,
    },
  }, {
    status: backendReady ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
