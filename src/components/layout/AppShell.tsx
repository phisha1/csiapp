import { useAppStore } from '../../store/useAppStore';
import { useViewport } from '../../lib/useViewport';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ScreenRouter } from './ScreenRouter';
import { Fab } from '../ui/Fab';

export function AppShell() {
  const screen = useAppStore((s) => s.screen);
  const navOpen = useAppStore((s) => s.navOpen);
  const closeNav = useAppStore((s) => s.closeNav);
  const { isMobile } = useViewport();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <Sidebar />

      {/* Voile : ferme le tiroir au clic (mobile) */}
      {isMobile && navOpen && (
        <div
          onClick={closeNav}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8,16,28,.5)', zIndex: 75, animation: 'csiFade .2s ease' }}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <Header />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px 84px' : '26px 28px 60px', background: 'var(--csi-bg)' }}>
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
