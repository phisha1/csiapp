/** Formate un montant en FCFA avec séparateurs français. */
export function fmt(n: number): string {
  return Number(n).toLocaleString('fr-FR') + ' FCFA';
}

/**
 * Renvoie la chaîne de style d'un badge de statut (fond / texte / bordure).
 *
 * Les états de la feuille de maladie suivent le diagramme d'état-transition
 * du rapport (§1.2.4) : Brouillon → Transmise → En cours de traitement →
 * (Incomplète) → Validée → Remboursée ; alternatives Refusée, Supprimée.
 */
export function badgeFor(etat: string): string {
  const map: Record<string, [string, string, string]> = {
    // ----- cycle de vie de la feuille de maladie (rapport) -----
    Brouillon: ['#eef1f6', '#5a6678', '#dde3ec'],
    Transmise: ['#e8eefb', '#2c4a86', '#cfdcf4'],
    'En cours de traitement': ['#fdf6e3', '#9a7611', '#eedfb0'],
    Incomplète: ['#fdf0e3', '#b9650f', '#f0d3ad'],
    Validée: ['#e6f4ec', '#1f8a4c', '#bfe3cd'],
    Remboursée: ['#e6f4ec', '#1f8a4c', '#bfe3cd'],
    Refusée: ['#fbecec', '#8b2231', '#e7c3c8'],
    Supprimée: ['#eef1f6', '#5a6678', '#dde3ec'],
    // ----- remboursements / factures / assurés -----
    'En attente': ['#fdf6e3', '#9a7611', '#eedfb0'],
    Remboursé: ['#e6f4ec', '#1f8a4c', '#bfe3cd'],
    Validé: ['#e6f4ec', '#1f8a4c', '#bfe3cd'],
    Échec: ['#fbecec', '#8b2231', '#e7c3c8'],
    Émise: ['#e8eefb', '#2c4a86', '#cfdcf4'],
    Actif: ['#e6f4ec', '#1f8a4c', '#bfe3cd'],
    Suspendu: ['#fdf6e3', '#9a7611', '#eedfb0'],
  };
  const c = map[etat] || ['#eef1f6', '#5a6678', '#dde3ec'];
  return `display:inline-flex;align-items:center;gap:6px;background:${c[0]};color:${c[1]};border:1px solid ${c[2]};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;`;
}
