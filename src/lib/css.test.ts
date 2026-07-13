import { describe, expect, it } from 'vitest';
import { css, sx } from './css';

describe('css', () => {
  it('convertit les propriétés CSS en propriétés React', () => {
    expect(css('background-color: red; font-size: 14px;')).toEqual({
      backgroundColor: 'red',
      fontSize: '14px',
    });
  });

  it('ignore les déclarations incomplètes', () => {
    expect(css('color:; invalide; padding: 4px')).toEqual({ padding: '4px' });
  });
});

describe('sx', () => {
  it('fusionne les styles dans l’ordre et conserve la dernière valeur', () => {
    expect(sx('color:#111;padding:4px', false, { color: '#fff' })).toEqual({
      color: '#fff',
      padding: '4px',
    });
  });
});
