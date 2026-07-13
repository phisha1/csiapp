import { encrypt, decrypt } from './crypto';

/**
 * Chiffrement des données de santé (PHI — Protected Health Information) au repos.
 * Source unique de vérité : les services ne savent PAS quels champs sont sensibles,
 * ils appellent seulement decryptFeuille()/decryptConsultation(). On évite ainsi
 * d'oublier un chemin de lecture (qui renverrait du texte chiffré à l'écran).
 */

/** Vrai si la valeur a le format d'un chiffré produit par encrypt() : "iv:tag:data". */
export function isEncrypted(value: string): boolean {
  if (value.split(':').length !== 3) return false;
  try {
    return decrypt(value) !== '';
  } catch {
    return false;
  }
}

/**
 * Chiffre une valeur clinique.
 * - undefined → undefined (mise à jour Prisma : « ne pas toucher au champ »)
 * - null / '' → null (rien à protéger)
 * - déjà chiffré → inchangé (idempotent, protège les backfills)
 */
export function encryptPHI(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return isEncrypted(value) ? value : encrypt(value);
}

/**
 * Déchiffre une valeur clinique. Tolère les anciennes données en clair
 * (pendant la migration, une valeur non chiffrée est renvoyée telle quelle).
 */
export function decryptPHI(value: string | null | undefined): string | null {
  if (value == null || value === '') return null;
  return isEncrypted(value) ? decrypt(value) : value;
}

// --- Helpers d'entités : le SEUL endroit qui connaît les champs à protéger. ---

type ConsultationPHI = {
  motif?: string | null;
  diagnostic?: string | null;
  actes?: string | null;
  suite?: string | null;
};

/** Déchiffre en place les champs cliniques d'une consultation, puis la renvoie. */
export function decryptConsultation<T extends ConsultationPHI>(c: T): T {
  c.motif = decryptPHI(c.motif);
  c.diagnostic = decryptPHI(c.diagnostic);
  c.actes = decryptPHI(c.actes);
  c.suite = decryptPHI(c.suite);
  return c;
}

type FeuillePHI = { diagnostic?: string | null; consultation?: ConsultationPHI | null };

/** Déchiffre en place le diagnostic d'une feuille (et sa consultation imbriquée), puis la renvoie. */
export function decryptFeuille<T extends FeuillePHI>(f: T): T {
  f.diagnostic = decryptPHI(f.diagnostic);
  if (f.consultation) decryptConsultation(f.consultation);
  return f;
}

type OrdonnanceLinePHI = {
  posologie?: string | null;
  duree?: string | null;
  instructions?: string | null;
};

type PrescriptionPHI = { lignes?: OrdonnanceLinePHI[] };

/** Déchiffre les consignes d'une ordonnance sans exposer leur stockage chiffré à l'API. */
export function decryptPrescription<T extends PrescriptionPHI>(prescription: T): T {
  for (const ligne of prescription.lignes ?? []) {
    ligne.posologie = decryptPHI(ligne.posologie);
    ligne.duree = decryptPHI(ligne.duree);
    ligne.instructions = decryptPHI(ligne.instructions);
  }
  return prescription;
}
