import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { errorHandler } from './errors';

function reponse() {
  const res = { locals: { requestId: 'req-1' }, status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

function prismaError(code: string, target?: unknown) {
  return new Prisma.PrismaClientKnownRequestError('erreur', { code, clientVersion: 'test', meta: { target } });
}

const traiter = (err: unknown, res: ReturnType<typeof reponse>) =>
  errorHandler(err, {} as Request, res as unknown as Response, (() => undefined) as NextFunction);

describe('gestionnaire d’erreurs', () => {
  it('transforme un doublon en 409 avec un message métier, pas en erreur 500', () => {
    const res = reponse();
    traiter(prismaError('P2002', ['numeroSecu']), res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringMatching(/sécurité sociale/i),
    }));
  });

  it('reconnaît aussi la contrainte nommée par PostgreSQL', () => {
    const res = reponse();
    traiter(prismaError('P2002', 'Utilisateur_login_key'), res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Cet identifiant est déjà utilisé.' }));
  });

  it('renvoie 404 quand l’enregistrement visé a disparu', () => {
    const res = reponse();
    traiter(prismaError('P2025'), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('garde 500 sans détail technique pour une erreur inconnue', () => {
    const res = reponse();
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    traiter(new Error('secret interne'), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('secret interne');
    log.mockRestore();
  });
});
