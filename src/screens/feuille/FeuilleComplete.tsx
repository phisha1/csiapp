import type { CSSProperties } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { css } from '../../lib/css';
import { feuilles } from '../../data/sampleData';
import { fmt, badgeFor } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';

const labelS: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 };

export function FeuilleComplete() {
  const { completeQuery, completeSelected, completeFound, setCompleteQuery, pickCompleteFeuille, doComplete, showToast } = useAppStore();

  const q = completeQuery.trim().toLowerCase();
  const matches = q ? feuilles.filter((f) => f.code.toLowerCase().includes(q) || f.assure.toLowerCase().includes(q)) : [];
  const sugg = matches.slice(0, 2);
  const showDropdown = q.length > 0 && !(completeSelected && completeSelected.code.toLowerCase() === q);

  const onSearch = () => {
    if (sugg.length) pickCompleteFeuille(sugg[0]);
    else showToast(`Aucune feuille ne correspond à « ${completeQuery} »`);
  };

  const sel = completeSelected;

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>Rechercher une feuille de maladie</h3>
        <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 16px' }}>Recherchez par <b>code de feuille</b> ou <b>nom de l'assuré</b> — les suggestions apparaissent à la saisie.</p>
        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input value={completeQuery} onChange={(e) => setCompleteQuery(e.target.value)} placeholder="Ex : FM-2024-0890 ou Owona…" autoComplete="off" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }} />
            {showDropdown && sugg.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, overflow: 'hidden', animation: 'csiPop .18s ease' }}>
                {sugg.map((f) => (
                  <div key={f.code} onClick={() => pickCompleteFeuille(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}><Icon name="file" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{f.code}</div>
                      <div style={{ fontSize: 12, color: 'var(--csi-text-2)' }}>{f.assure} · {f.diag}</div>
                    </div>
                    <span style={css(badgeFor(f.etat))}>{f.etat}</span>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && sugg.length === 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, padding: 14, fontSize: 13, color: '#8b3a2e', animation: 'csiPop .18s ease' }}>Aucune feuille trouvée — vérifiez le code ou le nom de l'assuré.</div>
            )}
          </div>
          <button onClick={onSearch} style={{ padding: '11px 22px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Rechercher</button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--csi-muted)' }}>États alternatifs gérés :</span>
          <span style={{ fontSize: 11.5, background: '#fbecec', color: '#8b2231', padding: '2px 9px', borderRadius: 6 }}>Feuille introuvable</span>
          <span style={{ fontSize: 11.5, background: '#fdf6e3', color: '#9a7611', padding: '2px 9px', borderRadius: 6 }}>Déjà remboursée</span>
          <span style={{ fontSize: 11.5, background: '#fbf0ee', color: '#8b3a2e', padding: '2px 9px', borderRadius: 6 }}>Données invalides</span>
        </div>
      </div>

      {completeFound && sel && (
        <div style={{ animation: 'csiFade .35s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: 0 }}>Détails de la feuille</h3>
              <span style={css(badgeFor(sel.etat))}>{sel.etat}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Code</span><span style={{ fontWeight: 600, color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{sel.code}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Assuré</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{sel.assure}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Médecin</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{sel.medecin}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Diagnostic</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{sel.diag}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--csi-text-2)' }}>Montant des soins</span><span style={{ fontWeight: 700, color: 'var(--csi-text)' }}>{fmt(sel.montant)}</span></div>
            </div>
            {sel.etat === 'Remboursée' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fdf6e3', border: '1px solid #eedfb0', borderRadius: 9, padding: '10px 13px', marginTop: 14, fontSize: 12.5, color: '#8a6510' }}><span>⚠</span> Cette feuille est déjà remboursée — la complétion n'est plus nécessaire.</div>
            )}
          </div>

          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22 }}>
            <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 16px' }}>Informations de remboursement</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={labelS}>Taux de remboursement</label>
              <select style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', color: 'var(--csi-text-2)', background: 'var(--csi-surface)' }}><option>80 %</option><option>70 %</option><option>100 %</option></select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelS}>Montant remboursé (FCFA)</label>
              <input defaultValue="15 200" style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelS}>Mode de paiement</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1.5px solid var(--csi-primary)', background: 'var(--csi-surface-2)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--csi-text)' }}><input type="radio" name="mode" defaultChecked style={{ accentColor: 'var(--csi-primary)' }} /> 💵 Espèces</label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1.5px solid var(--csi-border)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--csi-text-2)' }}><input type="radio" name="mode" style={{ accentColor: 'var(--csi-primary)' }} /> 🏦 Virement</label>
              </div>
            </div>
            <Box as="button" onClick={doComplete} sx="width:100%;padding:12px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">Compléter la feuille</Box>
          </div>
        </div>
      )}
    </div>
  );
}
