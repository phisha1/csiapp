import { useAppStore } from './store/useAppStore';
import { AuthScreen } from './screens/auth/AuthScreen';
import { AppShell } from './components/layout/AppShell';
import { Toast } from './components/ui/Toast';
import { MedConfirmModal } from './components/ui/MedConfirmModal';
import { DetailModal } from './components/ui/DetailModal';

export function App() {
  const authed = useAppStore((s) => s.authed);
  const theme = useAppStore((s) => s.theme);

  return (
    <div
      data-theme={theme === 'sombre' ? 'dark' : 'light'}
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: 'var(--csi-text)', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--csi-bg)' }}
    >
      {authed ? <AppShell /> : <AuthScreen />}
      <Toast />
      <DetailModal />
      <MedConfirmModal />
    </div>
  );
}
