import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

/** Identité portée par le jeton et attachée à `req.user`. */
export interface AuthUser {
  id: string;
  role: Role;
  login: string;
  versionSession?: number;
}

/** Identité + métadonnées techniques du jeton vérifié (jti pour la révocation, iat, exp). */
export interface VerifiedToken extends AuthUser {
  jti: string; // identifiant unique du jeton (clé de la liste de révocation)
  iat: number; // date d'émission (secondes epoch) — comparée à jetonsInvalidesAvant
  exp: number; // date d'expiration (secondes epoch)
  doitChangerMotDePasse?: boolean;
  motDePasseTemporaireExpireLe?: Date | null;
}

export function signToken(user: AuthUser): string {
  const options: jwt.SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    jwtid: randomUUID(), // chaque jeton est unique → révocable individuellement
  };
  return jwt.sign(
    { role: user.role, login: user.login, versionSession: user.versionSession ?? 0 },
    env.JWT_SECRET,
    options,
  );
}

export function verifyToken(token: string): VerifiedToken {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  return {
    id: String(payload.sub),
    role: payload.role as Role,
    login: payload.login as string,
    versionSession: Number(payload.versionSession ?? 0),
    jti: String(payload.jti),
    iat: Number(payload.iat),
    exp: Number(payload.exp),
  };
}
