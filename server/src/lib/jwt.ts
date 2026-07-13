import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

/** Identité portée par le jeton et attachée à `req.user`. */
export interface AuthUser {
  id: string;
  role: Role;
  login: string;
}

/** Identité + métadonnées techniques du jeton vérifié (jti pour la révocation, exp). */
export interface VerifiedToken extends AuthUser {
  jti: string; // identifiant unique du jeton (clé de la liste de révocation)
  exp: number; // date d'expiration (secondes epoch)
}

export function signToken(user: AuthUser): string {
  const options: jwt.SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    jwtid: randomUUID(), // chaque jeton est unique → révocable individuellement
  };
  return jwt.sign({ role: user.role, login: user.login }, env.JWT_SECRET, options);
}

export function verifyToken(token: string): VerifiedToken {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  return {
    id: String(payload.sub),
    role: payload.role as Role,
    login: payload.login as string,
    jti: String(payload.jti),
    exp: Number(payload.exp),
  };
}
