// Client API du front : la session navigateur est portée par un cookie HttpOnly.
const BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api';

/** Supprime l'ancien JWT localStorage lors de la migration vers les cookies HttpOnly. */
export function clearLegacyBrowserToken(): void {
  try {
    localStorage.removeItem('csi-token');
  } catch {
    /* localStorage indisponible */
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, (data && data.message) || `Erreur ${res.status}`, data);
  }
  return data as T;
}

/** Récupère une ressource binaire (ex. PDF) avec le cookie HttpOnly. */
export async function apiBlob(path: string): Promise<Blob> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new ApiError(res.status, `Erreur ${res.status}`);
  return res.blob();
}

export const api = {
  get: <T = unknown>(p: string) => apiFetch<T>(p),
  post: <T = unknown>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T = unknown>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T = unknown>(p: string, body?: unknown) =>
    apiFetch<T>(p, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
};
