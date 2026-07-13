import { describe, it, expect } from 'vitest';
import { signToken, verifyToken, type AuthUser } from './jwt';
import { Role } from '@prisma/client';

const user: AuthUser = { id: 'u-123', role: Role.ASSUREUR, login: 'agent01' };

describe('jwt (jetons de session signés)', () => {
  // CAS NOMINAL — ce qu'on signe, on doit le retrouver intact après vérification.
  // L'identité portée par le jeton (id, rôle, login) alimente tout le contrôle d'accès.
  it('retrouve l\'identité après signature puis vérification', () => {
    const decoded = verifyToken(signToken(user));
    expect(decoded.id).toBe('u-123');
    expect(decoded.role).toBe(Role.ASSUREUR);
    expect(decoded.login).toBe('agent01');
  });

  // PROPRIÉTÉ DE SÉCURITÉ — un jeton falsifié doit être REJETÉ.
  // La signature garantit qu'un attaquant ne peut pas forger un jeton
  // (par ex. se donner le rôle ASSUREUR) sans connaître le secret serveur.
  it('rejette un jeton falsifié', () => {
    const falsifie = signToken(user).slice(0, -3) + 'xxx';
    expect(() => verifyToken(falsifie)).toThrow();
  });

  // CAS D'ERREUR — une chaîne qui n'est pas un jeton doit lever une erreur,
  // pas renvoyer une identité vide exploitable.
  it('rejette une valeur qui n\'est pas un jeton', () => {
    expect(() => verifyToken('n-importe-quoi')).toThrow();
  });
});
