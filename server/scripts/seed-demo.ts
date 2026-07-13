import { spawnSync } from 'child_process';

const result = spawnSync(process.execPath, ['--import', 'tsx', 'prisma/seed.ts'], {
  cwd: process.cwd(),
  env: { ...process.env, ALLOW_DEMO_SEED: 'true' },
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
