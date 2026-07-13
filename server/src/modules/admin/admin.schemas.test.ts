import { describe, expect, it } from 'vitest';
import { createAssureurSchema } from './admin.schemas';

describe('createAssureurSchema', () => {
  it("normalise les espaces autour de l'identifiant", () => {
    expect(createAssureurSchema.parse({ login: '  agent.cnam  ' })).toEqual({
      login: 'agent.cnam',
    });
  });

  it('accepte un identifiant de type adresse e-mail', () => {
    expect(createAssureurSchema.safeParse({ login: 'agent@cnam.cm' }).success).toBe(true);
  });

  it('refuse les identifiants ambigus ou contenant des espaces', () => {
    expect(createAssureurSchema.safeParse({ login: 'agent cnam' }).success).toBe(false);
  });
});
