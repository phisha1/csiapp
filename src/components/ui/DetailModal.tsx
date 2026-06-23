import { useEffect, useState } from 'react';
import { css } from '../../lib/css';
import { badgeFor } from '../../lib/format';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';
import type { Assure, Medecin } from '../../types';

const labelS = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--csi-text-2)', marginBottom: 5 } as const;
const inputS = { width: '100%', padding: '9px 11px', border: '1.5px solid var(--csi-border)', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' } as const;

const view = (label: string, value: string, mono = false) => (
  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ color: 'var(--csi-text-2)' }}>{label}</span>
    <span style={{ fontWeight: 600, color: 'var(--csi-text)', ...(mono ? { fontFamily: "'IBM Plex Mono', monospace" } : {}) }}>{value || '—'}</span>
  </div>
);

/** Fiche détail (assuré / médecin) : consultation + modification (assureur). */
export function DetailModal() {
  const { detailEntity, role, closeDetail, detailAffecter, showToast, bumpData } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  // Réinitialise le mode édition à chaque ouverture/fermeture.
  useEffect(() => { setEditing(false); }, [detailEntity]);

  if (!detailEntity) return null;

  const isAssure = detailEntity.type === 'assure';
  const a = detailEntity.data as Assure;
  const m = detailEntity.data as Medecin;
  const canEdit = role === 'assureur' && !!(isAssure ? a.dbId : m.dbId);

  const avatarBg = role === 'assureur' ? '#7d2433' : '#14253f';
  const initials = isAssure
    ? (a.nom[0] || '') + (a.prenom[0] || '')
    : m.nom.replace('Dr. ', '').slice(0, 2).toUpperCase();
  const title = isAssure ? `${a.nom} ${a.prenom}` : m.nom;
  const headerId = isAssure ? a.id : m.id;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const startEdit = () => {
    setForm(
      isAssure
        ? { telephone: a.telephone ?? '', email: a.email ?? '', numeroSecu: a.numeroSecu ?? '', profession: a.profession ?? '', employeur: a.employeur ?? '', groupe: a.groupe ?? '', statut: a.statut || 'Actif', modeRembPref: a.modeRembPref ?? 'ESPECES' }
        : { telephone: m.tel ?? '', email: m.email ?? '', etablissement: m.etab === '—' ? '' : m.etab, specialite: m.spec === '—' ? '' : m.spec },
    );
    setEditing(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      if (isAssure) {
        await api.patch(`/assures/${a.dbId}`, {
          telephone: form.telephone || undefined,
          email: form.email || undefined,
          numeroSecu: form.numeroSecu || undefined,
          profession: form.profession || undefined,
          employeur: form.employeur || undefined,
          groupe: form.groupe || undefined,
          statut: form.statut || undefined,
          modeRembPref: form.modeRembPref || undefined,
        });
      } else {
        await api.patch(`/medecins/${m.dbId}`, {
          telephone: form.telephone || undefined,
          email: form.email || undefined,
          etablissement: form.etablissement || undefined,
          specialite: form.specialite || undefined,
        });
      }
      bumpData();
      showToast('Modifications enregistrées');
      closeDetail();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Échec de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={closeDetail} style={{ position: 'fixed', inset: 0, background: 'rgba(17,35,62,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, animation: 'csiFade .2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--csi-surface)', borderRadius: 16, maxWidth: 460, width: '92%', boxShadow: '0 24px 60px rgba(0,0,0,.3)', animation: 'csiPop .28s ease', overflow: 'hidden' }}>
        <div style={{ background: '#11233e', color: '#fff', padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flex: '0 0 52px' }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#9fb4d4', marginTop: 2 }}>{headerId}</div>
          </div>
          <button onClick={closeDetail} style={{ background: 'none', border: 'none', color: '#9fb0cc', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: '22px 24px' }}>
          {isAssure ? (
            editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelS}>Téléphone</label><input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} style={inputS} /></div>
                <div><label style={labelS}>E-mail</label><input value={form.email} onChange={(e) => set('email', e.target.value)} style={inputS} /></div>
                <div><label style={labelS}>N° sécurité sociale</label><input value={form.numeroSecu} onChange={(e) => set('numeroSecu', e.target.value)} style={{ ...inputS, fontFamily: "'IBM Plex Mono', monospace" }} /></div>
                <div><label style={labelS}>Profession</label><input value={form.profession} onChange={(e) => set('profession', e.target.value)} style={inputS} /></div>
                <div><label style={labelS}>Employeur</label><input value={form.employeur} onChange={(e) => set('employeur', e.target.value)} style={inputS} /></div>
                <div><label style={labelS}>Groupe sanguin</label><input value={form.groupe} onChange={(e) => set('groupe', e.target.value)} style={inputS} /></div>
                <div><label style={labelS}>Statut</label><select value={form.statut} onChange={(e) => set('statut', e.target.value)} style={inputS}><option>Actif</option><option>En attente</option><option>Suspendu</option></select></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelS}>Mode de remboursement</label><select value={form.modeRembPref} onChange={(e) => set('modeRembPref', e.target.value)} style={inputS}><option value="ESPECES">Espèces</option><option value="VIREMENT">Virement</option></select></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--csi-text-2)' }}>Statut</span>
                  <span style={css(badgeFor(a.statut))}>{a.statut}</span>
                </div>
                {view('Sexe', a.sexe === 'M' ? 'Masculin' : 'Féminin')}
                {view('Date de naissance', a.naissance)}
                {view('N° sécurité sociale', a.numeroSecu ?? '', true)}
                {view('Groupe sanguin', a.groupe, true)}
                {view('Profession', a.profession)}
                {view('Téléphone', a.telephone ?? '', true)}
                {view('Médecin traitant', a.traitant)}
              </div>
            )
          ) : editing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelS}>Téléphone</label><input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} style={inputS} /></div>
              <div><label style={labelS}>E-mail</label><input value={form.email} onChange={(e) => set('email', e.target.value)} style={inputS} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelS}>Établissement</label><input value={form.etablissement} onChange={(e) => set('etablissement', e.target.value)} style={inputS} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelS}>Spécialité</label><input value={form.specialite} onChange={(e) => set('specialite', e.target.value)} placeholder={m.type === 'Spécialiste' ? 'Cardiologie…' : '(généraliste)'} style={inputS} /></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--csi-text-2)' }}>Type</span>
                <span style={css(badgeFor(m.type))}>{m.type}</span>
              </div>
              {view('Spécialité', m.spec)}
              {view('Établissement', m.etab)}
              {view('Téléphone', m.tel, true)}
              {view('E-mail', m.email ?? '')}
              {view('Patients suivis', String(m.patients))}
            </div>
          )}

          {editing ? (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={save} disabled={busy} style={{ flex: 1, padding: 11, background: busy ? '#9aa6b6' : 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: busy ? 'not-allowed' : 'pointer' }}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
              <button onClick={() => setEditing(false)} style={{ padding: '11px 18px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Annuler</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {canEdit && <button onClick={startEdit} style={{ flex: 1, padding: 11, background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Modifier</button>}
              {isAssure && canEdit && <button onClick={detailAffecter} style={{ padding: '11px 16px', background: 'var(--csi-surface)', color: 'var(--csi-text)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Médecin traitant</button>}
              <button onClick={closeDetail} style={{ padding: '11px 18px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
