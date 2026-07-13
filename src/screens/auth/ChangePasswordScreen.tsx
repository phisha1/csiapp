import { useState, type CSSProperties, type FormEvent } from 'react';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 13px',
  border: '1.5px solid var(--csi-border)',
  borderRadius: 9,
  background: 'var(--csi-surface)',
  color: 'var(--csi-text)',
  fontSize: 14,
  outline: 'none',
};

const labelStyle: CSSProperties = {
  display: 'block',
  color: 'var(--csi-text)',
  fontSize: 12.5,
  fontWeight: 700,
  marginBottom: 6,
};

export function ChangePasswordScreen() {
  const userLogin = useAppStore((s) => s.userLogin);
  const expiresAt = useAppStore((s) => s.temporaryPasswordExpiresAt);
  const logout = useAppStore((s) => s.logout);
  const showToast = useAppStore((s) => s.showToast);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const expiryLabel = expiresAt
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(expiresAt))
    : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Le nouveau mot de passe doit être différent du mot de passe temporaire.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        motDePasseActuel: currentPassword,
        nouveauMotDePasse: newPassword,
      });
      showToast('Mot de passe modifié. Reconnectez-vous avec votre nouveau mot de passe.');
      void logout();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Modification du mot de passe impossible.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'var(--csi-bg)' }}>
      <div style={{ width: '100%', maxWidth: 470, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 15, padding: 28, boxShadow: '0 18px 50px rgba(20,37,63,.12)' }}>
        <div style={{ width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: 13, background: '#fff3dc', color: '#8a5a08', fontSize: 23, fontWeight: 800, marginBottom: 18 }}>!</div>
        <h1 style={{ margin: '0 0 8px', color: 'var(--csi-text)', fontFamily: "'IBM Plex Serif', serif", fontSize: 24 }}>Changement de mot de passe obligatoire</h1>
        <p style={{ color: 'var(--csi-text-2)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 6px' }}>
          Le compte <strong>{userLogin}</strong> utilise un mot de passe temporaire. Aucun dossier métier n’est accessible avant son remplacement.
        </p>
        {expiryLabel && <p style={{ color: '#8a5a08', fontSize: 12.5, margin: '0 0 20px' }}>Ce mot de passe temporaire expire le {expiryLabel}.</p>}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Mot de passe temporaire</label>
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required autoComplete="new-password" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>Confirmer le nouveau mot de passe</label>
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="new-password" style={inputStyle} />
          </div>

          <div style={{ color: 'var(--csi-muted)', fontSize: 11.5, lineHeight: 1.5, marginBottom: 14 }}>Minimum 8 caractères, avec au moins une lettre et un chiffre.</div>
          {error && <div role="alert" style={{ padding: '10px 12px', borderRadius: 8, background: '#fbeaec', border: '1px solid #edc8ce', color: '#8f2b3a', fontSize: 12.5, marginBottom: 14 }}>{error}</div>}

          <button type="submit" disabled={saving} style={{ width: '100%', border: 'none', borderRadius: 9, padding: 12, background: saving ? '#8c97a7' : 'var(--csi-primary)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'Modification…' : 'Définir mon nouveau mot de passe'}
          </button>
          <button type="button" onClick={() => void logout()} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--csi-text-2)', padding: '12px 0 0', cursor: 'pointer', fontSize: 12.5 }}>Annuler et se déconnecter</button>
        </form>
      </div>
    </div>
  );
}
