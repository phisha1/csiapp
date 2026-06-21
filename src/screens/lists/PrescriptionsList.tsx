import { Box } from '../../components/ui/Box';
import { css } from '../../lib/css';
import { prescriptions } from '../../data/sampleData';
import { useAppStore } from '../../store/useAppStore';

const TH = ['N°', 'Patient', 'Médecin', 'Date', 'Type', 'Détail'];

const typeBadge = (type: string) =>
  type === 'Médicaments'
    ? 'display:inline-flex;background:#e6f4ec;color:#1f8a4c;border:1px solid #bfe3cd;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;'
    : 'display:inline-flex;background:#f3ecf0;color:#7d2433;border:1px solid #e3d0da;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;';

export function PrescriptionsList() {
  const { openWith } = useAppStore();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 18 }}>
        <Box as="button" onClick={() => openWith('prescrire_specialiste', 'prescrire_specialiste')} sx="padding:10px 16px;background:var(--csi-surface);color:var(--csi-text);border:1px solid var(--csi-border);border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="border-color:var(--csi-text);">Consultation spécialiste</Box>
        <Box as="button" onClick={() => openWith('prescrire_medicament', 'prescrire_medicament')} sx="padding:10px 16px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">＋ Prescrire un médicament</Box>
      </div>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 13, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--csi-surface-2)', color: 'var(--csi-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {TH.map((h) => <th key={h} style={{ padding: '12px 14px', fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <Box as="tr" key={p.id} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{p.id}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{p.patient}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{p.medecin}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{p.date}</td>
                <td style={{ padding: '13px 14px' }}><span style={css(typeBadge(p.type))}>{p.type}</span></td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{p.detail}</td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
