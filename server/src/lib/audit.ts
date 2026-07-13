import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { decryptPHI, encryptPHI, isEncrypted } from './phi';

interface AuditInput {
  utilisateurId?: string | null;
  action: string;
  entite?: string;
  entiteId?: string;
  details?: unknown;
}

const SECRET_AUDIT_KEY = /password|motdepasse|secret|token|authorization|cookie|session|numerocompte|telephone|email/i;
const CLINICAL_AUDIT_KEY = /diagnostic|motif|actes|suite|posologie|duree|instructions/i;

function normalizeAuditKey(key: string) {
  return key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '');
}

/** Chiffre le médical et masque les secrets avant toute écriture dans le journal. */
export function sanitizeAuditDetails(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeAuditDetails(item, seen));
  if (typeof value !== 'object') return String(value);
  if (seen.has(value)) return '[NON_SERIALISABLE]';
  seen.add(value);

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SECRET_AUDIT_KEY.test(normalizeAuditKey(key))
        ? '[MASQUÉ]'
        : CLINICAL_AUDIT_KEY.test(normalizeAuditKey(key)) && typeof item === 'string'
          ? encryptPHI(item)
          : sanitizeAuditDetails(item, seen),
    ]),
  );
}

/** Rend les champs médicaux du journal lisibles uniquement après contrôle d'accès. */
export function restoreAuditDetails(value: unknown): unknown {
  if (typeof value === 'string') return isEncrypted(value) ? decryptPHI(value) : value;
  if (Array.isArray(value)) return value.map(restoreAuditDetails);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, restoreAuditDetails(item)]),
  );
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
        details: input.details === undefined
          ? undefined
          : (sanitizeAuditDetails(input.details) as Prisma.InputJsonValue),
      },
    });
  } catch (err) {
    console.error('Audit non enregistré :', err instanceof Error ? err.name : 'Erreur inconnue');
  }
}
