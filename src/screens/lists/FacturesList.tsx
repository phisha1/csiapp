import { Box } from '../../components/ui/Box';
import { Badge } from '../../components/ui/Badge';
import { factures } from '../../data/sampleData';
import { fmt } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';

const TH = ['N° Facture', 'Assuré', 'Feuille', 'Montant remboursé', 'Date', 'Statut', ''];

export function FacturesList() {
  const { openWith, goFacture } = useAppStore();
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
            {factures.map((f) => (
              <Box as="tr" key={f.id} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{f.id}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{f.assure}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{f.feuille}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{fmt(f.montant)}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{f.date}</td>
                <td style={{ padding: '13px 14px' }}><Badge etat={f.statut} /></td>
                <td style={{ padding: '13px 14px' }}>
                  <button onClick={() => goFacture(f)} style={{ padding: '6px 12px', background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid #dde3ec', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Voir</button>
                </td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
