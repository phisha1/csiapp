import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(process.cwd(), 'backups'));
const requested = process.argv[2];
const backupFile = requested
  ? path.resolve(requested)
  : fs.readdirSync(backupDir)
      .filter((name) => /^csi_cnam_.*\.dump$/.test(name))
      .map((name) => path.join(backupDir, name))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];

if (!backupFile || !fs.existsSync(backupFile)) {
  console.error('Aucune sauvegarde .dump à vérifier.');
  process.exit(1);
}

const checksumFile = `${backupFile}.sha256`;
if (!fs.existsSync(checksumFile)) {
  console.error(`Checksum manquant : ${checksumFile}`);
  process.exit(1);
}

const expected = fs.readFileSync(checksumFile, 'utf8').trim().split(/\s+/)[0];
const actual = crypto.createHash('sha256').update(fs.readFileSync(backupFile)).digest('hex');
if (!expected || expected !== actual) {
  console.error('Le checksum de la sauvegarde est invalide.');
  process.exit(1);
}

const pgRestore = process.env.PG_RESTORE_PATH || 'pg_restore';
const result = spawnSync(pgRestore, ['--list', backupFile], { stdio: 'ignore' });
if (result.error || result.status !== 0) {
  console.error('pg_restore ne reconnaît pas cette archive.', result.error?.message ?? `code ${result.status}`);
  process.exit(1);
}

console.log(`Sauvegarde vérifiée : ${backupFile}`);
