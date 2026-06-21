import { useState, type CSSProperties } from 'react';
import { Icon } from '../../components/ui/Icon';
import { assures, banks, feuilles } from '../../data/sampleData';
import { fmt } from '../../lib/format';
import { useAppStore, validateRembBank } from '../../store/useAppStore';
import type { Feuille, RembBank } from '../../types';

const STEPS = [
  { n: 1, t: 'Assuré' }, { n: 2, t: 'Dossier' }, { n: 3, t: 'Mode' }, { n: 4, t: 'Montant' }, { n: 5, t: 'Confirmer' }, { n: 6, t: 'Mise à jour' },
];

const btnNavy: CSSProperties = { padding: '11px 24px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };
const btnGhost: CSSProperties = { padding: '11px 20px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };
const h3S: CSSProperties = { fontSize: 16, color: 'var(--csi-text)', margin: '0 0 16px', fontFamily: "'IBM Plex Serif', serif" };
const labelXS: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 6 };

const norm = (x: string) => x.toLowerCase();
const initialsOf = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const tauxOf = (f: Feuille) => f.taux ?? 80;
const rembOf = (f: Feuille) => Math.round((f.montant * tauxOf(f)) / 100);

function bkStyle(hasErr: boolean, mono = false): CSSProperties {
  return { width: '100%', padding: '11px 13px', border: `1.5px solid ${hasErr ? '#cc3b3b' : 'var(--csi-border)'}`, borderRadius: 9, fontSize: 14, fontFamily: mono ? "'IBM Plex Mono', monospace" : 'inherit', outline: 'none', background: hasErr ? '#fdf6f6' : 'var(--csi-surface)', color: 'var(--csi-text)' };
}

function modeCardStyle(kind: 'especes' | 'virement', mode: string | null): CSSProperties {
  const on = mode === kind;
  const base: CSSProperties = { flex: 1, padding: 20, borderRadius: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all .18s', background: 'var(--csi-surface)', border: '2px solid var(--csi-border)' };
  if (!on) return base;
  if (kind === 'especes') return { ...base, border: '2px solid #1f8a4c', background: 'var(--csi-surface-2)', boxShadow: '0 4px 14px rgba(31,138,76,.12)' };
  return { ...base, border: '2px solid #2c4a86', background: 'var(--csi-surface-2)', boxShadow: '0 4px 14px rgba(44,74,134,.12)' };
}

// Seuls les assurés ayant une feuille « Validée » sont remboursables (rapport : feuille validée → Remboursée).
const valides = feuilles.filter((f) => f.etat === 'Validée');

export function RemboursementNew() {
  const s = useAppStore();
  const { rembStep, rembMode, rembBankState, rembBank, rembBankTried } = s;
  const bankErrs = validateRembBank(rembBank, rembMode);
  const showBkErr = (k: keyof RembBank) => (rembBankTried ? bankErrs[k] || '' : '');

  const [query, setQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);
  const [selAssure, setSelAssure] = useState<string | null>(null);
  const [selFeuille, setSelFeuille] = useState<Feuille | null>(null);

  // Options = assurés distincts ayant ≥1 feuille validée
  const names = [...new Set(valides.map((f) => f.assure))];
  const options = names.map((name) => {
    const rec = assures.find((a) => `${a.nom} ${a.prenom}` === name);
    const fs = valides.filter((f) => f.assure === name);
    return { name, rec, count: fs.length };
  });
  const q = query.trim();
  const filtered = q ? options.filter((o) => norm(`${o.name} ${o.rec?.id ?? ''} ${o.rec?.profession ?? ''}`).includes(norm(q))) : options;
  const open = acOpen && filtered.length >= 0;
  const dossiers = selAssure ? valides.filter((f) => f.assure === selAssure) : [];

  const pickAssure = (name: string) => {
    const rec = assures.find((a) => `${a.nom} ${a.prenom}` === name);
    const fs = valides.filter((f) => f.assure === name);
    setSelAssure(name);
    setSelFeuille(fs[0] ?? null);
    setQuery(name);
    setAcOpen(false);
    s.setRembBank('titulaire', rec ? `${rec.nom} ${rec.prenom}` : name);
  };

  const selRec = selAssure ? assures.find((a) => `${a.nom} ${a.prenom}` === selAssure) : undefined;
  const montant = selFeuille ? selFeuille.montant : 0;
  const taux = selFeuille ? tauxOf(selFeuille) : 0;
  const mr = selFeuille ? rembOf(selFeuille) : 0;

  const next1 = () => {
    if (!selAssure) { s.showToast('Sélectionnez un assuré ayant une feuille validée'); return; }
    s.rembNext();
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: '24px 26px' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
          {STEPS.map((st) => {
            const done = rembStep > st.n;
            const active = rembStep === st.n;
            return (
              <div key={st.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 30px', ...(done ? { background: '#1f8a4c', color: '#fff' } : active ? { background: 'var(--csi-primary)', color: '#fff' } : { background: 'var(--csi-border)', color: 'var(--csi-muted)' }) }}>
                  {done ? '✓' : st.n}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: active ? 600 : 500, color: rembStep >= st.n ? 'var(--csi-text)' : '#94a0b2', marginTop: 6 }}>{st.t}</div>
              </div>
            );
          })}
        </div>

        <div style={{ minHeight: 220 }}>
          {rembStep === 1 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 1 · Identifier l'assuré</h3>
              <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 12px' }}>Seuls les assurés disposant d'une <b>feuille validée</b> peuvent être remboursés.</p>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setAcOpen(true); }}
                  onFocus={() => setAcOpen(true)}
                  onBlur={() => setTimeout(() => setAcOpen(false), 160)}
                  autoComplete="off"
                  placeholder="Rechercher un assuré (nom, identifiant, profession)…"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }}
                />
                {open && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, overflow: 'hidden', animation: 'csiPop .18s ease', maxHeight: 260, overflowY: 'auto' }}>
                    {filtered.length === 0 && <div style={{ padding: 14, fontSize: 13, color: '#8b3a2e' }}>Aucun assuré remboursable ne correspond.</div>}
                    {filtered.map((o) => (
                      <div key={o.name} onMouseDown={() => pickAssure(o.name)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                        <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}><Icon name="user" size={16} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--csi-text)' }}>{o.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace" }}>{o.rec?.id ?? '—'} · {o.rec?.profession ?? ''}</div>
                        </div>
                        <span style={{ background: '#e6f4ec', color: '#1f8a4c', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{o.count} feuille{o.count > 1 ? 's' : ''} validée{o.count > 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selAssure && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--csi-surface-2)', borderRadius: 11, animation: 'csiFade .25s ease' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 11, background: 'var(--csi-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initialsOf(selAssure)}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--csi-text)' }}>{selAssure}</div>
                    <div style={{ fontSize: 13, color: 'var(--csi-text-2)' }}>{selRec?.id ?? '—'} · {selRec?.profession ?? ''} · {dossiers.length} feuille(s) validée(s)</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {rembStep === 2 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 2 · Choisir le dossier (feuille validée)</h3>
              {dossiers.map((f) => {
                const sel = selFeuille?.code === f.code;
                return (
                  <label key={f.code} onClick={() => setSelFeuille(f)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', border: `1.5px solid ${sel ? 'var(--csi-primary)' : 'var(--csi-border)'}`, background: sel ? 'var(--csi-surface-2)' : 'var(--csi-surface)', borderRadius: 11, cursor: 'pointer', marginBottom: 10 }}>
                    <span style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${sel ? 'var(--csi-primary)' : '#c2cad6'}`, flex: '0 0 17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sel && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--csi-primary)' }} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{f.code} · {f.diag}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)' }}>Soins : {fmt(f.montant)} · Taux {tauxOf(f)} %</div>
                    </div>
                    <span style={{ background: '#e6f4ec', color: '#1f8a4c', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>Validée</span>
                  </label>
                );
              })}
            </div>
          )}

          {rembStep === 3 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 3 · Choisir le mode de paiement</h3>
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => s.setRembMode('especes')} style={modeCardStyle('especes', rembMode)}>
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Icon name="cash" size={32} stroke="#1f8a4c" width={1.6} /></div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--csi-text)' }}>Espèces</div>
                  <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)', marginTop: 4 }}>Paiement au guichet CNAM</div>
                </button>
                <button onClick={() => s.setRembMode('virement')} style={modeCardStyle('virement', rembMode)}>
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Icon name="bank" size={32} stroke="#2c4a86" width={1.6} /></div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--csi-text)' }}>Virement bancaire</div>
                  <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)', marginTop: 4 }}>Via le système bancaire partenaire</div>
                </button>
              </div>

              {rembMode === 'virement' && (
                <div style={{ marginTop: 18, border: '1px solid var(--csi-border)', borderRadius: 13, padding: 18, animation: 'csiFade .3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ display: 'inline-flex', color: '#2c4a86' }}><Icon name="bank" size={16} /></span>
                    <h4 style={{ fontSize: 14, color: 'var(--csi-text)', margin: 0, fontWeight: 700 }}>Coordonnées du compte de réception</h4>
                    <span style={{ fontSize: 11, background: '#fbecec', color: '#8b2231', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>Obligatoire</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--csi-muted)', margin: '0 0 16px' }}>Compte sur lequel le remboursement sera versé à l'assuré.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelXS}>Banque de réception *</label>
                      <select value={rembBank.banqueRecep} onChange={(e) => s.setRembBank('banqueRecep', e.target.value)} style={bkStyle(!!showBkErr('banqueRecep'))}>
                        <option value="">— Choisir une banque —</option>
                        {banks.map((b) => <option key={b}>{b}</option>)}
                      </select>
                      {showBkErr('banqueRecep') && <div style={{ fontSize: 11.5, color: '#cc3b3b', marginTop: 5 }}>⚠ {showBkErr('banqueRecep')}</div>}
                    </div>
                    <div>
                      <label style={labelXS}>Titulaire du compte *</label>
                      <input value={rembBank.titulaire} onChange={(e) => s.setRembBank('titulaire', e.target.value)} placeholder="Nom du titulaire" style={bkStyle(!!showBkErr('titulaire'))} />
                      {showBkErr('titulaire') && <div style={{ fontSize: 11.5, color: '#cc3b3b', marginTop: 5 }}>⚠ {showBkErr('titulaire')}</div>}
                    </div>
                  </div>
                  <div>
                    <label style={labelXS}>Numéro de compte / RIB de réception *</label>
                    <input value={rembBank.compteRecep} onChange={(e) => s.setRembBank('compteRecep', e.target.value)} placeholder="Ex : 10005 00012 12345678901 76" style={bkStyle(!!showBkErr('compteRecep'), true)} />
                    {showBkErr('compteRecep') && <div style={{ fontSize: 11.5, color: '#cc3b3b', marginTop: 5 }}>⚠ {showBkErr('compteRecep')}</div>}
                  </div>

                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px dashed var(--csi-border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={rembBank.useEmetteur} onChange={s.toggleEmetteur} style={{ width: 17, height: 17, accentColor: 'var(--csi-primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--csi-text)' }}>Renseigner le compte émetteur (CNAM) et la banque partenaire</span>
                      <span style={{ fontSize: 11, background: '#eef1f6', color: '#5a6678', padding: '2px 8px', borderRadius: 5 }}>Optionnel</span>
                    </label>
                    {rembBank.useEmetteur ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14, animation: 'csiFade .25s ease' }}>
                        <div>
                          <label style={labelXS}>Banque partenaire (émettrice)</label>
                          <select value={rembBank.banqueEmet} onChange={(e) => s.setRembBank('banqueEmet', e.target.value)} style={bkStyle(!!showBkErr('banqueEmet'))}>
                            {banks.map((b) => <option key={b}>{b}</option>)}
                          </select>
                          {showBkErr('banqueEmet') && <div style={{ fontSize: 11.5, color: '#cc3b3b', marginTop: 5 }}>⚠ {showBkErr('banqueEmet')}</div>}
                        </div>
                        <div>
                          <label style={labelXS}>Compte émetteur CNAM</label>
                          <input value={rembBank.compteEmet} onChange={(e) => s.setRembBank('compteEmet', e.target.value)} placeholder="Compte institutionnel" style={bkStyle(!!showBkErr('compteEmet'), true)} />
                          {showBkErr('compteEmet') && <div style={{ fontSize: 11.5, color: '#cc3b3b', marginTop: 5 }}>⚠ {showBkErr('compteEmet')}</div>}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--csi-muted)', lineHeight: 1.5 }}>Par défaut, le virement part du <b>compte institutionnel CNAM</b> via la banque partenaire configurée. Activez l'option ci-dessus pour préciser un compte émetteur spécifique.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {rembStep === 4 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 4 · Vérifier le montant</h3>
              <div style={{ background: 'var(--csi-surface-2)', borderRadius: 11, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}><span style={{ color: 'var(--csi-text-2)' }}>Montant des soins</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{fmt(montant)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}><span style={{ color: 'var(--csi-text-2)' }}>Taux de remboursement</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{taux} %</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 8, borderTop: '1px solid var(--csi-border)', fontSize: 16 }}><span style={{ fontWeight: 700, color: 'var(--csi-text)' }}>Montant à rembourser</span><span style={{ fontWeight: 700, color: '#1f8a4c' }}>{fmt(mr)}</span></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#eef4ee', border: '1px solid #cfe2cf', borderRadius: 9, padding: '11px 14px', marginTop: 14, fontSize: 13, color: '#2c5239' }}>✓ Montant cohérent et validé.</div>
            </div>
          )}

          {rembStep === 5 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 5 · Confirmation</h3>
              {rembMode === 'virement' && (
                <>
                  <div style={{ border: '1.5px solid #2c4a86', background: 'var(--csi-surface-2)', borderRadius: 13, padding: 18, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 9, background: '#2c4a86', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bank" size={20} stroke="#fff" width={1.7} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--csi-text)', fontSize: 14 }}>Système bancaire — Service externe</div>
                        <div style={{ fontSize: 12, color: 'var(--csi-text-2)' }}>Banque émettrice : {rembBank.useEmetteur ? rembBank.banqueEmet || '—' : 'CNAM (compte institutionnel par défaut)'}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 600 }}>
                        {rembBankState === 'idle' && <span style={{ background: '#eef1f6', color: '#5a6678', padding: '4px 11px', borderRadius: 20 }}>En attente</span>}
                        {rembBankState === 'processing' && <span style={{ background: '#fdf6e3', color: '#9a7611', padding: '4px 11px', borderRadius: 20 }}>Traitement…</span>}
                        {rembBankState === 'done' && <span style={{ background: '#e6f4ec', color: '#1f8a4c', padding: '4px 11px', borderRadius: 20 }}>Validé ✓</span>}
                      </span>
                    </div>
                    {rembBankState === 'processing' && (
                      <div style={{ height: 6, background: '#e3e8ef', borderRadius: 4, overflow: 'hidden', position: 'relative' }}><div style={{ position: 'absolute', top: 0, width: '30%', height: '100%', background: '#2c4a86', borderRadius: 4, animation: 'csiFlow 1.2s linear infinite' }} /></div>
                    )}
                    {rembBankState === 'idle' && (
                      <button onClick={s.runBank} style={{ width: '100%', padding: 10, background: '#2c4a86', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Initier le virement bancaire</button>
                    )}
                    {rembBankState === 'done' && (
                      <div style={{ fontSize: 13, color: '#2c5239', background: '#eef4ee', borderRadius: 8, padding: '10px 12px' }}>✓ Virement de {fmt(mr)} confirmé par le système bancaire. Réf. transaction TRX-88421.</div>
                    )}
                  </div>
                  <div style={{ border: '1px solid var(--csi-border)', borderRadius: 11, padding: '14px 16px', marginBottom: 16, background: 'var(--csi-surface-2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--csi-muted)', marginBottom: 10 }}>Compte de réception</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span style={{ color: 'var(--csi-text-2)' }}>Titulaire</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{rembBank.titulaire}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span style={{ color: 'var(--csi-text-2)' }}>Banque</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{rembBank.banqueRecep || '—'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span style={{ color: 'var(--csi-text-2)' }}>N° de compte</span><span style={{ fontWeight: 600, color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{rembBank.compteRecep || '—'}</span></div>
                  </div>
                </>
              )}
              {rembMode === 'especes' && (
                <div style={{ border: '1.5px solid #1f8a4c', background: 'var(--csi-surface-2)', borderRadius: 13, padding: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: '#1f8a4c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="cash" size={20} stroke="#fff" width={1.7} /></div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--csi-text)', fontSize: 14 }}>Paiement en espèces</div>
                    <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)' }}>Remboursement remis au guichet — aucune interaction bancaire.</div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 13, color: 'var(--csi-text-2)', lineHeight: 1.6 }}>Bénéficiaire : <b style={{ color: 'var(--csi-text)' }}>{selAssure}</b> · Feuille <b style={{ color: 'var(--csi-text)' }}>{selFeuille?.code}</b> · Montant <b style={{ color: '#1f8a4c' }}>{fmt(mr)}</b></div>
            </div>
          )}

          {rembStep === 6 && (
            <div style={{ textAlign: 'center', padding: '14px 0', animation: 'csiPop .4s ease' }}>
              <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#e6f4ec', color: '#1f8a4c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 33, margin: '0 auto 16px' }}>✓</div>
              <h3 style={{ fontSize: 18, color: 'var(--csi-text)', margin: '0 0 6px', fontFamily: "'IBM Plex Serif', serif" }}>Remboursement effectué</h3>
              <p style={{ fontSize: 13.5, color: 'var(--csi-text-2)', margin: '0 0 14px' }}>La feuille {selFeuille?.code} passe à l'état <b>Remboursée</b>.</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{ background: '#e6f4ec', color: '#1f8a4c', padding: '4px 11px', borderRadius: 20, fontWeight: 600 }}>Validée</span>
                <span style={{ color: '#c2cad6' }}>→</span>
                <span style={{ background: '#e6f4ec', color: '#1f8a4c', padding: '4px 11px', borderRadius: 20, fontWeight: 600 }}>Remboursée</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--csi-border)' }}>
          {rembStep === 1 && (<><span /><button onClick={next1} style={btnNavy}>Suivant →</button></>)}
          {rembStep === 2 && (<><button onClick={s.rembBack} style={btnGhost}>← Précédent</button><button onClick={s.rembNext} style={btnNavy}>Suivant →</button></>)}
          {rembStep === 3 && (<><button onClick={s.rembBack} style={btnGhost}>← Précédent</button><button onClick={s.rembNext3} style={btnNavy}>Suivant →</button></>)}
          {rembStep === 4 && (<><button onClick={s.rembBack} style={btnGhost}>← Précédent</button><button onClick={s.rembNext} style={btnNavy}>Suivant →</button></>)}
          {rembStep === 5 && (<><button onClick={s.rembBack} style={btnGhost}>← Précédent</button><button onClick={s.confirmRemb} style={{ ...btnNavy, background: '#1f8a4c' }}>Confirmer le remboursement ✓</button></>)}
          {rembStep === 6 && (<><span /><button onClick={s.finishRemb} style={btnNavy}>Générer la facture →</button></>)}
        </div>
      </div>
    </div>
  );
}
