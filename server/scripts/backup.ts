import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

/** Sauvegarde locale au format PostgreSQL custom, vérifiable par checksum. */
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 30);
const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(process.cwd(), 'backups'));
const pgDump = process.env.PG_DUMP_PATH || 'pg_dump';
const configuredDatabaseUrl = process.env.DATABASE_URL || '';

if (!configuredDatabaseUrl) {
  console.error('DATABASE_URL manquant.');
  process.exit(1);
}

const parsedDatabaseUrl = new URL(configuredDatabaseUrl);
parsedDatabaseUrl.search = '';
parsedDatabaseUrl.hash = '';
const databaseUrl = parsedDatabaseUrl.toString();
if (!Number.isInteger(retentionDays) || retentionDays < 30) {
  console.error('BACKUP_RETENTION_DAYS doit être un entier supérieur ou égal à 30.');
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = path.join(backupDir, `csi_cnam_${stamp}.dump`);

console.log(`Sauvegarde → ${outFile}`);
const result = spawnSync(pgDump, [
  databaseUrl,
  '--format=custom',
  '--no-owner',
  '--no-privileges',
  '--file',
  outFile,
], { stdio: 'inherit' });

if (result.error || result.status !== 0) {
  fs.rmSync(outFile, { force: true });
  console.error('Échec de pg_dump :', result.error?.message ?? `code ${result.status}`);
  process.exit(1);
}

const checksum = crypto.createHash('sha256').update(fs.readFileSync(outFile)).digest('hex');
fs.writeFileSync(`${outFile}.sha256`, `${checksum}  ${path.basename(outFile)}\n`, { encoding: 'utf8', mode: 0o600 });

const limit = Date.now() - retentionDays * 24 * 60 * 60 * 1_000;
let purged = 0;
for (const filename of fs.readdirSync(backupDir)) {
  if (!/^csi_cnam_.*\.dump(?:\.sha256)?$/.test(filename)) continue;
  const filePath = path.join(backupDir, filename);
  if (fs.statSync(filePath).mtimeMs < limit) {
    fs.rmSync(filePath, { force: true });
    purged++;
  }
}

console.log(`Sauvegarde terminée et checksum créé. ${purged} ancien(s) fichier(s) purgé(s).`);
