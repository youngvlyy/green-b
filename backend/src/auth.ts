import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || 'access-dev-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-dev-secret';

export interface AccessPayload  { uid: string; email: string }
export interface RefreshPayload { uid: string; jti: string }

export const signAccess = (uid: string, email: string) =>
  jwt.sign({ uid, email } as AccessPayload, ACCESS_SECRET, { expiresIn: '15m' });

export const signRefresh = (uid: string, jti: string) =>
  jwt.sign({ uid, jti } as RefreshPayload, REFRESH_SECRET, { expiresIn: '7d' });

export const verifyAccess = (token: string) =>
  jwt.verify(token, ACCESS_SECRET) as AccessPayload;

export const verifyRefresh = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as RefreshPayload;

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');
