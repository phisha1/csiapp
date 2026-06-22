import { useState, type CSSProperties } from 'react';
import { Icon } from '../../components/ui/Icon';
import { fmt } from '../../lib/format';
import { useFetch } from '../../lib/useApi';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const STEPS = [
  { n: 1, t: 'Dossier' },
  { n: 2, t: 'Mode' },
  { n: 3, t: 'Confirmer' },
  { n: 4, t: 'Terminé' },
];

const btnNavy: CSSProperties = { padding: '11px 24px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };
const btnGhost: CSSProperties = { padding: '11px 20px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };
const h3S: CSSProperties = { fontSize: 16, color: 'var(--csi-text)', margin: '0 0 16px', fontFamily: "'IBM Plex Serif', serif" };

interface ApiFeuille {
  id: string;
  code: string;
  etat: string;
  diagnostic: string | null;
  montant: string;
  taux: number | null;
  assure: { matricule: string; personne: { nom: string; prenom: string } };
  medecin: { type: 'GENERALISTE' | 'SPECIALISTE'; personne: { nom: string; prenom: string } };
}

function modeCard(kind: 'ESPECES' | 'VIREMENT', mode: string | null): CSSProperties {
  const on = mode === kind;
  const base: CSSProperties = { flex: 1, padding: 20, borderRadius: 13, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all .18s', background: 'var(--csi-surface)', border: '2px solid var(--csi-border)' };
  if (!on) return base;
  return kind === 'ESPECES'
    ? { ...base, border: '2px solid #1f8a4c', background: 'var(--csi-surface-2)' }
    : { ...base, border: '2px solid #2c4a86', background: 'var(--csi-surface-2)' };
}

export function RemboursementNew() {
  const { go, showToast } = useAppStore();
  const { data, loading } = useFetch<{ items: ApiFeuille[] }>('/feuilles?limit=100');
  const valides = (data?.items ?? []).filter((f) => f.etat === 'VALIDEE');

  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);
  const [sel, setSel] = useState<ApiFeuille | null>(null);
  const [mode, setMode] = useState<'ESPECES' | 'VIREMENT' | null>(null);
  const [simuler, setSimuler] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ reference: string; mode: string; referenceBancaire: string | null } | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? valides.filter((f) => f.code.toLowerCase().includes(q) || `${f.assure.personne.nom} ${f.assure.personne.prenom}`.toLowerCase().includes(q))
    : valides;
  const open = acOpen;

  const taux = sel ? (sel.taux ?? (sel.medecin.type === 'SPECIALISTE' ? 80 : 100)) : 0;
  const montantSoins = sel ? Number(sel.montant) : 0;
  const mr = Math.round((montantSoins * taux) / 100);
  const assureNom = sel ? `${sel.assure.personne.nom} ${sel.assure.personne.prenom}` : '';

  const pick = (f: ApiFeuille) => { setSel(f); setQuery(f.code); setAcOpen(false); };
  const next1 = () => { if (!sel) { showToast('Sélectionnez une feuille validée'); return; } setStep(2); };
  const next2 = () => { if (!mode) { showToast('Choisissez un mode de paiement'); return; } setStep(3); };

  const confirmer = async () => {
    if (!sel || !mode) return;
    setBusy(true);
    try {
      const res = await api.post<{ reference: string; mode: string; referenceBancaire: string | null }>('/remboursements', {
        feuilleId: sel.id,
        mode,
        simulerEchec: simuler,
      });
      setResult(res);
      setStep(4);
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Échec du remboursement.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: '24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
          {STEPS.map((st) => {
            const done = step > st.n;
            const active = step === st.n;
            return (
              <div key={st.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, ...(done ? { background: '#1f8a4c', color: '#fff' } : active ? { background: 'var(--csi-primary)', color: '#fff' } : { background: 'var(--csi-border)', color: 'var(--csi-muted)' }) }}>{done ? '✓' : st.n}</div>
                <div style={{ fontSize: 11.5, fontWeight: active ? 600 : 500, color: step >= st.n ? 'var(--csi-text)' : '#94a0b2', marginTop: 6 }}>{st.t}</div>
              </div>
            );
          })}
        </div>

        <div style={{ minHeight: 220 }}>
          {step === 1 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 1 · Choisir une feuille validée</h3>
              <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 12px' }}>Seules les feuilles à l'état <b>Validée</b> peuvent être remboursées.</p>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input value={query} onChange={(e) => { setQuery(e.target.value); setAcOpen(true); }} onFocus={() => setAcOpen(true)} onBlur={() => setTimeout(() => setAcOpen(false), 160)} autoComplete="off" placeholder="Rechercher par code de feuille ou nom d'assuré…" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }} />
                {open && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, overflow: 'hidden', animation: 'csiPop .18s ease', maxHeight: 260, overflowY: 'auto' }}>
                    {filtered.length === 0 && <div style={{ padding: 14, fontSize: 13, color: '#8b3a2e' }}>{loading ? 'Chargement…' : 'Aucune feuille validée à rembourser.'}</div>}
                    {filtered.map((f) => (
                      <div key={f.id} onMouseDown={() => pick(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                        <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}><Icon name="file" size={16} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{f.code}</div>
                          <div style={{ fontSize: 12, color: 'var(--csi-text-2)' }}>{f.assure.personne.nom} {f.assure.personne.prenom} · {fmt(Number(f.montant))}</div>
                        </div>
                        <span style={{ background: '#e6f4ec', color: '#1f8a4c', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Validée</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {sel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--csi-surface-2)', borderRadius: 11 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 11, background: 'var(--csi-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(sel.assure.personne.nom[0] || '') + (sel.assure.personne.prenom[0] || '')}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--csi-text)' }}>{assureNom}</div>
                    <div style={{ fontSize: 13, color: 'var(--csi-text-2)' }}>{sel.code} · {sel.diagnostic ?? ''} · soins {fmt(montantSoins)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 2 · Mode de paiement</h3>
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => setMode('ESPECES')} style={modeCard('ESPECES', mode)}>
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Icon name="cash" size={32} stroke="#1f8a4c" width={1.6} /></div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--csi-text)' }}>Espèces</div>
                  <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)', marginTop: 4 }}>Paiement au guichet CNAM</div>
                </button>
                <button onClick={() => setMode('VIREMENT')} style={modeCard('VIREMENT', mode)}>
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Icon name="bank" size={32} stroke="#2c4a86" width={1.6} /></div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--csi-text)' }}>Virement bancaire</div>
                  <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)', marginTop: 4 }}>Vers les coordonnées de l'assuré</div>
                </button>
              </div>
              {mode === 'VIREMENT' && (
                <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--csi-text-2)', background: 'var(--csi-surface-2)', borderRadius: 9, padding: '12px 14px', lineHeight: 1.6 }}>
                  Le virement utilisera les <b>coordonnées bancaires enregistrées de l'assuré</b> (chiffrées). En leur absence, l'opération sera refusée.
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer', color: 'var(--csi-text)' }}>
                    <input type="checkbox" checked={simuler} onChange={(e) => setSimuler(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--csi-primary)' }} /> Simuler un échec bancaire (test du rollback)
                  </label>
                </div>
              )}
              <div style={{ background: 'var(--csi-surface-2)', borderRadius: 11, padding: 18, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}><span style={{ color: 'var(--csi-text-2)' }}>Montant des soins</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{fmt(montantSoins)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}><span style={{ color: 'var(--csi-text-2)' }}>Taux ({sel?.medecin.type === 'SPECIALISTE' ? 'spécialiste' : 'généraliste'})</span><span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{taux} %</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 8, borderTop: '1px solid var(--csi-border)', fontSize: 16 }}><span style={{ fontWeight: 700, color: 'var(--csi-text)' }}>Montant à rembourser</span><span style={{ fontWeight: 700, color: '#1f8a4c' }}>{fmt(mr)}</span></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: 'csiFade .3s ease' }}>
              <h3 style={h3S}>Étape 3 · Confirmation</h3>
              <div style={{ border: '1px solid var(--csi-border)', borderRadius: 11, padding: '16px 18px', background: 'var(--csi-surface-2)', fontSize: 14, lineHeight: 1.9 }}>
                <div>Bénéficiaire : <b style={{ color: 'var(--csi-text)' }}>{assureNom}</b></div>
                <div>Feuille : <b style={{ color: 'var(--csi-text)', fontFamily: "'IBM Plex Mono', monospace" }}>{sel?.code}</b></div>
                <div>Mode : <b style={{ color: 'var(--csi-text)' }}>{mode === 'VIREMENT' ? 'Virement bancaire' : 'Espèces'}</b></div>
                <div>Montant : <b style={{ color: '#1f8a4c' }}>{fmt(mr)}</b> ({taux} %)</div>
              </div>
            </div>
          )}

          {step === 4 && result && (
            <div style={{ textAlign: 'center', padding: '14px 0', animation: 'csiPop .4s ease' }}>
              <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#e6f4ec', color: '#1f8a4c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 33, margin: '0 auto 16px' }}>✓</div>
              <h3 style={{ fontSize: 18, color: 'var(--csi-text)', margin: '0 0 6px', fontFamily: "'IBM Plex Serif', serif" }}>Remboursement effectué</h3>
              <p style={{ fontSize: 13.5, color: 'var(--csi-text-2)', margin: '0 0 12px' }}>Référence <b style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{result.reference}</b> · la feuille {sel?.code} passe à <b>Remboursée</b>.</p>
              {result.referenceBancaire && <div style={{ fontSize: 13, color: 'var(--csi-text-2)' }}>Réf. virement : <b>{result.referenceBancaire}</b></div>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--csi-border)' }}>
          {step === 1 && (<><span /><button onClick={next1} style={btnNavy}>Suivant →</button></>)}
          {step === 2 && (<><button onClick={() => setStep(1)} style={btnGhost}>← Précédent</button><button onClick={next2} style={btnNavy}>Suivant →</button></>)}
          {step === 3 && (<><button onClick={() => setStep(2)} style={btnGhost}>← Précédent</button><button onClick={confirmer} disabled={busy} style={{ ...btnNavy, background: busy ? '#9aa6b6' : '#1f8a4c', cursor: busy ? 'not-allowed' : 'pointer' }}>{busy ? 'Traitement…' : 'Confirmer le remboursement ✓'}</button></>)}
          {step === 4 && (<><span /><button onClick={() => go('remboursements')} style={btnNavy}>Voir les remboursements →</button></>)}
        </div>
      </div>
    </div>
  );
}
