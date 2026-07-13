import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { ApiError, api } from '../../lib/api';
import { useFetch } from '../../lib/useApi';
import { useAppStore } from '../../store/useAppStore';

type AccountRole = 'ADMIN' | 'ASSUREUR' | 'MEDECIN';
type AccountStatus = 'ACTIF' | 'BLOQUE' | 'SUSPENDU';

interface AdminUser {
  id: string;
  login: string;
  role: AccountRole;
  statut: AccountStatus;
  nbEchecs: number;
  derniereConnexion: string | null;
  doitChangerMotDePasse: boolean;
  motDePasseTemporaireExpireLe: string | null;
  createdAt: string;
}

interface UsersResponse {
  utilisateurs: AdminUser[];
}

interface TemporaryPasswordResult {
  motDePasseTemporaire: string;
}

const card: CSSProperties = {
  background: 'var(--csi-surface)',
  border: '1px solid var(--csi-border)',
  borderRadius: 12,
};

const buttonBase: CSSProperties = {
  border: 'none',
  borderRadius: 8,
  padding: '9px 12px',
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

function displayRole(role: AccountRole) {
  if (role === 'ADMIN') return 'Administrateur';
  if (role === 'ASSUREUR') return 'Assureur';
  return 'Médecin';
}

function displayStatus(status: AccountStatus) {
  if (status === 'ACTIF') return 'Actif';
  if (status === 'BLOQUE') return 'Bloqué';
  return 'Suspendu';
}

function statusColors(status: AccountStatus): CSSProperties {
  if (status === 'ACTIF') return { background: '#e8f5ed', color: '#237247' };
  if (status === 'BLOQUE') return { background: '#fff3dc', color: '#8a5a08' };
  return { background: '#fbeaec', color: '#9a3040' };
}

function formatDate(value: string | null) {
  if (!value) return 'Jamais';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AdminUsers() {
  const { data, loading, error: loadError, reload } = useFetch<UsersResponse>('/admin/utilisateurs');
  const currentUserId = useAppStore((s) => s.userId);
  const showToast = useAppStore((s) => s.showToast);
  const [login, setLogin] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<{ title: string; value: string } | null>(null);

  const users = data?.utilisateurs ?? [];
  const counts = useMemo(() => ({
    total: users.length,
    actifs: users.filter((u) => u.statut === 'ACTIF').length,
    bloques: users.filter((u) => u.statut !== 'ACTIF').length,
  }), [users]);

  const error = actionError || loadError;

  async function createAssureur(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setActionError(null);
    setTemporaryPassword(null);
    try {
      const result = await api.post<TemporaryPasswordResult>('/admin/utilisateurs/assureurs', { login });
      setLogin('');
      setTemporaryPassword({ title: 'Compte assureur créé', value: result.motDePasseTemporaire });
      showToast('Compte assureur créé avec succès.');
      reload();
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause.message : 'Création du compte impossible.');
    } finally {
      setCreating(false);
    }
  }

  async function updateAccount(user: AdminUser, action: 'suspendre' | 'reactiver' | 'reset-mot-de-passe') {
    const wording = action === 'suspendre'
      ? `Suspendre le compte « ${user.login} » ? Ses accès seront immédiatement refusés.`
      : action === 'reset-mot-de-passe'
        ? `Réinitialiser le mot de passe de « ${user.login} » ? Toutes ses sessions seront invalidées.`
        : null;
    if (wording && !window.confirm(wording)) return;

    setBusyId(user.id);
    setActionError(null);
    if (action === 'reset-mot-de-passe') setTemporaryPassword(null);
    try {
      const result = await api.post<Partial<TemporaryPasswordResult>>(`/admin/utilisateurs/${user.id}/${action}`);
      if (result.motDePasseTemporaire) {
        setTemporaryPassword({ title: `Mot de passe réinitialisé pour ${user.login}`, value: result.motDePasseTemporaire });
      }
      showToast(action === 'suspendre' ? 'Compte suspendu.' : action === 'reactiver' ? 'Compte réactivé.' : 'Mot de passe réinitialisé.');
      reload();
    } catch (cause) {
      setActionError(cause instanceof ApiError ? cause.message : "L'action administrative a échoué.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyTemporaryPassword() {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword.value);
      showToast('Mot de passe temporaire copié.');
    } catch {
      setActionError('Copie automatique impossible. Sélectionnez le mot de passe manuellement.');
    }
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 6px', fontFamily: "'IBM Plex Serif', serif", fontSize: 25, color: 'var(--csi-text)' }}>Gestion des comptes</h1>
        <p style={{ margin: 0, color: 'var(--csi-text-2)', fontSize: 14 }}>Provisionnez les assureurs et contrôlez immédiatement les accès à la plateforme.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
        {[
          ['Comptes', counts.total],
          ['Actifs', counts.actifs],
          ['À traiter', counts.bloques],
        ].map(([label, value]) => (
          <div key={label} style={{ ...card, padding: '15px 18px' }}>
            <div style={{ color: 'var(--csi-text-2)', fontSize: 12 }}>{label}</div>
            <div style={{ color: 'var(--csi-text)', fontSize: 25, fontWeight: 700, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      <form onSubmit={createAssureur} style={{ ...card, padding: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: 'var(--csi-text)', marginBottom: 4 }}>Créer un compte assureur</div>
        <div style={{ color: 'var(--csi-text-2)', fontSize: 12.5, marginBottom: 12 }}>Un mot de passe temporaire sera généré et affiché une seule fois.</div>
        <div className="csi-toolbar" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
            minLength={3}
            maxLength={100}
            autoComplete="off"
            placeholder="Identifiant de l'agent"
            aria-label="Identifiant du nouvel assureur"
            style={{ flex: 1, minWidth: 220, padding: '11px 12px', border: '1px solid var(--csi-border)', borderRadius: 8, background: 'var(--csi-surface)', color: 'var(--csi-text)', outline: 'none' }}
          />
          <button type="submit" disabled={creating} style={{ ...buttonBase, padding: '11px 17px', background: creating ? '#8993a2' : 'var(--csi-primary)', color: '#fff', cursor: creating ? 'wait' : 'pointer' }}>
            {creating ? 'Création…' : 'Créer le compte'}
          </button>
        </div>
      </form>

      {temporaryPassword && (
        <div role="status" style={{ border: '1px solid #e4b76d', background: '#fff8e9', color: '#5d430e', borderRadius: 10, padding: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 5 }}>{temporaryPassword.title}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>Transmettez ce secret par un canal sûr. Il ne sera plus affiché après fermeture de ce message.</div>
            </div>
            <button type="button" onClick={() => setTemporaryPassword(null)} style={{ ...buttonBase, background: 'transparent', color: '#725217', padding: 4 }} aria-label="Masquer le mot de passe">✕</button>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <code style={{ background: '#fff', border: '1px solid #ebd7ae', borderRadius: 7, padding: '9px 11px', fontSize: 14, userSelect: 'all' }}>{temporaryPassword.value}</code>
            <button type="button" onClick={() => void copyTemporaryPassword()} style={{ ...buttonBase, background: '#725217', color: '#fff' }}>Copier</button>
          </div>
        </div>
      )}

      {error && <div role="alert" style={{ background: '#fbeaec', border: '1px solid #edc8ce', color: '#8f2b3a', borderRadius: 9, padding: '11px 13px', marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '15px 18px', borderBottom: '1px solid var(--csi-border)', fontWeight: 700, color: 'var(--csi-text)' }}>Utilisateurs</div>
        {loading ? (
          <div style={{ padding: 28, color: 'var(--csi-text-2)', textAlign: 'center' }}>Chargement des comptes…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 28, color: 'var(--csi-text-2)', textAlign: 'center' }}>Aucun compte disponible.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
              <thead>
                <tr style={{ background: 'var(--csi-surface-2)', color: 'var(--csi-text-2)', fontSize: 11.5, textAlign: 'left' }}>
                  {['Identifiant', 'Rôle', 'État', 'Échecs', 'Dernière connexion', 'Actions'].map((label) => <th key={label} style={{ padding: '11px 14px', fontWeight: 700 }}>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id} style={{ borderTop: '1px solid var(--csi-border)', color: 'var(--csi-text)', fontSize: 13 }}>
                      <td style={{ padding: '13px 14px', fontWeight: 650 }}>{user.login}{isSelf && <span style={{ color: 'var(--csi-muted)', fontWeight: 500 }}> · vous</span>}</td>
                      <td style={{ padding: '13px 14px' }}>{displayRole(user.role)}</td>
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{ ...statusColors(user.statut), display: 'inline-flex', borderRadius: 999, padding: '4px 8px', fontSize: 11.5, fontWeight: 700 }}>{displayStatus(user.statut)}</span>
                        {user.doitChangerMotDePasse && (
                          <div style={{ color: '#9a6815', fontSize: 10.5, marginTop: 5 }}>
                            Temporaire{user.motDePasseTemporaireExpireLe ? ` · expire le ${formatDate(user.motDePasseTemporaireExpireLe)}` : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '13px 14px' }}>{user.nbEchecs}</td>
                      <td style={{ padding: '13px 14px', color: 'var(--csi-text-2)' }}>{formatDate(user.derniereConnexion)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {user.statut === 'ACTIF' ? (
                            <button type="button" disabled={busy || isSelf} onClick={() => void updateAccount(user, 'suspendre')} title={isSelf ? 'Vous ne pouvez pas suspendre votre propre compte.' : 'Suspendre ce compte'} style={{ ...buttonBase, background: '#fbeaec', color: '#963143', opacity: busy || isSelf ? 0.45 : 1, cursor: busy || isSelf ? 'not-allowed' : 'pointer' }}>Suspendre</button>
                          ) : (
                            <button type="button" disabled={busy} onClick={() => void updateAccount(user, 'reactiver')} style={{ ...buttonBase, background: '#e8f5ed', color: '#237247', opacity: busy ? 0.5 : 1 }}>Réactiver</button>
                          )}
                          <button type="button" disabled={busy || isSelf} onClick={() => void updateAccount(user, 'reset-mot-de-passe')} title={isSelf ? 'Utilisez vos paramètres pour changer votre propre mot de passe.' : 'Réinitialiser le mot de passe'} style={{ ...buttonBase, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid var(--csi-border)', opacity: busy || isSelf ? 0.45 : 1, cursor: busy || isSelf ? 'not-allowed' : 'pointer' }}>{busy ? 'Traitement…' : 'Réinitialiser'}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
