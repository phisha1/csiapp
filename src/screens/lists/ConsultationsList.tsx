import { Box } from '../../components/ui/Box';
import { useFetch } from '../../lib/useApi';

const TH = ['N°', 'Patient', 'Date', 'Motif', 'Type', 'Suite'];

interface ApiConsultation {
  id: string;
  date: string;
  motif: string | null;
  type: 'GENERALISTE' | 'SPECIALISTE';
  suite: string | null;
  assure: { personne: { nom: string; prenom: string } };
}

export function ConsultationsList() {
  const { data, loading, error } = useFetch<{ items: ApiConsultation[] }>('/consultations?limit=100');
  const rows = data?.items ?? [];

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
            {loading && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Chargement…</td></tr>}
            {error && !loading && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: '#8b2231', fontSize: 13 }}>Erreur : {error}</td></tr>}
            {!loading && !error && rows.length === 0 && <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Aucune consultation.</td></tr>}
            {rows.map((c) => (
              <Box as="tr" key={c.id} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{c.id.slice(0, 8)}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{c.assure.personne.nom} {c.assure.personne.prenom}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{c.date ? c.date.slice(0, 10) : ''}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{c.motif ?? '—'}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{c.type === 'SPECIALISTE' ? 'Spécialiste' : 'Généraliste'}</td>
                <td style={{ padding: '13px 14px', color: '#2c4a86', fontWeight: 500 }}>{c.suite ?? '—'}</td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
