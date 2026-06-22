import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

/**
 * Sauvegarde quotidienne de la base (BNF3 : sauvegardes + rétention ≥ 30 j).
 * À planifier (cron / Planificateur de tâches Windows). pg_dump doit être
 * accessible : via le PATH, ou en définissant PG_DUMP_PATH.
 */
const RETENTION_DAYS = 30;
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const PG_DUMP = process.env.PG_DUMP_PATH || 'pg_dump';

const url = (process.env.DATABASE_URL || '').replace(/\?schema=.*$/, '');
if (!url) {
  console.error('DATABASE_URL manquant.');
  process.exit(1);
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = path.join(BACKUP_DIR, `csi_cnam_${stamp}.sql`);

console.log(`Sauvegarde → ${outFile}`);
const res = spawnSync(PG_DUMP, [url, '-f', outFile], { stdio: 'inherit' });
if (res.error || res.status !== 0) {
  console.error('Échec de pg_dump :', res.error?.message ?? `code ${res.status}`);
  console.error('Astuce : définir PG_DUMP_PATH (ex. "C:\\\\Program Files\\\\PostgreSQL\\\\18\\\\bin\\\\pg_dump.exe").');
  process.exit(1);
}

// Purge des sauvegardes plus anciennes que la rétention.
const limite = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
let purges = 0;
for (const f of fs.readdirSync(BACKUP_DIR)) {
  const fp = path.join(BACKUP_DIR, f);
  if (fs.statSync(fp).mtimeMs < limite) {
    fs.unlinkSync(fp);
    purges++;
  }
}
console.log(`✅ Sauvegarde terminée. ${purges} ancienne(s) sauvegarde(s) purgée(s) (> ${RETENTION_DAYS} j).`);
