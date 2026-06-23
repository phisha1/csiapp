import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { css } from '../../lib/css';
import { useFetch } from '../../lib/useApi';
import type { Medecin } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const TH = ['N° Ordre', 'Médecin', 'Type', 'Spécialité', 'Établissement', 'Patients'];
const norm = (x: string) => x.toLowerCase();

interface ApiMedecin {
  id: string;
  numOrdre: string;
  type: 'GENERALISTE' | 'SPECIALISTE';
  etablissement: string | null;
  specialite: { libelle: string } | null;
  personne: { nom: string; prenom: string; telephone: string | null; email: string | null };
  _count?: { patientsTraites: number };
}

function mapMedecin(m: ApiMedecin): Medecin {
  return {
    id: m.numOrdre,
    dbId: m.id,
    nom: `${m.personne.nom} ${m.personne.prenom}`,
    spec: m.specialite?.libelle ?? '—',
    type: m.type === 'SPECIALISTE' ? 'Spécialiste' : 'Généraliste',
    etab: m.etablissement ?? '—',
    tel: m.personne.telephone ?? '',
    email: m.personne.email ?? '',
    patients: m._count?.patientsTraites ?? 0,
  };
}

const typeBadge = (type: string) =>
  type === 'Généraliste'
    ? 'display:inline-flex;background:#e8eefb;color:#2c4a86;border:1px solid #cfdcf4;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;'
    : 'display:inline-flex;background:#f3ecf0;color:#7d2433;border:1px solid #e3d0da;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;';

export function MedecinsList() {
  const { listQ, acOpen, setListQ, setAcOpen, openDetail, go, dataVersion } = useAppStore();
  const { data, loading, error } = useFetch<{ items: ApiMedecin[] }>(`/medecins?limit=100&_v=${dataVersion}`);
  const all = (data?.items ?? []).map(mapMedecin);

  const q = listQ.medecins.trim();
  const rows = q ? all.filter((m) => norm(`${m.nom} ${m.id} ${m.spec} ${m.etab}`).includes(norm(q))) : all;
  const open = acOpen === 'medecins' && q.length > 0;
  const sugg = rows.slice(0, 2);

  return (
    <div>
      <div className="csi-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <input
            value={listQ.medecins}
            onChange={(e) => setListQ('medecins', e.target.value)}
            onFocus={() => setAcOpen('medecins')}
            onBlur={() => setTimeout(() => setAcOpen(null), 160)}
            autoComplete="off"
            placeholder="Rechercher un médecin…"
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }}
          />
          {open && sugg.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 25, overflow: 'hidden', animation: 'csiPop .16s ease' }}>
              {sugg.map((m) => (
                <div key={m.id} onMouseDown={() => openDetail({ type: 'medecin', data: m })} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 7, background: '#f8f1f3', color: '#7d2433', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 30px' }}><Icon name="stethoscope" size={15} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--csi-text)' }}>{m.nom}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--csi-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{m.id} · {m.spec}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {open && sugg.length === 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 25, padding: '12px 14px', fontSize: 12.5, color: '#8b3a2e' }}>Aucun médecin trouvé.</div>
          )}
        </div>
        <Box as="button" onClick={() => go('medecin_new')} sx="padding:10px 16px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;white-space:nowrap;" hover="background:var(--csi-primary-hover);">＋ Enregistrer un médecin</Box>
      </div>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 13, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--csi-surface-2)', color: 'var(--csi-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {TH.map((h) => <th key={h} style={{ padding: '12px 14px', fontWeight: 600 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Chargement…</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: '#8b2231', fontSize: 13 }}>Erreur : {error}</td></tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Aucun médecin.</td></tr>
            )}
            {rows.map((m) => (
              <Box as="tr" key={m.id} onClick={() => openDetail({ type: 'medecin', data: m })} sx="border-top:1px solid var(--csi-border);font-size:13px;cursor:pointer;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{m.id}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{m.nom}</td>
                <td style={{ padding: '13px 14px' }}><span style={css(typeBadge(m.type))}>{m.type}</span></td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{m.spec}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{m.etab}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{m.patients > 0 ? m.patients : '—'}</td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
