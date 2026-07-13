import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { AuthScreen } from './screens/auth/AuthScreen';
import { AppShell } from './components/layout/AppShell';
import { Toast } from './components/ui/Toast';
import { MedConfirmModal } from './components/ui/MedConfirmModal';
import { DetailModal } from './components/ui/DetailModal';
import { ChangePasswordScreen } from './screens/auth/ChangePasswordScreen';

export function App() {
  const authed = useAppStore((s) => s.authed);
  const sessionChecked = useAppStore((s) => s.sessionChecked);
  const theme = useAppStore((s) => s.theme);
  const mustChangePassword = useAppStore((s) => s.mustChangePassword);
  const restoreSession = useAppStore((s) => s.restoreSession);

  // Reconnexion automatique si un jeton JWT valide est présent.
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return (
    <div
      data-theme={theme === 'sombre' ? 'dark' : 'light'}
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: 'var(--csi-text)', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--csi-bg)' }}
    >
      {!sessionChecked ? (
        <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--csi-text-2)', fontSize: 13 }}>Vérification de la session…</div>
      ) : authed ? (mustChangePassword ? <ChangePasswordScreen /> : <AppShell />) : <AuthScreen />}
      <Toast />
      {authed && !mustChangePassword && <DetailModal />}
      {authed && !mustChangePassword && <MedConfirmModal />}
    </div>
  );
}
