import { act, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';
import { Sidebar } from './Sidebar';

const initialState = useAppStore.getState();

describe('Sidebar', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState({
        ...initialState,
        authed: true,
        role: 'assureur',
        screen: 'dashboard',
        userLogin: 'agent.cnam',
      }, true);
    });
  });

  it('affiche le nombre réel de feuilles en attente', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ feuillesAttente: 7 });
    render(<Sidebar />);
    const feuilles = screen.getByRole('button', { name: /feuilles de maladie/i });

    await waitFor(() => expect(within(feuilles).getByText('7')).toBeInTheDocument());
    expect(api.get).toHaveBeenCalledWith('/stats');
  });

  it('masque le badge lorsque aucune feuille n’attend de traitement', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ feuillesAttente: 0 });
    render(<Sidebar />);
    const feuilles = screen.getByRole('button', { name: /feuilles de maladie/i });

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/stats'));
    expect(within(feuilles).queryByText('0')).not.toBeInTheDocument();
  });
});
