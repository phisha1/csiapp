import { useAppStore } from '../../store/useAppStore';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 26,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--csi-primary)',
        color: '#fff',
        padding: '13px 22px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 12px 32px rgba(0,0,0,.22)',
        zIndex: 90,
        animation: 'csiPop .3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <span style={{ color: '#6ce0a0' }}>✓</span> {toast}
    </div>
  );
}
