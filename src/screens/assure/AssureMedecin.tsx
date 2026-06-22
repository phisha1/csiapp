import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { assures, generalistesTraitants } from '../../data/sampleData';
import { useAppStore } from '../../store/useAppStore';

const norm = (x: string) => x.toLowerCase();

export function AssureMedecin() {
  const { assureFound, traitAssure, traitSel, selectTraitAssure, setTraitSel, openMedConfirm, showToast } = useAppStore();
  const [query, setQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);

  const q = query.trim();
  const matches = q ? assures.filter((a) => norm(`${a.nom} ${a.prenom} ${a.id} ${a.profession}`).includes(norm(q))) : [];
  const sugg = matches.slice(0, 3);
  const open = acOpen && q.length > 0;

  const pick = (id: string) => {
    const a = assures.find((x) => x.id === id);
    if (a) {
      selectTraitAssure(a);
      setQuery(a.id);
      setAcOpen(false);
    }
  };
  const onSearch = () => {
    if (matches.length) pick(matches[0].id);
    else showToast(`Aucun assuré ne correspond à « ${query} »`);
  };

  const a = traitAssure;
  const hasTraitant = !!a && a.traitant !== '—' && a.traitant !== '';
  const initials = a ? (a.nom[0] || '') + (a.prenom[0] || '') : '';

  const selObj = generalistesTraitants.find((m) => m.id === traitSel);
  const isSameAsCurrent = !!selObj && selObj.nom === a?.traitant;
  const canConfirm = !!selObj && !isSameAsCurrent;

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>1 · Rechercher l'assuré</h3>
        <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 16px' }}>Recherchez par nom, identifiant ou profession — les suggestions apparaissent à la saisie.</p>
        <div className="csi-toolbar" style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAcOpen(true); }}
              onFocus={() => setAcOpen(true)}
              onBlur={() => setTimeout(() => setAcOpen(false), 160)}
              autoComplete="off"
              placeholder="Ex : ASS-2024-0142, Mbarga, Enseignant…"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }}
            />
            {open && sugg.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, overflow: 'hidden', animation: 'csiPop .18s ease' }}>
                {sugg.map((it) => (
                  <div key={it.id} onMouseDown={() => pick(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}><Icon name="user" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--csi-text)' }}>{it.nom} {it.prenom}</div>
                      <div style={{ fontSize: 12, color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace" }}>{it.id} · {it.profession}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {open && sugg.length === 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, padding: 14, fontSize: 13, color: '#8b3a2e' }}>Aucun assuré trouvé — vérifiez le nom ou l'identifiant.</div>
            )}
          </div>
          <button onClick={onSearch} style={{ padding: '11px 22px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Rechercher</button>
        </div>
      </div>

      {assureFound && a && (
        <div style={{ animation: 'csiFade .35s ease' }}>
          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--csi-text)' }}>{a.nom} {a.prenom}</div>
              <div style={{ fontSize: 13, color: 'var(--csi-text-2)', marginTop: 2 }}>{a.id} · {a.sexe === 'M' ? 'Masculin' : 'Féminin'} · {a.groupe} · {a.profession}</div>
            </div>
            {hasTraitant ? (
              <span style={{ background: '#e6f4ec', color: '#1f8a4c', border: '1px solid #bfe3cd', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Traitant : {a.traitant}</span>
            ) : (
              <span style={{ background: '#fdf6e3', color: '#9a7611', border: '1px solid #eedfb0', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Sans médecin traitant</span>
            )}
          </div>

          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>2 · {hasTraitant ? 'Changer le médecin traitant' : 'Sélectionner un médecin généraliste'}</h3>
            <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 14px' }}>{hasTraitant ? 'Cet assuré a déjà un médecin traitant. Sélectionnez-en un autre pour le remplacer.' : 'Seuls les médecins généralistes peuvent être désignés comme traitants.'}</p>
            {hasTraitant && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: '#fdf8ef', border: '1px solid #f0e2c8', borderRadius: 9, padding: '10px 13px', marginBottom: 16, fontSize: 12.5, color: '#8a6510' }}>
                <span>ℹ</span><span>Association déjà existante avec <b>{a.traitant}</b> — la confirmation remplacera le médecin traitant actuel.</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {generalistesTraitants.map((m) => {
                const isCurrent = m.nom === a.traitant;
                const selected = traitSel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setTraitSel(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderRadius: 11, cursor: 'pointer', transition: 'all .15s', ...(selected ? { border: '1.5px solid var(--csi-primary)', background: 'var(--csi-surface-2)' } : { border: '1.5px solid var(--csi-border)', background: 'var(--csi-surface)' }) }}
                  >
                    <span style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${selected ? 'var(--csi-primary)' : '#c2cad6'}`, flex: '0 0 17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selected && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--csi-primary)' }} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--csi-text)' }}>{m.nom}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)' }}>{m.id} · Généraliste · {m.etab}</div>
                    </div>
                    <span style={isCurrent ? { background: '#fdf0e3', color: '#b9650f', border: '1px solid #f0d3ad', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 } : { background: '#e8eefb', color: '#2c4a86', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
                      {isCurrent ? 'Actuel' : 'Généraliste'}
                    </span>
                  </div>
                );
              })}
              <label style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', border: '1.5px solid #f0d9d9', background: '#fdf6f6', borderRadius: 11, cursor: 'not-allowed', opacity: 0.7 }}>
                <input type="radio" name="med" disabled style={{ width: 17, height: 17 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#8b3a2e' }}>Dr. Mballa</div>
                  <div style={{ fontSize: 12.5, color: '#b5746a' }}>MED-052 · Spécialiste — non éligible comme traitant</div>
                </div>
                <span style={{ background: '#fbecec', color: '#8b2231', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>Spécialiste</span>
              </label>
            </div>

            {isSameAsCurrent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fbf0ee', border: '1px solid #eccfca', borderRadius: 9, padding: '10px 13px', marginTop: 14, fontSize: 12.5, color: '#8b3a2e' }}>
                <span>⚠</span> Ce médecin est déjà le traitant actuel — choisissez-en un autre pour effectuer un changement.
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={openMedConfirm}
                disabled={!canConfirm}
                style={{ padding: '11px 24px', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', ...(canConfirm ? { background: 'var(--csi-primary)', cursor: 'pointer' } : { background: '#9aa6b6', cursor: 'not-allowed' }) }}
              >
                {hasTraitant ? 'Remplacer le médecin traitant' : 'Associer le médecin traitant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
