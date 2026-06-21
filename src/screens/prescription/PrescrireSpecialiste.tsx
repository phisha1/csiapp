import { useState } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { useAppStore } from '../../store/useAppStore';

const URGENCES = ['Normale', 'Urgente', 'Très urgente'];
const urgenceColor: Record<string, string> = { Normale: '#1f8a4c', Urgente: '#9a7611', 'Très urgente': '#8b2231' };

const labelS = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 } as const;
const selectS = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', color: 'var(--csi-text-2)', background: 'var(--csi-surface)' } as const;

const SPECIALTIES = ['Cardiologie', 'Dermatologie', 'Pédiatrie', 'Pneumologie', 'Gynécologie', 'Ophtalmologie'];

export function PrescrireSpecialiste() {
  const { referralSpec, setReferralSpec, go, showToast } = useAppStore();
  const [urgence, setUrgence] = useState('Normale');

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f1f3', border: '1px solid #e3d0da', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
        <span style={{ display: 'inline-flex' }}><Icon name="arrow" size={20} stroke="#7d2433" /></span>
        <div style={{ fontSize: 13, color: '#7d2433', lineHeight: 1.5 }}>
          <b>Cas d'utilisation critique du rapport.</b> Orientation d'un patient du médecin généraliste vers un médecin spécialiste.
        </div>
      </div>

      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={labelS}>Patient</label>
            <select style={selectS}><option>Owona Sandrine — ASS-2024-0127</option></select>
          </div>
          <div>
            <label style={labelS}>Consultation actuelle</label>
            <select style={selectS}><option>CONS-3400 — Toux persistante</option></select>
          </div>
        </div>

        <label style={labelS}>Spécialité requise</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
          {SPECIALTIES.map((sp) => {
            const on = referralSpec === sp;
            return (
              <button
                key={sp}
                onClick={() => setReferralSpec(sp)}
                style={{ padding: '11px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, textAlign: 'center', transition: 'all .15s', ...(on ? { border: '2px solid #7d2433', background: '#f8f1f3', color: '#7d2433' } : { border: '2px solid var(--csi-border)', background: 'var(--csi-surface)', color: 'var(--csi-text-2)' }) }}
              >
                {sp}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelS}>Médecin spécialiste</label>
          <select style={selectS}><option>Dr. Ngassa — Dermatologie</option><option>Dr. Mballa — Cardiologie</option><option>Dr. Biya — Pédiatrie</option></select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelS}>Niveau d'urgence</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {URGENCES.map((u) => {
              const on = urgence === u;
              const c = urgenceColor[u];
              return (
                <button
                  key={u}
                  onClick={() => setUrgence(u)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all .15s', ...(on ? { border: `2px solid ${c}`, background: 'var(--csi-surface-2)', color: c } : { border: '2px solid var(--csi-border)', background: 'var(--csi-surface)', color: 'var(--csi-text-2)' }) }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} /> {u}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelS}>Motif de l'orientation</label>
          <textarea rows={3} defaultValue="Toux persistante depuis 3 semaines, suspicion d'atteinte pulmonaire — avis pneumologique demandé." style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', background: 'var(--csi-surface)', color: 'var(--csi-text)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box as="button" onClick={() => { go('prescriptions'); showToast('Orientation spécialiste générée · PRESC-1209'); }} sx="padding:12px 26px;background:#7d2433;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:#93283a;">
            Générer la prescription de consultation
          </Box>
        </div>
      </div>
    </div>
  );
}
