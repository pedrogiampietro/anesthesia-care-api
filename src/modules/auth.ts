import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import { users } from '../db/schema.js';
import { json } from '../http/responses.js';

const tokenExpiration = '7d';

type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

export type AuthUser = AuthTokenPayload & {
  id: string;
};

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return process.env.JWT_SECRET;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAuthToken(user: { id: string; email: string; name: string; role: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: tokenExpiration },
  );
}

export function publicUser(user: { id: string; name: string; email: string; role: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function requireAuth(req: VercelRequest, res: VercelResponse) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;

  if (!token) {
    json(res, 401, { error: 'Authentication required.' });
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
    const db = getDb();
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user) {
      json(res, 401, { error: 'Invalid authentication token.' });
      return null;
    }

    return {
      ...payload,
      ...user,
      sub: user.id,
    };
  } catch {
    json(res, 401, { error: 'Invalid authentication token.' });
    return null;
  }
}
