import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/** Erreur métier porteuse d'un code HTTP (levée par les services). */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const UNIQUE_MESSAGES: Record<string, string> = {
  numeroSecu: 'Ce numéro de sécurité sociale est déjà attribué à un autre assuré.',
  matricule: 'Ce matricule est déjà utilisé.',
  login: 'Cet identifiant est déjà utilisé.',
  numOrdre: "Ce numéro d'ordre est déjà enregistré.",
  code: 'Ce code existe déjà.',
  libelle: 'Ce libellé existe déjà.',
  personneId: 'Cette personne est déjà enregistrée.',
};

/** Message lisible pour une violation d'unicité Prisma (P2002). */
export function uniqueConflictMessage(target: unknown): string {
  const fields = Array.isArray(target) ? target.map(String) : typeof target === 'string' ? [target] : [];
  for (const [field, message] of Object.entries(UNIQUE_MESSAGES)) {
    if (fields.some((f) => f === field || f.endsWith(`_${field}_key`))) return message;
  }
  return 'Cet enregistrement existe déjà.';
}

/** Route inconnue → 404 JSON. */
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: 'Ressource introuvable.' });
}

/** Gestionnaire d'erreurs centralisé : messages explicites en français (BNF5). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const requestId = res.locals.requestId as string | undefined;
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: 'Données invalides — corrigez les champs signalés.',
      erreurs: err.flatten().fieldErrors,
      requestId,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details, requestId });
  }
  // Doublon sur une contrainte d'unicité (y compris quand deux requêtes se croisent
  // après le contrôle applicatif) : c'est un conflit métier, pas une panne.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: uniqueConflictMessage(err.meta?.target), requestId });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Ressource introuvable.', requestId });
    }
  }
  console.error(JSON.stringify({
    level: 'error',
    event: 'unhandled_error',
    requestId,
    message: err instanceof Error ? err.message : 'Erreur inconnue',
    stack: err instanceof Error ? err.stack : undefined,
  }));
  return res.status(500).json({ message: 'Erreur interne du serveur.', requestId });
}
