import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from './app';

describe('sondes d’exploitation', () => {
  it('expose une sonde de processus avec un identifiant de requête', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.headers['x-request-id']).toMatch(/^[A-Za-z0-9-]+$/);
  });

  it('déclare le service prêt lorsque PostgreSQL répond', async () => {
    const response = await request(createApp({ readinessCheck: async () => undefined })).get('/api/ready');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ready');
  });

  it('retire le service du trafic lorsque PostgreSQL ne répond plus', async () => {
    const response = await request(createApp({
      readinessCheck: async () => {
        throw new Error('database unavailable');
      },
    })).get('/api/ready');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('unavailable');
  });
});
