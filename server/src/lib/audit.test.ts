import { describe, expect, it } from 'vitest';
import { restoreAuditDetails, sanitizeAuditDetails } from './audit';

describe('protection du journal d’audit', () => {
  it('masque les secrets et données médicales, y compris dans les objets imbriqués', () => {
    const protectedDetails = sanitizeAuditDetails({
      actionMetier: 'refus',
      motif: 'Cancer diagnostiqué',
      ordonnance: {
        posologie: '1 comprimé par jour',
        instructions: 'À jeun',
      },
      tokenSession: 'jeton-secret',
    }) as Record<string, unknown>;

    expect(JSON.stringify(protectedDetails)).not.toContain('Cancer diagnostiqué');
    expect(JSON.stringify(protectedDetails)).not.toContain('1 comprimé par jour');
    expect(restoreAuditDetails(protectedDetails)).toEqual({
      actionMetier: 'refus',
      motif: 'Cancer diagnostiqué',
      ordonnance: {
        posologie: '1 comprimé par jour',
        instructions: 'À jeun',
      },
      tokenSession: '[MASQUÉ]',
    });
  });

  it('conserve les métadonnées opérationnelles non sensibles', () => {
    expect(sanitizeAuditDetails({ mode: 'VIREMENT', montant: 12000, taux: 80 }))
      .toEqual({ mode: 'VIREMENT', montant: 12000, taux: 80 });
  });
});
