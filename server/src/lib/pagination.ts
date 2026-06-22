import type { Request } from 'express';

/** Parse `page` et `limit` de la query (BNF2 : pagination des listes). */
export function getPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

/** Parse le terme de recherche `q`. */
export function getSearch(req: Request): string | undefined {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  return q.length ? q : undefined;
}
