import { access, cp } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const standalone = resolve(root, '.next/standalone');
await access(resolve(standalone, 'server.js'));
await access(resolve(standalone, '.next/BUILD_ID'));
await cp(resolve(root, 'public'), resolve(standalone, 'public'), { recursive: true });
await cp(resolve(root, '.next/static'), resolve(standalone, '.next/static'), { recursive: true });
console.log('Standalone server, public assets and Next.js static assets are ready.');
