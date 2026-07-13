import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';
import { ChangePasswordScreen } from './ChangePasswordScreen';

const initialState = useAppStore.getState();

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState({ ...initialState, authed: true, userLogin: 'agent.cnam' }, true);
    });
  });

  it('bloque un nouveau mot de passe trop faible', async () => {
    const post = vi.spyOn(api, 'post');
    const user = userEvent.setup();
    const { container } = render(<ChangePasswordScreen />);
    const [current, next, confirmation] = Array.from(container.querySelectorAll('input'));

    await user.type(current, 'Temporaire-1');
    await user.type(next, 'faible');
    await user.type(confirmation, 'faible');
    await user.click(screen.getByRole('button', { name: /définir mon nouveau mot de passe/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/au moins 8 caractères, une lettre et un chiffre/i);
    expect(post).not.toHaveBeenCalled();
  });

  it('modifie le mot de passe puis ferme la session', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({});
    const user = userEvent.setup();
    const { container } = render(<ChangePasswordScreen />);
    const [current, next, confirmation] = Array.from(container.querySelectorAll('input'));

    await user.type(current, 'Temporaire-1');
    await user.type(next, 'Nouveau-2026');
    await user.type(confirmation, 'Nouveau-2026');
    await user.click(screen.getByRole('button', { name: /définir mon nouveau mot de passe/i }));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post).toHaveBeenNthCalledWith(1, '/auth/change-password', {
      motDePasseActuel: 'Temporaire-1',
      nouveauMotDePasse: 'Nouveau-2026',
    });
    expect(post).toHaveBeenNthCalledWith(2, '/auth/logout');
    expect(useAppStore.getState().authed).toBe(false);
  });
});
