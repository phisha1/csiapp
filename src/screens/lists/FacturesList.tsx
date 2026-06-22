import { Box } from '../../components/ui/Box';
import { Badge } from '../../components/ui/Badge';
import { fmt } from '../../lib/format';
import { useFetch } from '../../lib/useApi';
import { apiBlob } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const TH = ['N° Facture', 'Assuré', 'Feuille', 'Montant remboursé', 'Date', 'Statut', ''];

interface ApiFacture {
  id: string;
  reference: string;
  montant: string;
  date: string;
  statut: string;
  feuille: { code: string };
  assure: { personne: { nom: string; prenom: string } };
}

export function FacturesList() {
  const { openWith, showToast } = useAppStore();
  const { data, loading, error } = useFetch<{ items: ApiFacture[] }>('/factures?limit=100');
  const rows = data?.items ?? [];

  const voirPdf = async (id: string) => {
    try {
      const blob = await apiBlob(`/factures/${id}/pdf`);
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      showToast('Impossible de générer le PDF de la facture.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Box as="button" onClick={() => openWith('facture_print', 'facture_print')} sx="padding:10px 16px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">Imprimer une facture</Box>
      </div>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 13, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--csi-surface-2)', color: 'var(--csi-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {TH.map((h, i) => <th key={i} style={{ padding: '12px 14px', fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Chargement…</td></tr>}
            {error && !loading && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: '#8b2231', fontSize: 13 }}>Erreur : {error}</td></tr>}
            {!loading && !error && rows.length === 0 && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Aucune facture.</td></tr>}
            {rows.map((f) => (
              <Box as="tr" key={f.id} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{f.reference}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{f.assure.personne.nom} {f.assure.personne.prenom}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{f.feuille.code}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{fmt(Number(f.montant))}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{f.date ? f.date.slice(0, 10) : ''}</td>
                <td style={{ padding: '13px 14px' }}><Badge etat={f.statut} /></td>
                <td style={{ padding: '13px 14px' }}>
                  <button onClick={() => voirPdf(f.id)} style={{ padding: '6px 12px', background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid #dde3ec', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>PDF</button>
                </td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
