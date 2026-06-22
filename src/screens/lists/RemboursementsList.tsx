import { Box } from '../../components/ui/Box';
import { Badge } from '../../components/ui/Badge';
import { fmt } from '../../lib/format';
import { useFetch } from '../../lib/useApi';
import { useAppStore } from '../../store/useAppStore';

const TH = ['Référence', 'Assuré', 'Feuille', 'Montant', 'Taux', 'Mode', 'Statut'];

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  EFFECTUE: 'Effectué',
  ECHOUE: 'Échoué',
};

interface ApiRemboursement {
  id: string;
  reference: string;
  montant: string;
  taux: number;
  mode: 'ESPECES' | 'VIREMENT';
  statut: string;
  feuille: { code: string };
  assure: { personne: { nom: string; prenom: string } };
}

export function RemboursementsList() {
  const { openWith } = useAppStore();
  const { data, loading, error } = useFetch<{ items: ApiRemboursement[] }>('/remboursements?limit=100');
  const rows = data?.items ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Box as="button" onClick={() => openWith('remboursement_new', 'remboursement_new')} sx="padding:10px 16px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">＋ Effectuer un remboursement</Box>
      </div>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 13, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--csi-surface-2)', color: 'var(--csi-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {TH.map((h) => <th key={h} style={{ padding: '12px 14px', fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Chargement…</td></tr>}
            {error && !loading && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: '#8b2231', fontSize: 13 }}>Erreur : {error}</td></tr>}
            {!loading && !error && rows.length === 0 && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Aucun remboursement.</td></tr>}
            {rows.map((r) => (
              <Box as="tr" key={r.id} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{r.reference}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{r.assure.personne.nom} {r.assure.personne.prenom}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{r.feuille.code}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{fmt(Number(r.montant))}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{r.taux} %</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{r.mode === 'VIREMENT' ? 'Virement' : 'Espèces'}</td>
                <td style={{ padding: '13px 14px' }}><Badge etat={STATUT_LABEL[r.statut] ?? r.statut} /></td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
