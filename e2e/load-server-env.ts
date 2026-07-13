import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadServerEnvironment() {
  const envFile = resolve(process.cwd(), 'server', '.env');
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}
