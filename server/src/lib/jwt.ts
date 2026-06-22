import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

/** Identité portée par le jeton et attachée à `req.user`. */
export interface AuthUser {
  id: string;
  role: Role;
  login: string;
}

export function signToken(user: AuthUser): string {
  const options: jwt.SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ role: user.role, login: user.login }, env.JWT_SECRET, options);
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  return {
    id: String(payload.sub),
    role: payload.role as Role,
    login: payload.login as string,
  };
}
