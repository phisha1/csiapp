import { useState, type CSSProperties } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { css } from '../../lib/css';
import { fmt, badgeFor } from '../../lib/format';
import { useFetch } from '../../lib/useApi';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const labelS: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 };

const ETAT_LABEL: Record<string, string> = {
  TRANSMISE: 'Transmise',
  EN_COURS: 'En cours de traitement',
};

interface ApiFeuille {
  id: string;
  code: string;
  etat: string;
  diagnostic: string | null;
  montant: string;
  taux: number | null;
  assure: { personne: { nom: string; prenom: string } };
  medecin: { type: 'GENERALISTE' | 'SPECIALISTE'; personne: { nom: string; prenom: string } };
}

export function FeuilleComplete() {
  const { go, showToast } = useAppStore();
  const { data, loading } = useFetch<{ items: ApiFeuille[] }>('/feuilles?limit=100');
  const completables = (data?.items ?? []).filter((f) => f.etat === 'TRANSMISE' || f.etat === 'EN_COURS');

  const [query, setQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);
  const [sel, setSel] = useState<ApiFeuille | null>(null);
  const [busy, setBusy] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = q
    ? completables.filter(
        (f) => f.code.toLowerCase().includes(q) || `${f.assure.personne.nom} ${f.assure.personne.prenom}`.toLowerCase().includes(q),
      )
    : [];
  const sugg = matches.slice(0, 3);
  const showDropdown = acOpen && q.length > 0 && !(sel && sel.code.toLowerCase() === q);

  const pick = (f: ApiFeuille) => { setSel(f); setQuery(f.code); setAcOpen(false); };
  const onSearch = () => {
    if (matches.length) pick(matches[0]);
    else showToast(`Aucune feuille à compléter ne correspond à « ${query} »`);
  };

  const taux = sel ? (sel.medecin.type === 'SPECIALISTE' ? 80 : 100) : 0;

  const completer = async () => {
    if (!sel) return;
    setBusy(true);
    try {
      const res = await api.patch<{ code: string }>(`/feuilles/${sel.id}/completer`, {});
      showToast(`Feuille ${res.code} complétée — état : Validée`);
      go('feuilles');
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Échec de la complétion.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>Rechercher une feuille à compléter</h3>
        <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 16px' }}>Par <b>code de feuille</b> ou <b>nom de l'assuré</b>. Seules les feuilles <b>Transmises</b> ou <b>En cours</b> sont complétables.</p>
        <div className="csi-toolbar" style={{ display: 'flex', gap: 10, position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input value={query} onChange={(e) => { setQuery(e.target.value); setAcOpen(true); }} onFocus={() => setAcOpen(true)} onBlur={() => setTimeout(() => setAcOpen(false), 160)} placeholder="Ex : FM-2026-0001 ou Owona…" autoComplete="off" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }} />
            {showDropdown && sugg.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, overflow: 'hidden', animation: 'csiPop .18s ease' }}>
                {sugg.map((f) => (
                  <div key={f.id} onMouseDown={() => pick(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}><Icon name="file" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{f.code}</div>
                      <div style={{ fontSize: 12, color: 'var(--csi-text-2)' }}>{f.assure.personne.nom} {f.assure.personne.prenom} · {f.diagnostic ?? ''}</div>
                    </div>
                    <span style={css(badgeFor(ETAT_LABEL[f.etat] ?? f.etat))}>{ETAT_LABEL[f.etat] ?? f.etat}</span>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && sugg.length === 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, padding: 14, fontSize: 13, color: '#8b3a2e', animation: 'csiPop .18s ease' }}>Aucune feuille à compléter ne correspond.</div>
            )}
          </div>
          <button onClick={onSearch} style={{ padding: '11px 22px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Rechercher</button>
        </div>
        {loading && <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--csi-muted)' }}>Chargement des feuilles…</div>}
      </div>

      {sel && (
        <div style={{ animation: 'csiFade .35s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: 0 }}>Détails de la feuille</h3>
              <span style={css(badgeFor(ETAT_LABEL[sel.etat] ?? sel.etat))}>{ETAT_LABEL[sel.etat] ?? sel.etat}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Code</span><span style={{ fontWeight: 600, color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{sel.code}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Assuré</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{sel.assure.personne.nom} {sel.assure.personne.prenom}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Médecin</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{sel.medecin.personne.nom} {sel.medecin.personne.prenom}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Diagnostic</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{sel.diagnostic ?? '—'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Montant des soins</span><span style={{ fontWeight: 700, color: 'var(--csi-text)' }}>{fmt(Number(sel.montant))}</span></div>
            </div>
          </div>

          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22 }}>
            <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 12px' }}>Validation</h3>
            <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 14px', lineHeight: 1.6 }}>
              La complétion passe la feuille à l'état <b style={{ color: '#1f8a4c' }}>Validée</b> et fixe automatiquement le taux selon le type du médecin.
            </p>
            <div style={{ marginBottom: 18 }}>
              <label style={labelS}>Taux de remboursement (calculé)</label>
              <div style={{ padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 15, fontWeight: 700, color: 'var(--csi-text)', background: 'var(--csi-surface-2)' }}>
                {taux} % <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--csi-text-2)' }}>· {sel.medecin.type === 'SPECIALISTE' ? 'Spécialiste' : 'Généraliste'}</span>
              </div>
            </div>
            <Box as="button" onClick={completer} disabled={busy} sx={`width:100%;padding:12px;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;${busy ? 'background:#9aa6b6;cursor:not-allowed;' : 'background:var(--csi-primary);cursor:pointer;'}`} hover={busy ? '' : 'background:var(--csi-primary-hover);'}>{busy ? 'Validation…' : 'Compléter et valider la feuille'}</Box>
          </div>
        </div>
      )}
    </div>
  );
}
