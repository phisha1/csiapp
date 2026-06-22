import { useState, type CSSProperties } from 'react';
import { api, ApiError } from '../../lib/api';
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

interface Form {
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: 'M' | 'F';
  groupe: string;
  telephone: string;
  profession: string;
  employeur: string;
  modeRembPref: 'ESPECES' | 'VIREMENT';
  banque: string;
  numeroCompte: string;
  titulaire: string;
}

const EMPTY: Form = { nom: '', prenom: '', dateNaissance: '', sexe: 'M', groupe: '', telephone: '', profession: '', employeur: '', modeRembPref: 'ESPECES', banque: '', numeroCompte: '', titulaire: '' };

export function AssureNew() {
  const { go, showToast } = useAppStore();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Form>({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [matricule, setMatricule] = useState<string | null>(null);
  const set = (k: keyof Form, v: string) => setF((p) => ({ ...p, [k]: v }));

  const step1Ok = f.nom.trim() && f.prenom.trim() && f.dateNaissance;
  const step2Ok = f.profession.trim().length > 0;

  const next1 = () => {
    if (!step1Ok) { showToast('Nom, prénom et date de naissance sont obligatoires.'); return; }
    setStep(2);
  };
  const next2 = () => {
    if (!step2Ok) { showToast('La profession est obligatoire.'); return; }
    setStep(3);
  };

  // Coordonnées bancaires : optionnelles, mais si entamées elles doivent être complètes.
  const bankTouched = !!(f.banque || f.numeroCompte || f.titulaire);
  const bankComplete = !!(f.banque && f.numeroCompte.replace(/\s/g, '').length >= 10 && f.titulaire);

  const submit = async () => {
    if (bankTouched && !bankComplete) {
      showToast('Complétez les coordonnées bancaires (banque, n° ≥ 10 caractères, titulaire) ou laissez-les vides.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ matricule: string }>('/assures', {
        nom: f.nom,
        prenom: f.prenom,
        sexe: f.sexe,
        dateNaissance: f.dateNaissance,
        telephone: f.telephone || undefined,
        profession: f.profession || undefined,
        employeur: f.employeur || undefined,
        groupe: f.groupe || undefined,
        modeRembPref: f.modeRembPref,
        coordBancaire: bankComplete ? { banque: f.banque, numeroCompte: f.numeroCompte.replace(/\s/g, ''), titulaire: f.titulaire } : undefined,
      });
      setMatricule(res.matricule);
      setStep(4);
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Échec de l'inscription.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
          {STEPS.map((st) => {
            const done = step > st.n;
            const active = step === st.n;
            return (
              <div key={st.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 30px', ...(done ? { background: '#1f8a4c', color: '#fff' } : active ? { background: 'var(--csi-primary)', color: '#fff' } : { background: 'var(--csi-border)', color: 'var(--csi-muted)' }) }}>{done ? '✓' : st.n}</div>
                  <div style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active || done ? 'var(--csi-text)' : 'var(--csi-muted)' }}>{st.t}</div>
                </div>
                <div style={{ flex: 1, height: 2, background: 'var(--csi-border)', margin: '0 12px', minWidth: 16 }} />
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div style={{ animation: 'csiFade .3s ease' }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: '0 0 18px', fontFamily: "'IBM Plex Serif', serif" }}>Étape 1 · Informations personnelles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelS}>Nom *</label><input value={f.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Mbarga" style={inputS} /></div>
              <div><label style={labelS}>Prénom *</label><input value={f.prenom} onChange={(e) => set('prenom', e.target.value)} placeholder="Jean-Pierre" style={inputS} /></div>
              <div><label style={labelS}>Date de naissance *</label><input type="date" value={f.dateNaissance} onChange={(e) => set('dateNaissance', e.target.value)} style={selectS} /></div>
              <div><label style={labelS}>Sexe *</label><select value={f.sexe} onChange={(e) => set('sexe', e.target.value)} style={selectS}><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
              <div><label style={labelS}>Groupe sanguin</label><input value={f.groupe} onChange={(e) => set('groupe', e.target.value)} placeholder="O+" style={inputS} /></div>
              <div><label style={labelS}>Téléphone</label><input value={f.telephone} onChange={(e) => set('telephone', e.target.value)} placeholder="+237 6 ..." style={inputS} /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'csiFade .3s ease' }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: '0 0 18px', fontFamily: "'IBM Plex Serif', serif" }}>Étape 2 · Informations professionnelles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={labelS}>Profession *</label><input value={f.profession} onChange={(e) => set('profession', e.target.value)} placeholder="Enseignant" style={inputS} /></div>
              <div><label style={labelS}>Employeur</label><input value={f.employeur} onChange={(e) => set('employeur', e.target.value)} placeholder="MINESEC" style={inputS} /></div>
              <div><label style={labelS}>Mode de remboursement préféré</label><select value={f.modeRembPref} onChange={(e) => set('modeRembPref', e.target.value)} style={selectS}><option value="ESPECES">Espèces</option><option value="VIREMENT">Virement</option></select></div>
            </div>
            <div style={{ marginTop: 18, borderTop: '1px dashed var(--csi-border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h4 style={{ fontSize: 13.5, color: 'var(--csi-text)', margin: 0, fontWeight: 700 }}>Coordonnées bancaires</h4>
                <span style={{ fontSize: 11, background: '#eef1f6', color: '#5a6678', padding: '2px 8px', borderRadius: 5 }}>Optionnel</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--csi-muted)', margin: '0 0 14px' }}>Pour les remboursements par virement. Le numéro de compte est chiffré en base de données.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={labelS}>Banque</label><input value={f.banque} onChange={(e) => set('banque', e.target.value)} placeholder="Afriland First Bank" style={inputS} /></div>
                <div><label style={labelS}>Titulaire du compte</label><input value={f.titulaire} onChange={(e) => set('titulaire', e.target.value)} placeholder="Nom du titulaire" style={inputS} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelS}>Numéro de compte / RIB</label><input value={f.numeroCompte} onChange={(e) => set('numeroCompte', e.target.value)} placeholder="Ex : 10005 00012 12345678901 76" style={{ ...inputS, fontFamily: "'IBM Plex Mono', monospace" }} /></div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'csiFade .3s ease' }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: '0 0 18px', fontFamily: "'IBM Plex Serif', serif" }}>Étape 3 · Validation des données</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Nom complet', `${f.nom} ${f.prenom}`],
                ['Date de naissance', f.dateNaissance],
                ['Sexe · Groupe sanguin', `${f.sexe === 'M' ? 'Masculin' : 'Féminin'} · ${f.groupe || '—'}`],
                ['Profession', f.profession || '—'],
                ['Employeur', f.employeur || '—'],
                ['Mode de remboursement', f.modeRembPref === 'VIREMENT' ? 'Virement' : 'Espèces'],
                ...(bankTouched ? [['Compte bancaire', `${f.banque || '—'} · ****${f.numeroCompte.replace(/\s/g, '').slice(-4)}`]] : []),
              ].map(([k, val]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: 'var(--csi-surface-2)', borderRadius: 9, fontSize: 13.5 }}>
                  <span style={{ color: 'var(--csi-text-2)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--csi-text)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '18px 0', animation: 'csiPop .4s ease' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#e6f4ec', color: '#1f8a4c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 18px' }}>✓</div>
            <h3 style={{ fontSize: 19, color: 'var(--csi-text)', margin: '0 0 8px', fontFamily: "'IBM Plex Serif', serif" }}>Assuré inscrit avec succès</h3>
            <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 18px' }}>Le matricule assuré a été généré par le système.</p>
            <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: 'var(--csi-text)', background: 'var(--csi-surface-2)', border: '1.5px dashed #b9c5d8', padding: '12px 28px', borderRadius: 11, letterSpacing: '.04em' }}>{matricule}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--csi-border)' }}>
          {step === 1 && (<><span /><button onClick={next1} style={btnNavy}>Suivant →</button></>)}
          {step === 2 && (<><button onClick={() => setStep(1)} style={btnGhost}>← Précédent</button><button onClick={next2} style={btnNavy}>Suivant →</button></>)}
          {step === 3 && (<><button onClick={() => setStep(2)} style={btnGhost}>← Précédent</button><button onClick={submit} disabled={busy} style={{ ...btnNavy, ...(busy ? { background: '#9aa6b6', cursor: 'not-allowed' } : {}) }}>{busy ? 'Inscription…' : 'Valider et confirmer →'}</button></>)}
          {step === 4 && (<><span /><button onClick={() => go('assures')} style={btnGreen}>Terminer ✓</button></>)}
        </div>
      </div>
    </div>
  );
}
