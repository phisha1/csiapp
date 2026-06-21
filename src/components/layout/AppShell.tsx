import { useAppStore } from '../../store/useAppStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ScreenRouter } from './ScreenRouter';
import { Fab } from '../ui/Fab';

export function AppShell() {
  const screen = useAppStore((s) => s.screen);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto', padding: '26px 28px 60px', background: 'var(--csi-bg)' }}>
            {/* `key` force le rejeu de l'animation csiFade à chaque changement d'écran */}
            <div key={screen} style={{ animation: 'csiFade .35s ease' }}>
              <ScreenRouter />
            </div>
          </main>
        </div>
      </div>

      <Fab />
    </div>
  );
}
