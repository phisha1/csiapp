/**
 * Backfill ponctuel : chiffre les champs cliniques existants (diagnostic, motif, actes, suite)
 * qui seraient encore en clair en base. Idempotent — relançable sans risque
 * (encryptPHI ne re-chiffre pas une valeur déjà chiffrée).
 *
 *   npm run encrypt:phi
 */
import { prisma } from '../src/config/prisma';
import { encryptPHI } from '../src/lib/phi';

async function main() {
  const consultations = await prisma.consultation.findMany();
  for (const c of consultations) {
    await prisma.consultation.update({
      where: { id: c.id },
      data: {
        motif: encryptPHI(c.motif),
        diagnostic: encryptPHI(c.diagnostic),
        actes: encryptPHI(c.actes),
        suite: encryptPHI(c.suite),
      },
    });
  }

  const feuilles = await prisma.feuilleMaladie.findMany();
  for (const f of feuilles) {
    await prisma.feuilleMaladie.update({
      where: { id: f.id },
      data: { diagnostic: encryptPHI(f.diagnostic) },
    });
  }

  console.log(
    `✅ Chiffrement PHI terminé : ${consultations.length} consultation(s), ${feuilles.length} feuille(s).`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Backfill échoué :', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
