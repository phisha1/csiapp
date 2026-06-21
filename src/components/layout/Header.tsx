import { Box } from '../ui/Box';
import { Icon } from '../ui/Icon';
import { screenTitles } from '../../data/traceMap';
import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const { role, screen } = useAppStore();
  const crumbTop = role === 'assureur' ? 'CNAM · Espace Assureur' : 'CNAM · Espace Médecin';

  return (
    <header style={{ height: 62, flex: '0 0 62px', background: 'var(--csi-surface)', borderBottom: '1px solid var(--csi-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 18 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--csi-muted)', letterSpacing: '.04em' }}>{crumbTop}</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--csi-text)', fontFamily: "'IBM Plex Serif', serif" }}>{screenTitles[screen] || ''}</div>
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
