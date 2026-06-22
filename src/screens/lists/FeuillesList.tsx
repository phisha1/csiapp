import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { css } from '../../lib/css';
import { fmt, badgeFor } from '../../lib/format';
import { useFetch } from '../../lib/useApi';
import type { Feuille } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const TH = ['Code', 'Assuré', 'Médecin', 'Date', 'Diagnostic', 'Montant', 'État'];
const norm = (x: string) => x.toLowerCase();

const ETAT_LABEL: Record<string, string> = {
  BROUILLON: 'Brouillon',
  TRANSMISE: 'Transmise',
  EN_COURS: 'En cours de traitement',
  INCOMPLETE: 'Incomplète',
  VALIDEE: 'Validée',
  REMBOURSEE: 'Remboursée',
  REFUSEE: 'Refusée',
  SUPPRIMEE: 'Supprimée',
};

interface ApiFeuille {
  id: string;
  code: string;
  date: string;
  diagnostic: string | null;
  montant: string;
  etat: string;
  taux: number | null;
  assure: { personne: { nom: string; prenom: string } };
  medecin: { personne: { nom: string; prenom: string } };
}

function mapFeuille(f: ApiFeuille): Feuille {
  return {
    code: f.code,
    assure: `${f.assure.personne.nom} ${f.assure.personne.prenom}`,
    medecin: `${f.medecin.personne.nom} ${f.medecin.personne.prenom}`,
    date: f.date ? f.date.slice(0, 10) : '',
    diag: f.diagnostic ?? '',
    montant: Number(f.montant),
    etat: ETAT_LABEL[f.etat] ?? f.etat,
    taux: f.taux ?? undefined,
  };
}

export function FeuillesList() {
  const { role, listQ, acOpen, setListQ, setAcOpen, openWith } = useAppStore();
  const { data, loading, error } = useFetch<{ items: ApiFeuille[] }>('/feuilles?limit=100');
  const all = (data?.items ?? []).map(mapFeuille);

  const q = listQ.feuilles.trim();
  const rows = q ? all.filter((f) => norm(`${f.code} ${f.assure} ${f.diag}`).includes(norm(q))) : all;
  const open = acOpen === 'feuilles' && q.length > 0;
  const sugg = rows.slice(0, 2);

  return (
    <div>
      <div className="csi-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <input
              value={listQ.feuilles}
              onChange={(e) => setListQ('feuilles', e.target.value)}
              onFocus={() => setAcOpen('feuilles')}
              onBlur={() => setTimeout(() => setAcOpen(null), 160)}
              autoComplete="off"
              placeholder="Code feuille, assuré…"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }}
            />
            {open && sugg.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 25, overflow: 'hidden', animation: 'csiPop .16s ease' }}>
                {sugg.map((f) => (
                  <div key={f.code} onMouseDown={() => setListQ('feuilles', f.code)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 13px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 30px' }}><Icon name="file" size={15} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{f.code}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--csi-muted)' }}>{f.assure} · {f.diag}</div>
                    </div>
                    <span style={css(badgeFor(f.etat))}>{f.etat}</span>
                  </div>
                ))}
              </div>
            )}
            {open && sugg.length === 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 25, padding: '12px 14px', fontSize: 12.5, color: '#8b3a2e' }}>Aucune feuille trouvée.</div>
            )}
          </div>
          <select style={{ padding: '10px 12px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontFamily: 'inherit', color: 'var(--csi-text-2)', background: 'var(--csi-surface)' }}>
            <option>Tous les états</option><option>Brouillon</option><option>Transmise</option><option>En cours de traitement</option><option>Incomplète</option><option>Validée</option><option>Remboursée</option><option>Refusée</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {role === 'assureur' ? (
            <Box as="button" onClick={() => openWith('feuille_complete', 'feuille_complete')} sx="padding:10px 16px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">Compléter une feuille</Box>
          ) : (
            <Box as="button" onClick={() => openWith('feuille_new', 'feuille_new')} sx="padding:10px 16px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:13.5px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">＋ Enregistrer une feuille</Box>
          )}
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
              <tr><td colSpan={TH.length} style={{ padding: '16px 14px', color: 'var(--csi-muted)', fontSize: 13 }}>Aucune feuille.</td></tr>
            )}
            {rows.map((f) => (
              <Box as="tr" key={f.code} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)' }}>{f.code}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{f.assure}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{f.medecin}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{f.date}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{f.diag}</td>
                <td style={{ padding: '13px 14px', color: 'var(--csi-text)', fontWeight: 600 }}>{fmt(f.montant)}</td>
                <td style={{ padding: '13px 14px' }}><Badge etat={f.etat} /></td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
