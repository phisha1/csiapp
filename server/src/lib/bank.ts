import crypto from 'crypto';

export interface VirementInput {
  montant: number;
  banque: string;
  compte: string;
  titulaire: string;
}

export interface VirementResult {
  success: boolean;
  reference?: string;
  error?: string;
}

/**
 * Adaptateur du système bancaire externe (BNF6) — implémentation MOCK.
 * À remplacer par une vraie intégration API. `simulerEchec` permet de tester
 * le scénario d'échec / rollback (BNF3).
 */
export async function executeVirement(
  input: VirementInput,
  simulerEchec = false,
): Promise<VirementResult> {
  await new Promise((r) => setTimeout(r, 50)); // latence simulée
  if (simulerEchec) {
    return { success: false, error: 'Virement refusé par le système bancaire (simulation).' };
  }
  return { success: true, reference: 'VIR-' + crypto.randomBytes(4).toString('hex').toUpperCase() };
}
