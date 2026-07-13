import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';
import { AuthScreen } from './AuthScreen';

const initialState = useAppStore.getState();

describe('AuthScreen', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState(initialState, true);
    });
  });

  it('guide l’utilisateur de l’accueil vers le formulaire de connexion', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /connexion/i }));

    expect(screen.getByRole('heading', { name: /accès à la plateforme/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Votre identifiant')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeEnabled();
  });

  it('refuse une soumission vide sans appeler l’API', async () => {
    const post = vi.spyOn(api, 'post');
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /connexion/i }));
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(screen.getByText(/veuillez renseigner l'identifiant et le mot de passe/i)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it('ouvre la session avec le rôle renvoyé par le serveur', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({
      utilisateur: {
        id: 'admin-1',
        login: 'qa-admin',
        role: 'ADMIN',
        doitChangerMotDePasse: false,
        motDePasseTemporaireExpireLe: null,
      },
    });
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /connexion/i }));
    await user.type(screen.getByPlaceholderText('Votre identifiant'), 'qa-admin');
    await user.type(screen.getByPlaceholderText('••••••••'), 'MotDePasse-2026');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(useAppStore.getState()).toMatchObject({
        authed: true,
        role: 'admin',
        userLogin: 'qa-admin',
        screen: 'admin_users',
      });
    });
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      login: 'qa-admin',
      motDePasse: 'MotDePasse-2026',
    });
  });
});
