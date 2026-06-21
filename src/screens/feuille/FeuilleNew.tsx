import type { CSSProperties } from 'react';
import { Box } from '../../components/ui/Box';
import { useAppStore, validateFeuille } from '../../store/useAppStore';
import type { FeuilleForm } from '../../types';

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

export function FeuilleNew() {
  const { feuilleSubmitted, feuilleForm, feuilleTouched, feuilleTried, feuilleStatus, setFeuille, touchFeuille, submitFeuille, resetFeuille, gotoFeuilles } = useAppStore();

  if (feuilleSubmitted) {
    return (
      <div style={{ maxWidth: 560, margin: '30px auto', background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 36, textAlign: 'center', animation: 'csiPop .4s ease' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#e6f4ec', color: '#1f8a4c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 18px' }}>✓</div>
        <h3 style={{ fontSize: 19, color: 'var(--csi-text)', margin: '0 0 8px', fontFamily: "'IBM Plex Serif', serif" }}>Feuille de maladie enregistrée</h3>
        <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 18px' }}>Référence générée et transmise à l'assureur. État : <b>Transmise</b>.</p>
        <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: 'var(--csi-text)', background: 'var(--csi-surface-2)', border: '1.5px dashed #b9c5d8', padding: '12px 28px', borderRadius: 11 }}>FM-2024-0892</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
          <button onClick={resetFeuille} style={{ padding: '10px 20px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Nouvelle feuille</button>
          <button onClick={gotoFeuilles} style={{ padding: '10px 20px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Voir les feuilles →</button>
        </div>
      </div>
    );
  }

  const errs = validateFeuille(feuilleForm);
  const errCount = Object.keys(errs).length;
  const show = (k: keyof FeuilleForm) => ((feuilleTouched[k] || feuilleTried) ? errs[k] || '' : '');

  const field = (k: keyof FeuilleForm, label: string, placeholder: string, opts: { mono?: boolean; type?: string } = {}) => {
    const err = show(k);
    return (
      <div>
        <label style={labelS}>{label}</label>
        <input type={opts.type} value={feuilleForm[k]} onChange={(e) => setFeuille(k, e.target.value)} onBlur={() => touchFeuille(k)} placeholder={placeholder} style={fieldStyle(!!err, opts.mono)} />
        {err && <div style={errLine}><span>⚠</span>{err}</div>}
      </div>
    );
  };

  const reqOk = !errs.numAssure && !errs.dateConsult && !errs.montant && !errs.diagnostic;
  const checks = [
    { ok: !errs.numAssure, t: 'Patient existant', d: !errs.numAssure ? `${feuilleForm.numAssure} reconnu` : "Numéro d'assuré manquant ou invalide" },
    { ok: reqOk, t: 'Champs obligatoires', d: reqOk ? 'Tous renseignés' : 'Des champs requis sont vides' },
    { ok: !errs.montant && !errs.dateConsult, t: 'Format des données', d: !errs.montant && !errs.dateConsult ? 'Montant et date valides' : 'Montant ou date invalide' },
    { ok: true, t: 'Absence de doublon', d: 'Aucune feuille identique' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 26 }}>
        <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: '0 0 20px', fontFamily: "'IBM Plex Serif', serif" }}>Conclusions de la consultation</h3>

        {feuilleStatus === 'incomplete' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fbf0ee', border: '1px solid #eccfca', borderLeft: '3px solid #cc3b3b', borderRadius: 9, padding: '11px 14px', marginBottom: 18, animation: 'csiPop .25s ease' }}>
            <span style={{ background: '#fbecec', color: '#8b2231', fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>Incomplète</span>
            <span style={{ fontSize: 12.5, color: '#8b3a2e', lineHeight: 1.5 }}>La feuille ne peut pas être enregistrée : {errCount} champ(s) à corriger ci-dessous.</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {field('numAssure', 'Numéro assuré *', 'ASS-2024-…', { mono: true })}
          {field('dateConsult', 'Date consultation *', '', { type: 'date' })}
          <div>
            <label style={labelS}>Médecin</label>
            <input value="Dr. Atangana" disabled style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface-2)', color: 'var(--csi-text-2)' }} />
          </div>
          {field('montant', 'Montant des soins (FCFA) *', 'ex. 28 500')}
        </div>
        <div style={{ marginBottom: 16 }}>{field('diagnostic', 'Diagnostic *', 'Saisir le diagnostic…')}</div>
        <div style={{ marginBottom: 16 }}>{field('actes', 'Actes réalisés', 'Actes réalisés…')}</div>
        <div style={{ marginBottom: 16 }}>{field('prescriptions', 'Prescriptions associées', 'Référence(s) de prescription…')}</div>
        <div>
          <label style={labelS}>Observations</label>
          <textarea rows={3} value={feuilleForm.observations} onChange={(e) => setFeuille('observations', e.target.value)} placeholder="Observations du médecin…" style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', background: 'var(--csi-surface)', color: 'var(--csi-text)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
          <Box as="button" onClick={submitFeuille} sx="padding:12px 26px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">Enregistrer la feuille</Box>
        </div>
      </div>

      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--csi-text)', marginBottom: 14 }}>Contrôles de validation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {checks.map((c) => (
            <div key={c.t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: c.ok ? '#1f8a4c' : '#cc3b3b', fontSize: 15, lineHeight: 1.2 }}>{c.ok ? '✓' : '✕'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--csi-text)' }}>{c.t}</div>
                <div style={{ fontSize: 12, color: c.ok ? '#1f8a4c' : '#cc3b3b' }}>{c.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--csi-border)', fontSize: 12, color: 'var(--csi-text-2)', lineHeight: 1.6 }}>
          Tant qu'un contrôle échoue, l'enregistrement est bloqué et la feuille reste à l'état <b style={{ color: '#8b2231' }}>Incomplète</b>. Les erreurs s'affichent en temps réel sous chaque champ.
        </div>
      </div>
    </div>
  );
}
