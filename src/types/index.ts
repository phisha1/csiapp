export type Role = 'assureur' | 'medecin';
export type AuthView = 'login' | 'inscription';
export type AuthStage = 'landing' | 'form';
export type Theme = 'clair' | 'sombre';
export type RembMode = 'especes' | 'virement' | null;
export type BankState = 'idle' | 'processing' | 'done';
export type ModalKind = 'medConfirm' | null;
export type ListField = 'assures' | 'medecins' | 'feuilles';

/** Clé d'écran (équivalent de `screen` dans le prototype). */
export type ScreenKey =
  | 'dashboard'
  | 'assures'
  | 'assure_new'
  | 'assure_medecin'
  | 'medecins'
  | 'feuilles'
  | 'feuille_new'
  | 'feuille_complete'
  | 'consultations'
  | 'prescriptions'
  | 'prescrire_medicament'
  | 'prescrire_specialiste'
  | 'remboursements'
  | 'remboursement_new'
  | 'factures'
  | 'facture_print'
  | 'medecin_new'
  | 'uml'
  | 'parametres';

export type UmlTab =
  | 'contexte'
  | 'package'
  | 'classes'
  | 'objets'
  | 'cas'
  | 'activite'
  | 'etats'
  | 'sequence';

export interface MedRow {
  nom: string;
  code: string;
  dosage: string;
  duree: string;
  instr: string;
}

/** Formulaire d'enregistrement d'un médecin (par l'assureur). */
export interface MedForm {
  nom: string;
  prenom: string;
  numOrdre: string;
  type: 'Généraliste' | 'Spécialiste';
  specialite: string;
  tel: string;
  etab: string;
  email: string;
  mdp: string;
}

/** Formulaire de création d'une feuille de maladie. */
export interface FeuilleForm {
  numAssure: string;
  dateConsult: string;
  montant: string;
  diagnostic: string;
  actes: string;
  prescriptions: string;
  observations: string;
}

/** Coordonnées bancaires pour un remboursement par virement. */
export interface RembBank {
  banqueRecep: string;
  compteRecep: string;
  titulaire: string;
  useEmetteur: boolean;
  banqueEmet: string;
  compteEmet: string;
}

/** Recherche par liste (texte saisi par champ). */
export type ListQuery = Record<ListField, string>;

/** Fiche détail affichée en modale. */
export type DetailEntity =
  | { type: 'assure'; data: Assure }
  | { type: 'medecin'; data: Medecin }
  | null;

export interface Assure {
  id: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  naissance: string;
  profession: string;
  groupe: string;
  traitant: string;
  statut: string;
}

export interface Medecin {
  id: string;
  nom: string;
  spec: string;
  type: 'Généraliste' | 'Spécialiste';
  etab: string;
  tel: string;
  patients: number;
}

export interface Feuille {
  code: string;
  assure: string;
  medecin: string;
  date: string;
  diag: string;
  montant: number;
  etat: string;
  /** Taux de remboursement en % (renseigné dès la complétion → état Validée). */
  taux?: number;
}

export interface Consultation {
  id: string;
  patient: string;
  date: string;
  medecin: string;
  motif: string;
  type: string;
  suite: string;
}

export interface Prescription {
  id: string;
  patient: string;
  medecin: string;
  date: string;
  type: string;
  detail: string;
  cons: string;
}

export interface Remboursement {
  id: string;
  assure: string;
  feuille: string;
  montant: number;
  taux: string;
  mode: string;
  statut: string;
  date: string;
}

export interface Facture {
  id: string;
  assure: string;
  feuille: string;
  montant: number;
  date: string;
  statut: string;
}

/** Une entrée de la map de traçabilité UML. */
export interface TraceEntry {
  titre: string;
  type: string;
  acteurs: string[];
  cas: string;
  pre: string[];
  scenario: { n: number; t: string }[];
  alt: string[];
  classes: string[];
  etat: string;
}
