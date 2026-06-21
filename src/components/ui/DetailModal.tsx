import { css } from '../../lib/css';
import { badgeFor } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';

const row = (label: string, value: string, mono = false) => (
  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ color: 'var(--csi-text-2)' }}>{label}</span>
    <span style={{ fontWeight: 600, color: 'var(--csi-text)', ...(mono ? { fontFamily: "'IBM Plex Mono', monospace" } : {}) }}>{value}</span>
  </div>
);

/** Fiche détail (assuré / médecin) ouverte au clic sur une ligne de liste. */
export function DetailModal() {
  const { detailEntity, role, closeDetail, detailAffecter } = useAppStore();
  if (!detailEntity) return null;

  const avatarBg = role === 'assureur' ? '#7d2433' : '#14253f';
  const isAssure = detailEntity.type === 'assure';
  const d = detailEntity.data;
  const initials = isAssure
    ? ((d as { nom: string }).nom[0] || '') + ((d as { prenom: string }).prenom[0] || '')
    : (d as { nom: string }).nom.replace('Dr. ', '').slice(0, 2).toUpperCase();
  const title = isAssure ? `${(d as { nom: string }).nom} ${(d as { prenom: string }).prenom}` : (d as { nom: string }).nom;
  const badgeVal = isAssure ? (d as { statut: string }).statut : (d as { type: string }).type;

  return (
    <div onClick={closeDetail} style={{ position: 'fixed', inset: 0, background: 'rgba(17,35,62,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, animation: 'csiFade .2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--csi-surface)', borderRadius: 16, maxWidth: 460, width: '92%', boxShadow: '0 24px 60px rgba(0,0,0,.3)', animation: 'csiPop .28s ease', overflow: 'hidden' }}>
        <div style={{ background: '#11233e', color: '#fff', padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flex: '0 0 52px' }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#9fb4d4', marginTop: 2 }}>{(d as { id: string }).id}</div>
          </div>
          <button onClick={closeDetail} style={{ background: 'none', border: 'none', color: '#9fb0cc', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: '22px 24px' }}>
          {isAssure ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--csi-text-2)' }}>Statut</span>
                  <span style={css(badgeFor((d as { statut: string }).statut))}>{badgeVal}</span>
                </div>
                {row('Sexe', (d as { sexe: 'M' | 'F' }).sexe === 'M' ? 'Masculin' : 'Féminin')}
                {row('Date de naissance', (d as { naissance: string }).naissance)}
                {row('Groupe sanguin', (d as { groupe: string }).groupe, true)}
                {row('Profession', (d as { profession: string }).profession)}
                {row('Médecin traitant', (d as { traitant: string }).traitant)}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={detailAffecter} style={{ flex: 1, padding: 11, background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Gérer le médecin traitant</button>
                <button onClick={closeDetail} style={{ padding: '11px 18px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Fermer</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--csi-text-2)' }}>Type</span>
                  <span style={css(badgeFor((d as { type: string }).type))}>{badgeVal}</span>
                </div>
                {row('Spécialité', (d as { spec: string }).spec)}
                {row('Établissement', (d as { etab: string }).etab)}
                {row('Téléphone', (d as { tel: string }).tel, true)}
                {row('Patients suivis', String((d as { patients: number }).patients))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button onClick={closeDetail} style={{ padding: '11px 22px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Fermer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
