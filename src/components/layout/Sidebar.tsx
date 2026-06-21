import { Box } from '../ui/Box';
import { Icon } from '../ui/Icon';
import { navConfig } from '../../data/navConfig';
import { useAppStore } from '../../store/useAppStore';

export function Sidebar() {
  const { role, screen, go, logout } = useAppStore();
  const items = navConfig[role];

  const userName = role === 'assureur' ? 'A. Ngono' : 'Dr. Atangana';
  const userInitials = role === 'assureur' ? 'AN' : 'DA';
  const roleLabel = role === 'assureur' ? 'Assureur · Agent CNAM' : 'Médecin';
  const avatarBg = role === 'assureur' ? '#7d2433' : '#14253f';

  return (
    <aside style={{ flex: '0 0 248px', background: '#11233e', color: '#c7d3e4', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '20px 20px 18px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #e07b1f, #c2611a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 17 }}>
          C
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>CNAM · CSI</div>
          <div style={{ fontSize: 11, color: '#8294b2' }}>Sécurité Sociale</div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5d6f8e', padding: '6px 12px 8px' }}>Navigation</div>
        {items.map((item) => {
          const active = screen === item.key;
          return (
            <Box
              as="button"
              key={item.key}
              onClick={() => go(item.key)}
              sx={`display:flex;align-items:center;gap:11px;width:100%;padding:9px 12px;margin-bottom:2px;border:none;border-radius:9px;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:${active ? 600 : 500};text-align:left;transition:all .15s;${
                active ? 'background:rgba(224,123,31,.16);color:#fff;box-shadow:inset 2px 0 0 #e07b1f;' : 'background:transparent;color:#aebbcf;'
              }`}
            >
              <span style={{ width: 18, display: 'inline-flex', justifyContent: 'center' }}>
                <Icon name={item.key} />
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: active ? '#e07b1f' : 'rgba(255,255,255,.12)', color: '#fff', fontSize: 10.5, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  {item.badge}
                </span>
              )}
            </Box>
          );
        })}
      </nav>

      <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 9, background: 'rgba(255,255,255,.04)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
            {userInitials}
          </div>
          <div style={{ flex: 1, lineHeight: 1.25, overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: 11, color: '#8294b2' }}>{roleLabel}</div>
          </div>
          <Box as="button" onClick={logout} title="Déconnexion" sx="background:none;border:none;color:#8294b2;cursor:pointer;padding:4px;display:inline-flex;" hover="color:#fff;">
            <Icon name="power" size={15} width={2} />
          </Box>
        </div>
      </div>
    </aside>
  );
}
