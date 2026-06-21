import { css } from '../../lib/css';
import { badgeFor } from '../../lib/format';

/** Badge de statut coloré selon l'état (Créée, Complétée, Remboursée, …). */
export function Badge({ etat }: { etat: string }) {
  return <span style={css(badgeFor(etat))}>{etat}</span>;
}
