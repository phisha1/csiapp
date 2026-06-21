import { Box } from './Box';
import { Icon } from './Icon';
import { useAppStore } from '../../store/useAppStore';

/** Bouton flottant : retour au tableau de bord (visible hors dashboard). */
export function Fab() {
  const { authed, screen, go } = useAppStore();
  if (!authed || screen === 'dashboard') return null;
  return (
    <Box
      as="button"
      onClick={() => go('dashboard')}
      title="Retour au tableau de bord"
      sx="position:fixed;bottom:24px;right:24px;z-index:70;display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:var(--csi-primary);color:#fff;border:none;border-radius:50%;cursor:pointer;box-shadow:0 8px 20px rgba(20,37,63,.28);"
      hover="background:var(--csi-primary-hover);transform:translateY(-2px);box-shadow:0 12px 28px rgba(20,37,63,.38);"
    >
      <Icon name="home" size={19} stroke="#fff" width={1.9} />
    </Box>
  );
}
