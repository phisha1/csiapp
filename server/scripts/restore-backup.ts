import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const backupFile = process.argv.find((argument) => argument.endsWith('.dump'));
const confirmed = process.argv.includes('--confirm');
const sourceUrl = process.env.DATABASE_URL || '';
const targetUrl = process.env.RESTORE_DATABASE_URL || '';

function parseDatabaseUrl(value: string) {
  const parsed = new URL(value);
  parsed.search = '';
  parsed.hash = '';
  return parsed;
}

function databaseIdentity(value: URL) {
  return `${value.protocol}//${value.hostname.toLowerCase()}:${value.port || '5432'}${value.pathname}`;
}

if (!backupFile || !confirmed || !targetUrl) {
  console.error('Usage : RESTORE_DATABASE_URL=... RESTORE_CONFIRM_DATABASE=... npm run backup:restore -- chemin.dump --confirm');
  process.exit(1);
}
const parsedTarget = parseDatabaseUrl(targetUrl);
const parsedSource = sourceUrl ? parseDatabaseUrl(sourceUrl) : null;
if (parsedSource && databaseIdentity(parsedSource) === databaseIdentity(parsedTarget)) {
  console.error('Restauration refusée : la base cible est la base source.');
  process.exit(1);
}

const resolvedBackup = path.resolve(backupFile);
const checksumFile = `${resolvedBackup}.sha256`;
if (!fs.existsSync(resolvedBackup) || !fs.existsSync(checksumFile)) {
  console.error('Archive ou checksum introuvable.');
  process.exit(1);
}

const targetDatabase = decodeURIComponent(parsedTarget.pathname.replace(/^\//, ''));
if (!targetDatabase || process.env.RESTORE_CONFIRM_DATABASE !== targetDatabase) {
  console.error(`Restauration refusée : RESTORE_CONFIRM_DATABASE doit valoir exactement "${targetDatabase}".`);
  process.exit(1);
}

const expected = fs.readFileSync(checksumFile, 'utf8').trim().split(/\s+/)[0];
const actual = crypto.createHash('sha256').update(fs.readFileSync(resolvedBackup)).digest('hex');
if (!expected || expected !== actual) {
  console.error('Restauration refusée : checksum invalide.');
  process.exit(1);
}

const pgRestore = process.env.PG_RESTORE_PATH || 'pg_restore';
const result = spawnSync(pgRestore, [
  '--clean',
  '--if-exists',
  '--no-owner',
  '--no-privileges',
  '--exit-on-error',
  '--dbname',
  parsedTarget.toString(),
  resolvedBackup,
], { stdio: 'inherit' });

if (result.error || result.status !== 0) {
  console.error('Échec de la restauration :', result.error?.message ?? `code ${result.status}`);
  process.exit(1);
}

console.log(`Restauration terminée dans la base isolée ${targetDatabase}.`);
