import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import { decryptFeuille } from '../../lib/phi';

const FACTURES_DIR = path.join(process.cwd(), 'factures');

const factureInclude = {
  assure: { include: { personne: true } },
  feuille: { include: { medecin: { include: { personne: true } } } },
  remboursement: true,
} satisfies Prisma.FactureInclude;

type FactureDetail = Prisma.FactureGetPayload<{ include: typeof factureInclude }>;

const fmtMontant = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;

export async function listFactures(params: { q?: string; skip: number; take: number }) {
  const { q, skip, take } = params;
  const where: Prisma.FactureWhereInput = q
    ? {
        OR: [
          { reference: { contains: q, mode: 'insensitive' } },
          { assure: { matricule: { contains: q, mode: 'insensitive' } } },
          { assure: { personne: { nom: { contains: q, mode: 'insensitive' } } } },
        ],
      }
    : {};
  const [total, items] = await prisma.$transaction([
    prisma.facture.count({ where }),
    prisma.facture.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: { assure: { include: { personne: true } }, feuille: true },
    }),
  ]);
  items.forEach((f) => decryptFeuille(f.feuille));
  return { total, items };
}

export async function getFacture(id: string): Promise<FactureDetail> {
  const facture = await prisma.facture.findUnique({ where: { id }, include: factureInclude });
  if (!facture) throw new AppError(404, 'Facture introuvable.');
  decryptFeuille(facture.feuille);
  return facture;
}

/** Génère le PDF de la facture (BF12), l'archive sur disque et le renvoie. */
export async function genererPdf(id: string, actorId: string) {
  const facture = await getFacture(id);
  const buffer = await buildPdf(facture);
  fs.mkdirSync(FACTURES_DIR, { recursive: true });
  const filePath = path.join(FACTURES_DIR, `${facture.reference}.pdf`);
  fs.writeFileSync(filePath, buffer);
  if (!facture.cheminPdf) {
    await prisma.facture.update({ where: { id }, data: { cheminPdf: filePath } });
  }
  await recordAudit({ utilisateurId: actorId, action: 'FACTURE_IMPRIMEE', entite: 'Facture', entiteId: id });
  return { buffer, filename: `${facture.reference}.pdf` };
}

function buildPdf(facture: FactureDetail): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const p = facture.assure.personne;
    doc.fontSize(20).fillColor('#14253f').text('CNAM — Reçu de remboursement', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(11).fillColor('#000');
    doc.text(`Référence facture : ${facture.reference}`);
    doc.text(`Date : ${new Date(facture.date).toLocaleDateString('fr-FR')}`);
    doc.moveDown();
    doc.text(`Assuré : ${p.nom} ${p.prenom}  (${facture.assure.matricule})`);
    doc.text(`Feuille de maladie : ${facture.feuille.code}`);
    if (facture.remboursement) {
      doc.text(`Mode de remboursement : ${facture.remboursement.mode}`);
      doc.text(`Taux appliqué : ${facture.remboursement.taux} %`);
      if (facture.remboursement.referenceBancaire) {
        doc.text(`Référence virement : ${facture.remboursement.referenceBancaire}`);
      }
    }
    doc.moveDown(1.5);
    doc.fontSize(14).text(`Montant remboursé : ${fmtMontant(Number(facture.montant))}`, { align: 'right' });
    doc.moveDown(3);
    doc.fontSize(9).fillColor('#666').text('Document généré automatiquement — Système d\'Information CSI-CNAM.', { align: 'center' });

    doc.end();
  });
}
