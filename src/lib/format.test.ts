import { describe, expect, it } from 'vitest';
import { badgeFor, fmt } from './format';

describe('fmt', () => {
  it('formate un montant entier avec la devise FCFA', () => {
    expect(fmt(1234)).toMatch(/^1[\s\u202f]234 FCFA$/);
  });
});

describe('badgeFor', () => {
  it('utilise les couleurs métier prévues pour une feuille validée', () => {
    const style = badgeFor('Validée');

    expect(style).toContain('background:#e6f4ec');
    expect(style).toContain('color:#1f8a4c');
    expect(style).toContain('border:1px solid #bfe3cd');
  });

  it('retombe sur un badge neutre pour un état inconnu', () => {
    const style = badgeFor('État externe');

    expect(style).toContain('background:#eef1f6');
    expect(style).toContain('color:#5a6678');
  });
});
