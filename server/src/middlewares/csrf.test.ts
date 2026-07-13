import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createCsrfProtection } from './csrf';

const res = {} as Response;

function request(method: string, origin?: string, authorization?: string) {
  return { method, headers: { origin, authorization } } as Request;
}

describe('protection CSRF', () => {
  const protect = createCsrfProtection(['https://app.cnam.cm']);

  it('laisse passer les lectures', () => {
    const next = vi.fn();
    protect(request('GET'), res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('laisse passer une mutation provenant du frontend autorisé', () => {
    const next = vi.fn();
    protect(request('POST', 'https://app.cnam.cm'), res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('refuse une mutation provenant d’un site tiers', () => {
    expect(() => protect(request('POST', 'https://attaque.example'), res, vi.fn())).toThrow(/origine/i);
  });

  it('accepte un client API sans Origin avec un Bearer explicite', () => {
    const next = vi.fn();
    protect(request('POST', undefined, 'Bearer api-token'), res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
