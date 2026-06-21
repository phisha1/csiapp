import type { CSSProperties } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { useAppStore, validateMed } from '../../store/useAppStore';
import type { MedForm } from '../../types';

const labelS: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 };
const errLine: CSSProperties = { fontSize: 11.5, color: '#cc3b3b', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 };

function fieldStyle(hasErr: boolean, mono = false): CSSProperties {
  return {
    width: '100%',
    padding: '11px 13px',
    border: `1.5px solid ${hasErr ? '#cc3b3b' : 'var(--csi-border)'}`,
    borderRadius: 9,
    fontSize: 14,
    fontFamily: mono ? "'IBM Plex Mono', monospace" : 'inherit',
    outline: 'none',
    background: hasErr ? '#fdf6f6' : 'var(--csi-surface)',
    color: 'var(--csi-text)',
  };
}

export function MedecinNew() {
  const { medForm, medTouched, medTried, setMed, touchMed, submitMedecin, go } = useAppStore();
  const errs = validateMed(medForm);
  const errCount = Object.keys(errs).length;
  const showErr = (k: keyof MedForm) => ((medTouched[k] || medTried) ? errs[k] || '' : '');

  const field = (k: keyof MedForm, label: string, placeholder: string, opts: { mono?: boolean; type?: string } = {}) => {
    const err = showErr(k);
    return (
      <div>
        <label style={labelS}>{label}</label>
        <input
          type={opts.type}
          value={medForm[k] as string}
          onChange={(e) => setMed(k, e.target.value)}
          onBlur={() => touchMed(k)}
          placeholder={placeholder}
          style={fieldStyle(!!err, opts.mono)}
        />
        {err && <div style={errLine}><span>⚠</span>{err}</div>}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: '#f3ecf0', color: '#7d2433', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="stethoscope" size={22} /></span>
          <div>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: 0, fontFamily: "'IBM Plex Serif', serif" }}>Nouveau médecin partenaire</h3>
            <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '2px 0 0' }}>L'assureur enregistre le médecin et lui ouvre un accès à la plateforme.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {field('nom', 'Nom *', 'Atangana')}
          {field('prenom', 'Prénom *', 'Pauline')}
          {field('numOrdre', "Numéro d'ordre (ONMC) *", 'CM-MED-001', { mono: true })}
          <div>
            <label style={labelS}>Type *</label>
            <select value={medForm.type} onChange={(e) => setMed('type', e.target.value)} style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', color: 'var(--csi-text-2)', background: 'var(--csi-surface)' }}>
              <option>Généraliste</option>
              <option>Spécialiste</option>
            </select>
          </div>
          {field('specialite', `Spécialité ${medForm.type === 'Spécialiste' ? '*' : ''}`, 'Cardiologie (si spécialiste)')}
          {field('tel', 'Téléphone', '+237 6 ...')}
        </div>

        <div style={{ marginBottom: 16 }}>
          {field('etab', 'Établissement', "Centre Médical d'Etoudi")}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {field('email', 'Adresse e-mail (accès) *', 'p.atangana@cnam.cm')}
          {field('mdp', 'Mot de passe provisoire *', '••••••', { type: 'password' })}
        </div>

        {medTried && errCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fbf0ee', border: '1px solid #eccfca', borderRadius: 9, padding: '10px 13px', marginBottom: 14, fontSize: 12.5, color: '#8b3a2e' }}>
            <span>⚠</span> Formulaire incomplet : {errCount} champ(s) à corriger avant l'enregistrement.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={() => go('medecins')} style={{ padding: '11px 20px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Annuler</button>
          <Box as="button" onClick={submitMedecin} sx="padding:11px 24px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">Enregistrer le médecin</Box>
        </div>
      </div>
    </div>
  );
}
