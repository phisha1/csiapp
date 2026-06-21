import type { CSSProperties } from 'react';
import { useAppStore } from '../../store/useAppStore';

const labelS: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 };
const inputS: CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' };
const selectS: CSSProperties = { ...inputS, color: 'var(--csi-text-2)' };

const STEPS = [
  { n: 1, t: 'Informations personnelles' },
  { n: 2, t: 'Informations professionnelles' },
  { n: 3, t: 'Validation' },
  { n: 4, t: 'Confirmation' },
];

const btnNavy: CSSProperties = { padding: '11px 24px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };
const btnGhost: CSSProperties = { padding: '11px 20px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };
const btnGreen: CSSProperties = { padding: '11px 24px', background: '#1f8a4c', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };

export function AssureNew() {
  const { insuredStep, insuredNext, insuredBack, insuredFinish } = useAppStore();

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
          {STEPS.map((st) => {
            const done = insuredStep > st.n;
            const active = insuredStep === st.n;
            return (
              <div key={st.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 30px', ...(done ? { background: '#1f8a4c', color: '#fff' } : active ? { background: 'var(--csi-primary)', color: '#fff' } : { background: 'var(--csi-border)', color: 'var(--csi-muted)' }) }}>
                    {done ? '✓' : st.n}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active || done ? 'var(--csi-text)' : 'var(--csi-muted)' }}>{st.t}</div>
                </div>
                <div style={{ flex: 1, height: 2, background: 'var(--csi-border)', margin: '0 12px', minWidth: 16 }} />
              </div>
            );
          })}
        </div>

        {insuredStep === 1 && (
          <div style={{ animation: 'csiFade .3s ease' }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: '0 0 18px', fontFamily: "'IBM Plex Serif', serif" }}>Étape 1 · Informations personnelles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelS}>Nom *</label><input placeholder="Mbarga" style={inputS} /></div>
              <div><label style={labelS}>Prénom *</label><input placeholder="Jean-Pierre" style={inputS} /></div>
              <div><label style={labelS}>Date de naissance *</label><input type="date" style={selectS} /></div>
              <div><label style={labelS}>Sexe *</label><select style={selectS}><option>Masculin</option><option>Féminin</option></select></div>
              <div><label style={labelS}>Groupe sanguin</label><select style={selectS}><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>AB+</option></select></div>
              <div><label style={labelS}>Téléphone</label><input placeholder="+237 6 ..." style={inputS} /></div>
            </div>
          </div>
        )}

        {insuredStep === 2 && (
          <div style={{ animation: 'csiFade .3s ease' }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: '0 0 18px', fontFamily: "'IBM Plex Serif', serif" }}>Étape 2 · Informations professionnelles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelS}>Profession *</label><input placeholder="Enseignant" style={inputS} /></div>
              <div><label style={labelS}>Employeur</label><input placeholder="MINESEC" style={inputS} /></div>
              <div><label style={labelS}>Matricule employeur</label><input placeholder="MAT-..." style={inputS} /></div>
              <div><label style={labelS}>Revenu mensuel (FCFA)</label><input placeholder="350 000" style={inputS} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fbf0ee', border: '1px solid #eccfca', borderRadius: 9, padding: '11px 14px', marginTop: 18, fontSize: 13, color: '#8b3a2e' }}>
              <span>⚠</span> Scénario alternatif : un assuré avec le même nom et la même date de naissance existe déjà.
            </div>
          </div>
        )}

        {insuredStep === 3 && (
          <div style={{ animation: 'csiFade .3s ease' }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: '0 0 18px', fontFamily: "'IBM Plex Serif', serif" }}>Étape 3 · Validation des données</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Nom complet', 'Mbarga Jean-Pierre'],
                ['Date de naissance', '12/04/1986'],
                ['Sexe · Groupe sanguin', 'Masculin · O+'],
                ['Profession', 'Enseignant'],
              ].map(([k, val]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: 'var(--csi-surface-2)', borderRadius: 9, fontSize: 13.5 }}>
                  <span style={{ color: 'var(--csi-text-2)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#eef4ee', border: '1px solid #cfe2cf', borderRadius: 9, padding: '11px 14px', marginTop: 16, fontSize: 13, color: '#2c5239' }}>
              ✓ Toutes les données obligatoires sont renseignées et valides.
            </div>
          </div>
        )}

        {insuredStep === 4 && (
          <div style={{ textAlign: 'center', padding: '18px 0', animation: 'csiPop .4s ease' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#e6f4ec', color: '#1f8a4c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 18px' }}>✓</div>
            <h3 style={{ fontSize: 19, color: 'var(--csi-text)', margin: '0 0 8px', fontFamily: "'IBM Plex Serif', serif" }}>Assuré inscrit avec succès</h3>
            <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 18px' }}>L'identifiant assuré a été généré par le système.</p>
            <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: 'var(--csi-text)', background: 'var(--csi-surface-2)', border: '1.5px dashed #b9c5d8', padding: '12px 28px', borderRadius: 11, letterSpacing: '.04em' }}>ASS-2024-0149</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--csi-border)' }}>
          {insuredStep === 1 && (<><span /><button onClick={insuredNext} style={btnNavy}>Suivant →</button></>)}
          {insuredStep === 2 && (<><button onClick={insuredBack} style={btnGhost}>← Précédent</button><button onClick={insuredNext} style={btnNavy}>Suivant →</button></>)}
          {insuredStep === 3 && (<><button onClick={insuredBack} style={btnGhost}>← Précédent</button><button onClick={insuredNext} style={btnNavy}>Valider et confirmer →</button></>)}
          {insuredStep === 4 && (<><span /><button onClick={insuredFinish} style={btnGreen}>Terminer ✓</button></>)}
        </div>
      </div>
    </div>
  );
}
