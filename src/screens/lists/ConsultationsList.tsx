import { Box } from '../../components/ui/Box';
import { consultations } from '../../data/sampleData';

const TH = ['N°', 'Patient', 'Date', 'Motif', 'Type', 'Suite'];

export function ConsultationsList() {
  return (
    <div>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 13, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--csi-surface-2)', color: 'var(--csi-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {TH.map((h) => <th key={h} style={{ padding: '12px 14px', fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {consultations.map((c) => (
              <Box as="tr" key={c.id} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{c.id}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{c.patient}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{c.date}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{c.motif}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{c.type}</td>
                <td style={{ padding: '13px 14px', color: '#2c4a86', fontWeight: 500 }}>{c.suite}</td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
