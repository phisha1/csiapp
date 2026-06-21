import type {
  Assure,
  Consultation,
  Facture,
  Feuille,
  Medecin,
  Prescription,
  Remboursement,
} from '../types';

/** Données d'échantillon (fictives) — à remplacer par une API REST. */

export const assures: Assure[] = [
  { id: 'ASS-2024-0142', nom: 'Mbarga', prenom: 'Jean-Pierre', sexe: 'M', naissance: '12/04/1986', profession: 'Enseignant', groupe: 'O+', traitant: 'Dr. Atangana', statut: 'Actif' },
  { id: 'ASS-2024-0138', nom: 'Nkono', prenom: 'Marie-Claire', sexe: 'F', naissance: '03/09/1992', profession: 'Comptable', groupe: 'A+', traitant: 'Dr. Fouda', statut: 'Actif' },
  { id: 'ASS-2024-0131', nom: 'Essomba', prenom: 'Paul', sexe: 'M', naissance: '21/11/1979', profession: 'Ingénieur', groupe: 'B+', traitant: '—', statut: 'En attente' },
  { id: 'ASS-2024-0127', nom: 'Owona', prenom: 'Sandrine', sexe: 'F', naissance: '15/06/1995', profession: 'Infirmière', groupe: 'AB+', traitant: 'Dr. Atangana', statut: 'Actif' },
  { id: 'ASS-2024-0119', nom: 'Tchoumi', prenom: 'Bernard', sexe: 'M', naissance: '08/02/1968', profession: 'Commerçant', groupe: 'O-', traitant: 'Dr. Mballa', statut: 'Actif' },
  { id: 'ASS-2024-0115', nom: 'Abena', prenom: 'Christelle', sexe: 'F', naissance: '27/01/1990', profession: 'Avocate', groupe: 'A-', traitant: 'Dr. Fouda', statut: 'Actif' },
  { id: 'ASS-2024-0108', nom: 'Bello', prenom: 'Ibrahim', sexe: 'M', naissance: '19/07/1975', profession: 'Chauffeur', groupe: 'B-', traitant: 'Dr. Eyenga', statut: 'Actif' },
  { id: 'ASS-2024-0102', nom: 'Fotso', prenom: 'Adeline', sexe: 'F', naissance: '05/12/1988', profession: 'Pharmacienne', groupe: 'O+', traitant: 'Dr. Atangana', statut: 'Actif' },
  { id: 'ASS-2024-0097', nom: 'Kameni', prenom: 'Hervé', sexe: 'M', naissance: '30/03/1982', profession: 'Architecte', groupe: 'AB-', traitant: '—', statut: 'En attente' },
  { id: 'ASS-2024-0091', nom: 'Ngo Bell', prenom: 'Rose', sexe: 'F', naissance: '14/09/1997', profession: 'Étudiante', groupe: 'A+', traitant: 'Dr. Fouda', statut: 'Actif' },
  { id: 'ASS-2024-0084', nom: 'Onana', prenom: 'Serge', sexe: 'M', naissance: '02/05/1971', profession: 'Mécanicien', groupe: 'O+', traitant: 'Dr. Eyenga', statut: 'Actif' },
  { id: 'ASS-2024-0079', nom: 'Tabi', prenom: 'Yvette', sexe: 'F', naissance: '23/08/1993', profession: 'Enseignante', groupe: 'B+', traitant: 'Dr. Atangana', statut: 'Suspendu' },
  { id: 'ASS-2024-0072', nom: 'Wandji', prenom: 'Gaston', sexe: 'M', naissance: '11/02/1965', profession: 'Retraité', groupe: 'A+', traitant: 'Dr. Mballa', statut: 'Actif' },
  { id: 'ASS-2024-0066', nom: 'Eyenga', prenom: 'Brenda', sexe: 'F', naissance: '07/06/1999', profession: 'Coiffeuse', groupe: 'O-', traitant: '—', statut: 'En attente' },
];

export const medecins: Medecin[] = [
  { id: 'MED-031', nom: 'Dr. Atangana', spec: 'Généraliste', type: 'Généraliste', etab: "Centre Médical d'Etoudi", tel: '+237 6 99 12 34 56', patients: 42 },
  { id: 'MED-047', nom: 'Dr. Fouda', spec: 'Généraliste', type: 'Généraliste', etab: 'Polyclinique Bastos', tel: '+237 6 77 88 11 22', patients: 36 },
  { id: 'MED-055', nom: 'Dr. Eyenga', spec: 'Généraliste', type: 'Généraliste', etab: 'CMA de Nkolndongo', tel: '+237 6 70 14 25 36', patients: 31 },
  { id: 'MED-052', nom: 'Dr. Mballa', spec: 'Cardiologie', type: 'Spécialiste', etab: 'Hôpital Central', tel: '+237 6 90 55 44 33', patients: 28 },
  { id: 'MED-058', nom: 'Dr. Ngassa', spec: 'Dermatologie', type: 'Spécialiste', etab: "Clinique de l'Espoir", tel: '+237 6 95 22 66 77', patients: 19 },
  { id: 'MED-061', nom: 'Dr. Biya', spec: 'Pédiatrie', type: 'Spécialiste', etab: 'Hôpital Gynéco-Obstétrique', tel: '+237 6 78 33 99 00', patients: 24 },
  { id: 'MED-064', nom: 'Dr. Manga', spec: 'Généraliste', type: 'Généraliste', etab: 'Hôpital de District de Biyem-Assi', tel: '+237 6 91 47 58 69', patients: 33 },
  { id: 'MED-070', nom: 'Dr. Sounna', spec: 'Pneumologie', type: 'Spécialiste', etab: 'Hôpital Jamot', tel: '+237 6 82 36 14 70', patients: 17 },
  { id: 'MED-073', nom: 'Dr. Kemajou', spec: 'Gynécologie', type: 'Spécialiste', etab: 'Hôpital Gynéco-Obstétrique', tel: '+237 6 99 03 47 81', patients: 22 },
  { id: 'MED-078', nom: 'Dr. Njoya', spec: 'Ophtalmologie', type: 'Spécialiste', etab: 'Clinique de la Vue', tel: '+237 6 75 61 92 04', patients: 15 },
];

export const feuilles: Feuille[] = [
  { code: 'FM-2024-0891', assure: 'Mbarga Jean-Pierre', medecin: 'Dr. Atangana', date: '14/06/2026', diag: 'Paludisme simple', montant: 28500, etat: 'Validée', taux: 80 },
  { code: 'FM-2024-0890', assure: 'Owona Sandrine', medecin: 'Dr. Atangana', date: '14/06/2026', diag: 'Infection respiratoire', montant: 19000, etat: 'Validée', taux: 80 },
  { code: 'FM-2024-0888', assure: 'Essomba Paul', medecin: 'Dr. Fouda', date: '13/06/2026', diag: 'Gastrite aiguë', montant: 24000, etat: 'Validée', taux: 70 },
  { code: 'FM-2024-0887', assure: 'Nkono Marie-Claire', medecin: 'Dr. Fouda', date: '13/06/2026', diag: 'Hypertension', montant: 42000, etat: 'Remboursée', taux: 80 },
  { code: 'FM-2024-0886', assure: 'Abena Christelle', medecin: 'Dr. Atangana', date: '12/06/2026', diag: 'Migraine chronique', montant: 31000, etat: 'Validée', taux: 80 },
  { code: 'FM-2024-0885', assure: 'Fotso Adeline', medecin: 'Dr. Eyenga', date: '12/06/2026', diag: 'Anémie ferriprive', montant: 17500, etat: 'Validée', taux: 100 },
  { code: 'FM-2024-0884', assure: 'Tchoumi Bernard', medecin: 'Dr. Mballa', date: '12/06/2026', diag: 'Suivi cardiaque', montant: 65000, etat: 'Transmise' },
  { code: 'FM-2024-0883', assure: 'Bello Ibrahim', medecin: 'Dr. Eyenga', date: '11/06/2026', diag: 'Lombalgie', montant: 22000, etat: 'En cours de traitement' },
  { code: 'FM-2024-0879', assure: 'Essomba Paul', medecin: 'Dr. Fouda', date: '11/06/2026', diag: 'Gastrite', montant: 15500, etat: 'Refusée' },
];

export const consultations: Consultation[] = [
  { id: 'CONS-3401', patient: 'Mbarga Jean-Pierre', date: '14/06/2026 · 08:30', medecin: 'Dr. Atangana', motif: 'Fièvre, courbatures', type: 'Généraliste', suite: 'Feuille FM-2024-0891' },
  { id: 'CONS-3400', patient: 'Owona Sandrine', date: '14/06/2026 · 09:15', medecin: 'Dr. Atangana', motif: 'Toux persistante', type: 'Généraliste', suite: 'Orientée spécialiste' },
  { id: 'CONS-3399', patient: 'Essomba Paul', date: '13/06/2026 · 15:40', medecin: 'Dr. Atangana', motif: 'Douleurs abdominales', type: 'Généraliste', suite: 'Feuille FM-2024-0888' },
  { id: 'CONS-3398', patient: 'Tchoumi Bernard', date: '12/06/2026 · 11:00', medecin: 'Dr. Atangana', motif: 'Céphalées récurrentes', type: 'Généraliste', suite: 'Orientée spécialiste' },
  { id: 'CONS-3395', patient: 'Nkono Marie-Claire', date: '11/06/2026 · 10:20', medecin: 'Dr. Atangana', motif: 'Contrôle tension', type: 'Généraliste', suite: 'Prescription PRESC-1205' },
  { id: 'CONS-3392', patient: 'Owona Sandrine', date: '09/06/2026 · 14:05', medecin: 'Dr. Atangana', motif: 'Renouvellement ordonnance', type: 'Généraliste', suite: 'Prescription PRESC-1201' },
  { id: 'CONS-3388', patient: 'Mbarga Jean-Pierre', date: '06/06/2026 · 09:00', medecin: 'Dr. Atangana', motif: 'Vaccination', type: 'Généraliste', suite: 'Feuille FM-2024-0875' },
];

export const prescriptions: Prescription[] = [
  { id: 'PRESC-1207', patient: 'Mbarga Jean-Pierre', medecin: 'Dr. Atangana', date: '14/06/2026', type: 'Médicaments', detail: 'Amoxicilline, Paracétamol', cons: 'CONS-3401' },
  { id: 'PRESC-1206', patient: 'Owona Sandrine', medecin: 'Dr. Atangana', date: '14/06/2026', type: 'Consultation spécialiste', detail: 'Pneumologie — Dr. Ngassa', cons: 'CONS-3400' },
  { id: 'PRESC-1203', patient: 'Tchoumi Bernard', medecin: 'Dr. Mballa', date: '12/06/2026', type: 'Médicaments', detail: 'Amlodipine 5mg', cons: 'CONS-3398' },
];

export const remboursements: Remboursement[] = [
  { id: 'RB-2024-0455', assure: 'Nkono Marie-Claire', feuille: 'FM-2024-0887', montant: 33600, taux: '80%', mode: 'Virement bancaire', statut: 'Remboursé', date: '13/06/2026' },
  { id: 'RB-2024-0454', assure: 'Mbarga Jean-Pierre', feuille: 'FM-2024-0891', montant: 22800, taux: '80%', mode: 'Espèces', statut: 'Validé', date: '14/06/2026' },
  { id: 'RB-2024-0453', assure: 'Tchoumi Bernard', feuille: 'FM-2024-0884', montant: 0, taux: '—', mode: '—', statut: 'En attente', date: '—' },
];

export const factures: Facture[] = [
  { id: 'FACT-2024-0302', assure: 'Owona Sandrine', feuille: 'FM-2024-0890', montant: 15200, date: '14/06/2026', statut: 'Émise' },
  { id: 'FACT-2024-0301', assure: 'Nkono Marie-Claire', feuille: 'FM-2024-0887', montant: 33600, date: '13/06/2026', statut: 'Émise' },
  { id: 'FACT-2024-0300', assure: 'Mbarga Jean-Pierre', feuille: 'FM-2024-0891', montant: 22800, date: '14/06/2026', statut: 'Émise' },
  { id: 'FACT-2024-0299', assure: 'Abena Christelle', feuille: 'FM-2024-0886', montant: 24800, date: '12/06/2026', statut: 'Émise' },
];

/** Banques partenaires (virement). */
export const banks = ['CBC Bank', 'Afriland First Bank', 'BICEC', 'Société Générale Cameroun', 'Ecobank', 'UBA Cameroun'];

/** Généralistes éligibles comme médecin traitant. */
export const generalistesTraitants = [
  { id: 'MED-031', nom: 'Dr. Atangana', etab: "Centre Médical d'Etoudi" },
  { id: 'MED-047', nom: 'Dr. Fouda', etab: 'Polyclinique Bastos' },
  { id: 'MED-055', nom: 'Dr. Eyenga', etab: 'CMA de Nkolndongo' },
];
