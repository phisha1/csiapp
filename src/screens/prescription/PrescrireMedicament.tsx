import { useState } from 'react';
import { Box } from '../../components/ui/Box';
import { useFetch } from '../../lib/useApi';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const labelXS = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--csi-text-2)', marginBottom: 5 } as const;
const inputXS = { width: '100%', padding: '9px 11px', border: '1.5px solid var(--csi-border)', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' } as const;
const labelS = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 } as const;
const selectS = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', color: 'var(--csi-text)', background: 'var(--csi-surface)' } as const;

interface ApiFeuille { id: string; code: string; assure: { personne: { nom: string; prenom: string } } }
interface ApiMedicament { id: string; code: string; nom: string }
interface Ligne { medicamentId: string; posologie: string; duree: string; instructions: string }

const EMPTY_LIGNE: Ligne = { medicamentId: '', posologie: '', duree: '', instructions: '' };

export function PrescrireMedicament() {
  const { go, showToast } = useAppStore();
  const { data: feuillesData } = useFetch<{ items: ApiFeuille[] }>('/feuilles?limit=100');
  const { data: medsData } = useFetch<{ items: ApiMedicament[] }>('/medicaments?limit=100');
  const feuilles = feuillesData?.items ?? [];
  const catalogue = medsData?.items ?? [];

  const [feuilleId, setFeuilleId] = useState('');
  const [lignes, setLignes] = useState<Ligne[]>([{ ...EMPTY_LIGNE }]);
  const [busy, setBusy] = useState(false);

  const addLigne = () => setLignes((p) => [...p, { ...EMPTY_LIGNE }]);
  const rmLigne = (i: number) => setLignes((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));
  const updLigne = (i: number, k: keyof Ligne, v: string) => setLignes((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));

  const feuille = feuilles.find((f) => f.id === feuilleId);
  const patient = feuille ? `${feuille.assure.personne.nom} ${feuille.assure.personne.prenom}` : '—';
  const medName = (id: string) => catalogue.find((m) => m.id === id)?.nom ?? '';

  const submit = async () => {
    const valides = lignes.filter((l) => l.medicamentId);
    if (!feuilleId) { showToast('Sélectionnez la feuille du patient.'); return; }
    if (!valides.length) { showToast('Ajoutez au moins un médicament.'); return; }
    setBusy(true);
    try {
      await api.post('/prescriptions/medicaments', {
        feuilleId,
        lignes: valides.map((l) => ({ medicamentId: l.medicamentId, posologie: l.posologie || undefined, duree: l.duree || undefined, instructions: l.instructions || undefined })),
      });
      showToast('Ordonnance enregistrée');
      go('prescriptions');
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Échec de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, color: 'var(--csi-text)', margin: 0 }}>Médicaments</h3>
          <button onClick={addLigne} style={{ padding: '7px 14px', background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid #dde3ec', borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>＋ Ajouter</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lignes.map((m, i) => (
            <div key={i} style={{ border: '1px solid var(--csi-border)', borderRadius: 11, padding: 14, position: 'relative' }}>
              <button onClick={() => rmLigne(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#c2868c', cursor: 'pointer', fontSize: 15 }}>✕</button>
              <div style={{ marginBottom: 10, paddingRight: 18 }}>
                <label style={labelXS}>Médicament (catalogue)</label>
                <select value={m.medicamentId} onChange={(e) => updLigne(i, 'medicamentId', e.target.value)} style={{ ...inputXS, color: 'var(--csi-text)' }}>
                  <option value="">— Choisir un médicament —</option>
                  {catalogue.map((c) => <option key={c.id} value={c.id}>{c.nom} ({c.code})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 10 }}>
                <div><label style={labelXS}>Posologie</label><input value={m.posologie} onChange={(e) => updLigne(i, 'posologie', e.target.value)} placeholder="1 cp x3/j" style={inputXS} /></div>
                <div><label style={labelXS}>Durée</label><input value={m.duree} onChange={(e) => updLigne(i, 'duree', e.target.value)} placeholder="7 jours" style={inputXS} /></div>
                <div><label style={labelXS}>Instructions</label><input value={m.instructions} onChange={(e) => updLigne(i, 'instructions', e.target.value)} placeholder="Après repas" style={inputXS} /></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Box as="button" onClick={submit} disabled={busy} sx={`padding:12px 26px;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;${busy ? 'background:#9aa6b6;cursor:not-allowed;' : 'background:var(--csi-primary);cursor:pointer;'}`} hover={busy ? '' : 'background:var(--csi-primary-hover);'}>{busy ? 'Enregistrement…' : "Enregistrer l'ordonnance"}</Box>
        </div>
      </div>

      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'var(--csi-primary)', color: '#fff', padding: '14px 18px', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>Aperçu de l'ordonnance</div>
        <div style={{ padding: 20, fontFamily: "'IBM Plex Serif', serif" }}>
          <div style={{ fontSize: 12, color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 12 }}>
            Patient : <b style={{ color: 'var(--csi-text)' }}>{patient}</b><br />Feuille : {feuille?.code ?? '—'}
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {lignes.filter((l) => l.medicamentId).map((m, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: '1px dashed var(--csi-border)' }}>
                <div style={{ fontWeight: 600, color: 'var(--csi-text)', fontSize: 13 }}>℞ {medName(m.medicamentId)}</div>
                <div style={{ fontSize: 12, color: 'var(--csi-text-2)', marginTop: 2 }}>{[m.posologie, m.duree, m.instructions].filter(Boolean).join(' · ') || '—'}</div>
              </div>
            ))}
            {lignes.every((l) => !l.medicamentId) && <div style={{ fontSize: 12.5, color: 'var(--csi-muted)' }}>Aucun médicament ajouté.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
