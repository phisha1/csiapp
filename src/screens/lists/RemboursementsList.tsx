import { Box } from '../../components/ui/Box';
import { Badge } from '../../components/ui/Badge';
import { remboursements } from '../../data/sampleData';
import { fmt } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';

const TH = ['Référence', 'Assuré', 'Feuille', 'Montant', 'Taux', 'Mode', 'Statut'];

export function RemboursementsList() {
  const { openWith } = useAppStore();
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
            {remboursements.map((r) => (
              <Box as="tr" key={r.id} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{r.id}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{r.assure}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{r.feuille}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{r.montant ? fmt(r.montant) : '—'}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{r.taux}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{r.mode}</td>
                <td style={{ padding: '13px 14px' }}><Badge etat={r.statut} /></td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
