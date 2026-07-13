import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import { genererPdf } from '../src/modules/factures/factures.service';

async function main() {
  const facture = await prisma.facture.findFirst({ select: { id: true } });
  const actor = await prisma.utilisateur.findFirst({ select: { id: true } });
  if (!facture || !actor) {
    throw new Error('Une facture et un utilisateur sont requis pour vérifier l’archive PDF.');
  }

  const first = await genererPdf(facture.id, actor.id);
  const second = await genererPdf(facture.id, actor.id);
  const documents = await prisma.factureDocument.count({ where: { factureId: facture.id } });

  if (
    !first.buffer.equals(second.buffer) ||
    first.buffer.subarray(0, 4).toString() !== '%PDF' ||
    documents !== 1
  ) {
    throw new Error('La facture relue ne correspond pas à l’archive PDF persistée.');
  }

  console.log(`Archive PDF vérifiée : ${first.buffer.length} octets, ${documents} document persistant.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
