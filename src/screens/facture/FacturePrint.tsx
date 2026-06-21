import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { assures, factures, feuilles, remboursements } from '../../data/sampleData';
import { fmt } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';

const btnGhost = { padding: '9px 16px', background: 'var(--csi-surface)', color: 'var(--csi-text)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' } as const;
const blockLabel = { fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--csi-muted)', marginBottom: 8 } as const;
const norm = (x: string) => x.toLowerCase();

export function FacturePrint() {
  const { factureSel, selectFacture, showToast } = useAppStore();
  const [query, setQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);

  const q = query.trim();
  const filtered = q ? factures.filter((f) => norm(`${f.assure} ${f.id} ${f.feuille}`).includes(norm(q))) : factures;
  const open = acOpen;

  const pick = (id: string) => {
    const f = factures.find((x) => x.id === id);
    if (f) { selectFacture(f); setAcOpen(false); setQuery(''); }
  };

  // Facture sélectionnée → données dérivées (feuille, assuré, mode)
  const fac = factureSel;
  const feuille = fac ? feuilles.find((f) => f.code === fac.feuille) : undefined;
  const rec = fac ? assures.find((a) => `${a.nom} ${a.prenom}` === fac.assure) : undefined;
  const mode = fac ? remboursements.find((r) => r.feuille === fac.feuille)?.mode ?? 'Virement bancaire' : '';
  const taux = feuille?.taux ?? 80;
  const montantSoins = feuille?.montant ?? 0;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {!fac && (
        <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
          <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>Rechercher la facture d'un assuré</h3>
          <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 16px' }}>Recherchez par nom de l'assuré, n° de facture ou code de feuille — les suggestions apparaissent à la saisie.</p>
          <div style={{ position: 'relative' }}>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAcOpen(true); }}
              onFocus={() => setAcOpen(true)}
              onBlur={() => setTimeout(() => setAcOpen(false), 160)}
              autoComplete="off"
              placeholder="Ex : Owona, FACT-2024-0302, FM-2024-0890…"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }}
            />
            {open && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, overflow: 'hidden', animation: 'csiPop .18s ease', maxHeight: 280, overflowY: 'auto' }}>
                {filtered.length === 0 && <div style={{ padding: 14, fontSize: 13, color: '#8b3a2e' }}>Aucune facture ne correspond.</div>}
                {filtered.map((f) => (
                  <div key={f.id} onMouseDown={() => pick(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}><Icon name="factures" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--csi-text)' }}>{f.assure}</div>
                      <div style={{ fontSize: 12, color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace" }}>{f.id} · {f.feuille}</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--csi-text)' }}>{fmt(f.montant)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {fac && feuille && (
        <div style={{ animation: 'csiFade .35s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={() => selectFacture(null)} style={btnGhost}>← Rechercher une autre facture</button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => showToast(`Facture ${fac.id} régénérée`)} style={btnGhost}>↻ Générer</button>
              <button onClick={() => window.print()} style={btnGhost}>🖨 Imprimer</button>
              <button onClick={() => showToast('Téléchargement du PDF lancé')} style={{ padding: '9px 16px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>⬇ Télécharger PDF</button>
            </div>
          </div>

          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 8, boxShadow: '0 10px 30px rgba(20,37,63,.08)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #11233e, #1b3358)', color: '#fff', padding: '26px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 46, height: 46, borderRadius: 9, background: 'linear-gradient(135deg, #e07b1f, #c2611a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>C</div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9fb4d4' }}>République du Cameroun</div>
                  <div style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 17, fontWeight: 600 }}>CNAM · Assurance Maladie</div>
                  <div style={{ fontSize: 11.5, color: '#aebbcf' }}>Caisse Nationale — Antenne de Yaoundé</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#9fb4d4' }}>Facture de remboursement</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, marginTop: 2 }}>{fac.id}</div>
              </div>
            </div>

            <div style={{ padding: '28px 32px', fontFamily: "'IBM Plex Serif', serif" }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                <div>
                  <div style={blockLabel}>Assuré bénéficiaire</div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--csi-text)' }}>{fac.assure}</div>
                  <div style={{ fontSize: 13, color: 'var(--csi-text-2)', marginTop: 3, lineHeight: 1.6 }}>{rec?.id ?? '—'}<br />{rec?.profession ?? ''}{rec ? ` · Groupe ${rec.groupe}` : ''}</div>
                </div>
                <div>
                  <div style={blockLabel}>Références</div>
                  <div style={{ fontSize: 13, color: 'var(--csi-text)', lineHeight: 1.8 }}>
                    Feuille de maladie : <b style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{fac.feuille}</b><br />
                    Date d'émission : <b>{fac.date}</b><br />
                    Mode : <b>{mode}</b>
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: 'var(--csi-surface-2)', textAlign: 'left' }}>
                    <th style={{ padding: '11px 14px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--csi-muted)', fontWeight: 600 }}>Désignation</th>
                    <th style={{ padding: '11px 14px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--csi-muted)', fontWeight: 600, textAlign: 'right' }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--csi-border)' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13.5, color: 'var(--csi-text)' }}>Montant des soins ({feuille.diag})</td>
                    <td style={{ padding: '12px 14px', fontSize: 13.5, color: 'var(--csi-text)', textAlign: 'right', fontWeight: 600 }}>{fmt(montantSoins)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--csi-border)' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13.5, color: 'var(--csi-text)' }}>Taux de remboursement applicable</td>
                    <td style={{ padding: '12px 14px', fontSize: 13.5, color: 'var(--csi-text)', textAlign: 'right', fontWeight: 600 }}>{taux} %</td>
                  </tr>
                  <tr style={{ background: 'var(--csi-surface-2)' }}>
                    <td style={{ padding: 14, fontSize: 15, color: 'var(--csi-text)', fontWeight: 700 }}>Montant remboursé</td>
                    <td style={{ padding: 14, fontSize: 17, color: '#1f8a4c', textAlign: 'right', fontWeight: 700 }}>{fmt(fac.montant)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 30 }}>
                <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11.5, color: 'var(--csi-muted)', maxWidth: 280, lineHeight: 1.6 }}>
                  Document généré électroniquement par le Système d'Information CNAM. Valant justificatif de remboursement.
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 130, height: 80, border: '1.5px dashed #c2cad6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b9c5d8', fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif" }}>Signature / Cachet</div>
                  <div style={{ fontSize: 11.5, color: 'var(--csi-text-2)', marginTop: 7, fontFamily: "'IBM Plex Sans', sans-serif" }}>L'Agent — A. Ngono</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
