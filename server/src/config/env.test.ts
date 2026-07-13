import { describe, expect, it } from 'vitest';
import { environmentSchema } from './env';

const productionEnvironment = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:password@database.internal:5432/csi',
  JWT_SECRET: 'jwt_7f515f2c7cdf451498a70da10f59c1d9',
  ENCRYPTION_KEY: 'enc_8bd441147b57447ea2de6185b220606b',
  CORS_ORIGIN: 'https://app.cnam.example',
};

describe('configuration de production', () => {
  it('refuse les secrets connus, trop courts ou réutilisés', () => {
    const result = environmentSchema.safeParse({
      ...productionEnvironment,
      JWT_SECRET: 'a-changer-absolument-en-production',
      ENCRYPTION_KEY: 'a-changer-absolument-en-production',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.JWT_SECRET?.join(' ')).toMatch(/production/i);
      expect(result.error.flatten().fieldErrors.ENCRYPTION_KEY?.join(' ')).toMatch(/production|distincte/i);
    }
  });

  it('refuse une origine non HTTPS en production', () => {
    const result = environmentSchema.safeParse({
      ...productionEnvironment,
      CORS_ORIGIN: 'http://app.cnam.example',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.CORS_ORIGIN?.join(' ')).toMatch(/HTTPS/);
    }
  });

  it('accepte des secrets distincts et des origines HTTPS', () => {
    expect(environmentSchema.safeParse(productionEnvironment).success).toBe(true);
  });
});
