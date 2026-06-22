import { Box } from '../ui/Box';
import { Icon } from '../ui/Icon';
import { screenTitles } from '../../data/traceMap';
import { useAppStore } from '../../store/useAppStore';
import { useViewport } from '../../lib/useViewport';

export function Header() {
  const { role, screen, toggleNav } = useAppStore();
  const { isMobile } = useViewport();
  const crumbTop = role === 'assureur' ? 'CNAM · Espace Assureur' : 'CNAM · Espace Médecin';

  return (
    <header style={{ height: 62, flex: '0 0 62px', background: 'var(--csi-surface)', borderBottom: '1px solid var(--csi-border)', display: 'flex', alignItems: 'center', padding: isMobile ? '0 12px' : '0 24px', gap: isMobile ? 12 : 18 }}>
      {isMobile && (
        <Box
          as="button"
          onClick={toggleNav}
          title="Menu"
          aria-label="Ouvrir le menu"
          sx="flex:0 0 auto;width:40px;height:40px;border-radius:9px;border:1px solid var(--csi-border);background:var(--csi-surface);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;"
          hover="background:var(--csi-surface-2);"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#44515f" strokeWidth={2} strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </Box>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--csi-muted)', letterSpacing: '.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{crumbTop}</div>
        <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 600, color: 'var(--csi-text)', fontFamily: "'IBM Plex Serif', serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{screenTitles[screen] || ''}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Box as="button" title="Notifications" sx="width:38px;height:38px;border-radius:9px;border:1px solid var(--csi-border);background:var(--csi-surface);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;" hover="background:var(--csi-surface-2);">
            <Icon name="bell" size={17} stroke="#44515f" />
          </Box>
          <span style={{ position: 'absolute', top: -3, right: -3, background: '#e07b1f', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 17, height: 17, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
            3
          </span>
        </div>
      </div>
    </header>
  );
}
