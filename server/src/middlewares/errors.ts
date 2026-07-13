import type { NextFunction, Request, Response } from 'express';
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
  console.error(JSON.stringify({
    level: 'error',
    event: 'unhandled_error',
    requestId,
    message: err instanceof Error ? err.message : 'Erreur inconnue',
    stack: err instanceof Error ? err.stack : undefined,
  }));
  return res.status(500).json({ message: 'Erreur interne du serveur.', requestId });
}
