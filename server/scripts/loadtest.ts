/**
 * Test de charge (BNF2) — simule N utilisateurs simultanés frappant les endpoints
 * de lecture les plus courants, et mesure débit + latences (objectif < 3 s).
 *
 * Lancer le serveur puis : `npx tsx scripts/loadtest.ts`  (ou `npm run loadtest`)
 * Variables : LOADTEST_URL, LOADTEST_USERS, LOADTEST_REQ.
 */
const BASE = process.env.LOADTEST_URL ?? 'http://localhost:4000/api';
const USERS = Number(process.env.LOADTEST_USERS ?? 50);
const REQ_PER_USER = Number(process.env.LOADTEST_REQ ?? 20);

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'assureur', motDePasse: 'cnam2024' }),
  });
  if (!res.ok) throw new Error(`Login impossible (${res.status}) — le serveur est-il démarré ?`);
  return (await res.json()).token as string;
}

async function main() {
  const token = await login();
  const headers = { Authorization: `Bearer ${token}` };
  const endpoints = ['/stats', '/assures?limit=20', '/medecins?limit=20', '/feuilles?limit=20', '/remboursements', '/factures'];

  const latencies: number[] = [];
  let errors = 0;
  const start = Date.now();

  async function virtualUser(u: number) {
    for (let i = 0; i < REQ_PER_USER; i++) {
      const path = endpoints[(u + i) % endpoints.length];
      const t0 = performance.now();
      try {
        const r = await fetch(`${BASE}${path}`, { headers });
        await r.text();
        if (!r.ok) errors++;
      } catch {
        errors++;
      }
      latencies.push(performance.now() - t0);
    }
  }

  await Promise.all(Array.from({ length: USERS }, (_, u) => virtualUser(u)));

  const totalMs = Date.now() - start;
  latencies.sort((a, b) => a - b);
  const n = latencies.length;
  const pct = (q: number) => latencies[Math.min(n - 1, Math.floor(n * q))];

  console.log('──────────── Test de charge (BNF2) ────────────');
  console.log(`Utilisateurs simultanés : ${USERS}`);
  console.log(`Requêtes totales        : ${n}  (erreurs : ${errors})`);
  console.log(`Durée totale            : ${totalMs} ms`);
  console.log(`Débit                   : ${(n / (totalMs / 1000)).toFixed(0)} req/s`);
  console.log(`Latence p50 / p95 / max : ${pct(0.5).toFixed(0)} / ${pct(0.95).toFixed(0)} / ${latencies[n - 1].toFixed(0)} ms`);
  console.log(`Objectif BNF2 (< 3000 ms) : ${pct(0.95) < 3000 && errors === 0 ? 'ATTEINT ✅' : 'NON ATTEINT ❌'}`);
  console.log('───────────────────────────────────────────────');
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
