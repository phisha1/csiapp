import type { Role, ScreenKey } from '../types';

export interface NavEntry {
  key: ScreenKey;
  label: string;
}

/** Configuration de navigation par rôle (fidèle à `navConfig()`). */
export const navConfig: Record<Role, NavEntry[]> = {
  admin: [
    { key: 'admin_users', label: 'Gestion des comptes' },
  ],
  assureur: [
    { key: 'dashboard', label: 'Tableau de bord' },
    { key: 'assures', label: 'Assurés' },
    { key: 'medecins', label: 'Médecins' },
    { key: 'feuilles', label: 'Feuilles de maladie' },
    { key: 'remboursements', label: 'Remboursements' },
    { key: 'factures', label: 'Factures' },
    { key: 'parametres', label: 'Paramètres' },
  ],
  medecin: [
    { key: 'dashboard', label: 'Tableau de bord' },
    { key: 'consultations', label: 'Consultations' },
    { key: 'feuilles', label: 'Feuilles de maladie' },
    { key: 'prescriptions', label: 'Prescriptions' },
    { key: 'parametres', label: 'Paramètres' },
  ],
};
