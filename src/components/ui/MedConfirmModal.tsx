import { Icon } from './Icon';
import { useAppStore } from '../../store/useAppStore';

const NAMES: Record<string, string> = { 'MED-031': 'Dr. Atangana', 'MED-047': 'Dr. Fouda', 'MED-055': 'Dr. Eyenga' };

export function MedConfirmModal() {
  const { modal, traitSel, traitAssure, closeModal, confirmMedFinal } = useAppStore();
  if (modal !== 'medConfirm') return null;
  const selName = (traitSel && NAMES[traitSel]) || 'le médecin';
  const a = traitAssure;
  const assureLabel = a ? `${a.nom} ${a.prenom}` : 'l\'assuré';
  const assureId = a ? a.id : '';
  const hasTraitant = !!a && a.traitant !== '—' && a.traitant !== '';

  return (
    <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(17,35,62,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, animation: 'csiFade .2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--csi-surface)', borderRadius: 16, padding: 30, maxWidth: 420, width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,.3)', animation: 'csiPop .28s ease' }}>
        <div style={{ width: 54, height: 54, borderRadius: 13, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon name="stethoscope" size={26} stroke="var(--csi-primary)" width={1.7} />
        </div>
        <h3 style={{ fontSize: 18, color: 'var(--csi-text)', margin: '0 0 8px', fontFamily: "'IBM Plex Serif', serif" }}>{hasTraitant ? "Confirmer le remplacement" : "Confirmer l'association"}</h3>
        <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 22px', lineHeight: 1.6 }}>
          {hasTraitant ? (
            <>Remplacer le médecin traitant de <b style={{ color: 'var(--csi-text)' }}>{assureLabel}</b> ({assureId}) : <b style={{ color: '#8b3a2e' }}>{a?.traitant}</b> → <b style={{ color: '#2c5239' }}>{selName}</b> ?</>
          ) : (
            <>Désigner <b style={{ color: '#2c5239' }}>{selName}</b> comme médecin traitant de <b style={{ color: 'var(--csi-text)' }}>{assureLabel}</b> ({assureId}) ?</>
          )}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={closeModal} style={{ padding: '10px 20px', background: 'var(--csi-surface)', color: 'var(--csi-text-2)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Annuler</button>
          <button onClick={confirmMedFinal} style={{ padding: '10px 20px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
