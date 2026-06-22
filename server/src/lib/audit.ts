import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

interface AuditInput {
  utilisateurId?: string | null;
  action: string;
  entite?: string;
  entiteId?: string;
  details?: unknown;
}

/**
 * Journalise une action critique (BNF1 traçabilité, BNF7 rapports d'audit).
 * Ne fait jamais échouer le flux métier en cas d'erreur d'écriture.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.journalAudit.create({
      data: {
        utilisateurId: input.utilisateurId ?? null,
        action: input.action,
        entite: input.entite ?? null,
        entiteId: input.entiteId ?? null,
        details:
          input.details === undefined ? undefined : (input.details as Prisma.InputJsonValue),
      },
    });
  } catch (err) {
    console.error('Audit non enregistré :', err);
  }
}
