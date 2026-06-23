import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { useFetch } from '../../lib/useApi';
import type { Assure } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const TH = ['Identifiant', 'Assuré', 'Sexe', 'Profession', 'Groupe', 'Médecin traitant', 'Statut'];
const norm = (x: string) => x.toLowerCase();

interface ApiAssure {
  id: string;
  matricule: string;
  numeroSecu: string | null;
  profession: string | null;
  employeur: string | null;
  groupe: string | null;
  statut: string;
  modeRembPref: 'ESPECES' | 'VIREMENT';
  personne: { nom: string; prenom: string; sexe: 'M' | 'F'; dateNaissance: string; telephone: string | null; email: string | null; medecin?: { id: string } | null };
  traitant: { personne: { nom: string; prenom: string } } | null;
}

type AssureRow = Assure & { aussiMedecin: boolean };

function mapAssure(a: ApiAssure): AssureRow {
  return {
    id: a.matricule,
    dbId: a.id,
    nom: a.personne.nom,
    prenom: a.personne.prenom,
    sexe: a.personne.sexe,
    naissance: a.personne.dateNaissance ? a.personne.dateNaissance.slice(0, 10) : '',
    profession: a.profession ?? '',
    groupe: a.groupe ?? '',
    traitant: a.traitant ? `${a.traitant.personne.nom} ${a.traitant.personne.prenom}` : '—',
    statut: a.statut ?? '',
    numeroSecu: a.numeroSecu ?? '',
    telephone: a.personne.telephone ?? '',
    email: a.personne.email ?? '',
    employeur: a.employeur ?? '',
    modeRembPref: a.modeRembPref,
    aussiMedecin: !!a.personne.medecin,
  };
}

export function AssuresList() {
  const { listQ, acOpen, setListQ, setAcOpen, openDetail, openWith, dataVersion } = useAppStore();
  const { data, loading, error } = useFetch<{ items: ApiAssure[] }>(`/assures?limit=100&_v=${dataVersion}`);
  const all = (data?.items ?? []).map(mapAssure);

  const q = listQ.assures.trim();
  const rows = q ? all.filter((a) => norm(`${a.nom} ${a.prenom} ${a.id} ${a.profession}`).includes(norm(q))) : all;
  const open = acOpen === 'assures' && q.length > 0;
  const sugg = rows.slice(0, 2);

  return (
    <div>
      <div className="csi-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <input
              value={listQ.assures}
              onChange={(e) => setListQ('assures', e.target.value)}
              onFocus={() => setAcOpen('assures')}
              onBlur={() => setTimeout(() => setAcOpen(null), 160)}
              autoComplete="off"
              placeholder="Rechercher par nom ou identifiant…"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }}
            />
            {open && sugg.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 25, overflow: 'hidden', animation: 'csiPop .16s ease' }}>
                {sugg.map((a) => (
                  <div key={a.id} onMouseDown={() => openDetail({ type: 'assure', data: a })} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 30px' }}><Icon name="user" size={15} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--csi-text)' }}>{a.nom} {a.prenom}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--csi-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{a.id} · {a.profession}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {open && sugg.length === 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 25, padding: '12px 14px', fontSize: 12.5, color: '#8b3a2e' }}>Aucun assuré trouvé.</div>
            )}
          </div>
          <select style={{ padding: '10px 12px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontFamily: 'inherit', color: 'var(--csi-text-2)', background: 'var(--csi-surface)' }}>
            <option>Tous les statuts</option><option>Actif</option><option>En attente</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Box as="button" onClick={() => openWith('assure_medecin', 'assure_medecin')} sx="padding:10px 16px;background:var(--csi-surface);color:var(--csi-text);border:1px solid var(--csi-border);border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="border-color:var(--csi-text);">Affecter médecin traitant</Box>
          <Box as="button" onClick={() => openWith('assure_new', 'assure_new')} sx="padding:10px 16px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">＋ Inscrire un assuré</Box>
        </div>
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
              <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Aucun assuré.</td></tr>
            )}
            {rows.map((a) => (
              <Box as="tr" key={a.id} onClick={() => openDetail({ type: 'assure', data: a })} sx="border-top:1px solid var(--csi-border);font-size:13px;cursor:pointer;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{a.id}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>
                  {a.nom} {a.prenom}
                  {a.aussiMedecin && <span style={{ marginLeft: 8, background: '#f3ecf0', color: '#7d2433', border: '1px solid #e3d0da', padding: '1px 8px', borderRadius: 20, fontSize: 10.5, fontWeight: 600 }}>aussi médecin</span>}
                </td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{a.sexe === 'M' ? 'Masculin' : 'Féminin'}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{a.profession}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace" }}>{a.groupe}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{a.traitant}</td>
                <td style={{ padding: '13px 14px' }}><Badge etat={a.statut} /></td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
