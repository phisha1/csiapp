import type { CSSProperties } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { useAppStore } from '../../store/useAppStore';

const labelS: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 };
const inputS: CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'transparent', color: 'var(--csi-text)' };

export function Parametres() {
  const { role, theme, setTheme, saveProfile, savePassword } = useAppStore();
  const isMedecin = role === 'medecin';
  const userInitials = role === 'assureur' ? 'AN' : 'DA';
  const avatarBg = role === 'assureur' ? '#7d2433' : '#14253f';
  const roleLabel = role === 'assureur' ? 'Assureur · Agent CNAM' : 'Médecin';

  const prof = role === 'assureur'
    ? { nom: 'Ngono', prenom: 'Aline', email: 'a.ngono@cnam.cm', matLabel: 'Matricule agent', mat: 'AG-2024-018', orgLabel: 'Antenne / Bureau', org: 'Antenne CNAM de Yaoundé' }
    : { nom: 'Atangana', prenom: 'Pauline', email: 'p.atangana@cnam.cm', matLabel: "Numéro d'ordre (ONMC)", mat: 'CM-MED-031', orgLabel: 'Établissement', org: "Centre Médical d'Etoudi" };

  const themeBtn = (active: boolean, accent: string): CSSProperties => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 13,
    borderRadius: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all .15s',
    background: active ? 'var(--csi-surface-2)' : 'var(--csi-surface)',
    color: active ? 'var(--csi-text)' : 'var(--csi-text-2)',
    border: `2px solid ${active ? accent : 'var(--csi-border)'}`,
  });

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Profil */}
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19, flex: '0 0 56px' }}>{userInitials}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: 0, fontFamily: "'IBM Plex Serif', serif" }}>Informations du profil</h3>
            <p style={{ fontSize: 12.5, color: 'var(--csi-text-2)', margin: '3px 0 0' }}>{roleLabel}</p>
          </div>
          <button style={{ padding: '8px 14px', background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid var(--csi-border)', borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Changer la photo</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={labelS}>Nom</label><input defaultValue={prof.nom} style={inputS} /></div>
          <div><label style={labelS}>Prénom</label><input defaultValue={prof.prenom} style={inputS} /></div>
          <div><label style={labelS}>Adresse e-mail</label><input defaultValue={prof.email} style={inputS} /></div>
          <div><label style={labelS}>Téléphone</label><input defaultValue="+237 6 99 12 34 56" style={inputS} /></div>
          <div><label style={labelS}>{prof.matLabel}</label><input defaultValue={prof.mat} style={{ ...inputS, fontFamily: "'IBM Plex Mono', monospace" }} /></div>
          <div><label style={labelS}>{prof.orgLabel}</label><input defaultValue={prof.org} style={inputS} /></div>
          {isMedecin && (
            <>
              <div>
                <label style={labelS}>Type</label>
                <select style={{ ...inputS, color: 'var(--csi-text)' }}><option>Généraliste</option><option>Spécialiste</option></select>
              </div>
              <div><label style={labelS}>Spécialité</label><input defaultValue="Médecine générale" style={inputS} /></div>
            </>
          )}
          <div><label style={labelS}>Rôle</label><input value={roleLabel} disabled style={{ ...inputS, background: 'var(--csi-surface-2)', color: 'var(--csi-text-2)' }} /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <Box as="button" onClick={saveProfile} sx="padding:11px 22px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">Enregistrer les modifications</Box>
        </div>
      </div>

      {/* Apparence (thème) */}
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>Apparence</h3>
        <p style={{ fontSize: 12.5, color: 'var(--csi-text-2)', margin: '0 0 16px' }}>Choisissez le thème de l'interface. Votre choix est mémorisé.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setTheme('clair')} style={themeBtn(theme === 'clair', '#14253f')}>
            <Icon name="sun" size={18} /> Clair
          </button>
          <button onClick={() => setTheme('sombre')} style={themeBtn(theme === 'sombre', '#e07b1f')}>
            <Icon name="moon" size={18} /> Sombre
          </button>
        </div>
      </div>

      {/* Sécurité */}
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 16px' }}>Sécurité</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelS}>Mot de passe actuel</label><input type="password" placeholder="••••••••" style={inputS} /></div>
          <div><label style={labelS}>Nouveau mot de passe</label><input type="password" placeholder="••••••••" style={inputS} /></div>
          <div><label style={labelS}>Confirmer</label><input type="password" placeholder="••••••••" style={inputS} /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={savePassword} style={{ padding: '11px 22px', background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Mettre à jour le mot de passe</button>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 16px' }}>Notifications</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--csi-border)' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--csi-text)' }}>Notifications par e-mail</div>
            <div style={{ fontSize: 12, color: 'var(--csi-muted)' }}>Recevoir les alertes de feuilles en attente</div>
          </div>
          <div style={{ width: 42, height: 24, background: '#1f8a4c', borderRadius: 12, position: 'relative' }}><div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, right: 3 }} /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--csi-text)' }}>Alertes de remboursement</div>
            <div style={{ fontSize: 12, color: 'var(--csi-muted)' }}>Notifier à chaque remboursement effectué</div>
          </div>
          <div style={{ width: 42, height: 24, background: '#1f8a4c', borderRadius: 12, position: 'relative' }}><div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, right: 3 }} /></div>
        </div>
      </div>
    </div>
  );
}
