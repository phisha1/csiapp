/**
 * Backfill ponctuel : chiffre les champs cliniques existants et les consignes d'ordonnance
 * qui seraient encore en clair en base. Idempotent — relançable sans risque
 * (encryptPHI ne re-chiffre pas une valeur déjà chiffrée).
 *
 *   npm run encrypt:phi
 */
import { prisma } from '../src/config/prisma';
import { Prisma } from '@prisma/client';
import { sanitizeAuditDetails } from '../src/lib/audit';
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

  const lignesOrdonnance = await prisma.ordonnanceLigne.findMany();
  for (const ligne of lignesOrdonnance) {
    await prisma.ordonnanceLigne.update({
      where: { id: ligne.id },
      data: {
        posologie: encryptPHI(ligne.posologie),
        duree: encryptPHI(ligne.duree),
        instructions: encryptPHI(ligne.instructions),
      },
    });
  }

  const auditsAvecDetails = await prisma.journalAudit.findMany({
    where: { details: { not: Prisma.JsonNull } },
    select: { id: true, details: true },
  });
  for (const audit of auditsAvecDetails) {
    await prisma.journalAudit.update({
      where: { id: audit.id },
      data: { details: sanitizeAuditDetails(audit.details) as Prisma.InputJsonValue },
    });
  }

  console.log(
    `✅ Chiffrement PHI terminé : ${consultations.length} consultation(s), ${feuilles.length} feuille(s), ${lignesOrdonnance.length} ligne(s) d'ordonnance, ${auditsAvecDetails.length} audit(s) protégé(s).`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Backfill échoué :', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
