import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';
import { Parametres } from './Parametres';

const initialState = useAppStore.getState();

describe('Parametres', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState({
        ...initialState,
        authed: true,
        role: 'assureur',
        userLogin: 'agent.cnam',
        theme: 'clair',
      }, true);
    });
  });

  it('affiche l’identité de la session sans profil fictif', () => {
    render(<Parametres />);

    expect(screen.getByLabelText('Identifiant')).toHaveValue('agent.cnam');
    expect(screen.getByLabelText('Rôle')).toHaveValue('Assureur · Agent CNAM');
    expect(screen.getByLabelText('Identifiant')).toHaveAttribute('readonly');
  });

  it('mémorise le changement de thème', async () => {
    const user = userEvent.setup();
    render(<Parametres />);

    await user.click(screen.getByRole('button', { name: /sombre/i }));

    expect(useAppStore.getState().theme).toBe('sombre');
    expect(localStorage.getItem('csi-theme')).toBe('sombre');
  });

  it('refuse une confirmation différente sans appel réseau', async () => {
    const post = vi.spyOn(api, 'post');
    const user = userEvent.setup();
    render(<Parametres />);

    await user.type(screen.getByLabelText('Mot de passe actuel'), 'Ancien-2026');
    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'Nouveau-2026');
    await user.type(screen.getByLabelText('Confirmer'), 'Autre-2026');
    await user.click(screen.getByRole('button', { name: /mettre à jour le mot de passe/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/la confirmation ne correspond pas/i);
    expect(post).not.toHaveBeenCalled();
  });
});
