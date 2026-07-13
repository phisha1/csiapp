import { useState, type CSSProperties } from 'react';
import { Icon } from '../../components/ui/Icon';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const labelS: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 };
const inputS: CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'transparent', color: 'var(--csi-text)' };

export function Parametres() {
  const { role, theme, setTheme, userLogin, logout, showToast } = useAppStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const avatarBg = role === 'assureur' ? '#7d2433' : '#14253f';
  const roleLabel = role === 'assureur' ? 'Assureur · Agent CNAM' : 'Médecin';
  const userInitials = (userLogin || roleLabel).slice(0, 2).toUpperCase();

  const changePassword = async () => {
    setPasswordError(null);
    if (!currentPassword || !newPassword || !passwordConfirmation) {
      setPasswordError('Renseignez les trois champs.');
      return;
    }
    if (newPassword !== passwordConfirmation) {
      setPasswordError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.post('/auth/change-password', {
        motDePasseActuel: currentPassword,
        nouveauMotDePasse: newPassword,
      });
      await logout();
      showToast('Mot de passe mis à jour. Reconnectez-vous.');
    } catch (error) {
      setPasswordError(error instanceof ApiError ? error.message : 'Impossible de modifier le mot de passe.');
    } finally {
      setPasswordSaving(false);
    }
  };

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
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19, flex: '0 0 56px' }}>{userInitials}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, color: 'var(--csi-text)', margin: 0, fontFamily: "'IBM Plex Serif', serif" }}>Compte connecté</h3>
            <p style={{ fontSize: 12.5, color: 'var(--csi-text-2)', margin: '3px 0 0' }}>Ces informations proviennent de votre session sécurisée.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label htmlFor="account-login" style={labelS}>Identifiant</label><input id="account-login" value={userLogin} readOnly style={{ ...inputS, background: 'var(--csi-surface-2)', color: 'var(--csi-text)' }} /></div>
          <div><label htmlFor="account-role" style={labelS}>Rôle</label><input id="account-role" value={roleLabel} readOnly style={{ ...inputS, background: 'var(--csi-surface-2)', color: 'var(--csi-text-2)' }} /></div>
        </div>
      </div>

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

      <form onSubmit={(event) => { event.preventDefault(); void changePassword(); }} style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 16px' }}>Sécurité</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}><label htmlFor="current-password" style={labelS}>Mot de passe actuel</label><input id="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" type="password" placeholder="••••••••" style={inputS} /></div>
          <div><label htmlFor="new-password" style={labelS}>Nouveau mot de passe</label><input id="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" type="password" placeholder="••••••••" style={inputS} /></div>
          <div><label htmlFor="password-confirmation" style={labelS}>Confirmer</label><input id="password-confirmation" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" type="password" placeholder="••••••••" style={inputS} /></div>
        </div>
        {passwordError && <div role="alert" style={{ marginTop: 14, color: '#b42318', fontSize: 13 }}>{passwordError}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="submit" disabled={passwordSaving} style={{ padding: '11px 22px', background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: passwordSaving ? 'wait' : 'pointer', opacity: passwordSaving ? .65 : 1 }}>{passwordSaving ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}</button>
        </div>
      </form>
    </div>
  );
}
