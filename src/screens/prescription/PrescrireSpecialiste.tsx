import { useState } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { useFetch } from '../../lib/useApi';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const URGENCES = [
  { label: 'Normale', val: 'NORMAL', c: '#1f8a4c' },
  { label: 'Urgente', val: 'URGENT', c: '#9a7611' },
  { label: 'Très urgente', val: 'TRES_URGENT', c: '#8b2231' },
];

const labelS = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 } as const;
const selectS = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', color: 'var(--csi-text)', background: 'var(--csi-surface)' } as const;

const SPECIALTIES = ['Cardiologie', 'Dermatologie', 'Pédiatrie', 'Pneumologie', 'Gynécologie', 'Ophtalmologie'];

interface ApiFeuille { id: string; code: string; assure: { personne: { nom: string; prenom: string } } }
interface ApiMedecin { id: string; type: string; specialite: { libelle: string } | null; personne: { nom: string; prenom: string } }

export function PrescrireSpecialiste() {
  const { go, showToast } = useAppStore();
  const { data: feuillesData } = useFetch<{ items: ApiFeuille[] }>('/feuilles?limit=100');
  const { data: medsData } = useFetch<{ items: ApiMedecin[] }>('/medecins?limit=100');
  const feuilles = feuillesData?.items ?? [];
  const specialistes = (medsData?.items ?? []).filter((m) => m.type === 'SPECIALISTE');

  const [feuilleId, setFeuilleId] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [medecinSpecialisteId, setMedecinSpecialisteId] = useState('');
  const [urgence, setUrgence] = useState('NORMAL');
  const [busy, setBusy] = useState(false);

  // Si une spécialité est choisie, on propose en priorité les spécialistes correspondants.
  const specialistesProposes = specialite
    ? specialistes.filter((m) => (m.specialite?.libelle ?? '').toLowerCase() === specialite.toLowerCase())
    : specialistes;

  const submit = async () => {
    if (!feuilleId) { showToast('Sélectionnez la feuille du patient.'); return; }
    if (!specialite) { showToast('Choisissez la spécialité requise.'); return; }
    setBusy(true);
    try {
      await api.post('/prescriptions/orientation', {
        feuilleId,
        specialite,
        medecinSpecialisteId: medecinSpecialisteId || undefined,
        niveauUrgence: urgence,
      });
      showToast('Orientation spécialiste enregistrée');
      go('prescriptions');
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Échec de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f1f3', border: '1px solid #e3d0da', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
        <span style={{ display: 'inline-flex' }}><Icon name="arrow" size={20} stroke="#7d2433" /></span>
        <div style={{ fontSize: 13, color: '#7d2433', lineHeight: 1.5 }}>
          <b>Cas d'utilisation critique du rapport.</b> Orientation d'un patient du médecin généraliste vers un médecin spécialiste.
        </div>
      </div>

      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={labelS}>Feuille du patient *</label>
          <select value={feuilleId} onChange={(e) => setFeuilleId(e.target.value)} style={selectS}>
            <option value="">— Choisir une feuille —</option>
            {feuilles.map((f) => (
              <option key={f.id} value={f.id}>{f.assure.personne.nom} {f.assure.personne.prenom} — {f.code}</option>
            ))}
          </select>
        </div>

        <label style={labelS}>Spécialité requise *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
          {SPECIALTIES.map((sp) => {
            const on = specialite === sp;
            return (
              <button
                key={sp}
                onClick={() => { setSpecialite(sp); setMedecinSpecialisteId(''); }}
                style={{ padding: '11px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, textAlign: 'center', transition: 'all .15s', ...(on ? { border: '2px solid #7d2433', background: '#f8f1f3', color: '#7d2433' } : { border: '2px solid var(--csi-border)', background: 'var(--csi-surface)', color: 'var(--csi-text-2)' }) }}
              >
                {sp}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelS}>Médecin spécialiste (optionnel)</label>
          <select value={medecinSpecialisteId} onChange={(e) => setMedecinSpecialisteId(e.target.value)} style={selectS}>
            <option value="">— Laisser le système choisir —</option>
            {specialistesProposes.map((m) => (
              <option key={m.id} value={m.id}>{m.personne.nom} {m.personne.prenom}{m.specialite ? ` — ${m.specialite.libelle}` : ''}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelS}>Niveau d'urgence</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {URGENCES.map((u) => {
              const on = urgence === u.val;
              return (
                <button
                  key={u.val}
                  onClick={() => setUrgence(u.val)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all .15s', ...(on ? { border: `2px solid ${u.c}`, background: 'var(--csi-surface-2)', color: u.c } : { border: '2px solid var(--csi-border)', background: 'var(--csi-surface)', color: 'var(--csi-text-2)' }) }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.c }} /> {u.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box as="button" onClick={submit} disabled={busy} sx={`padding:12px 26px;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;${busy ? 'background:#9aa6b6;cursor:not-allowed;' : 'background:#7d2433;cursor:pointer;'}`} hover={busy ? '' : 'background:#93283a;'}>
            {busy ? 'Enregistrement…' : 'Générer la prescription de consultation'}
          </Box>
        </div>
      </div>
    </div>
  );
}
