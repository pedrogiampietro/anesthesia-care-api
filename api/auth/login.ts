import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../../src/db/client.js';
import { users } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, serverError } from '../../src/http/responses.js';
import { parseBody } from '../../src/http/validation.js';
import { publicUser, signAuthToken, verifyPassword } from '../../src/modules/auth.js';

const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(120),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return methodNotAllowed(res);

  const body = parseBody(req, res, loginSchema);
  if (!body) return;

  try {
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return json(res, 401, { error: 'Invalid email or password.' });
    }

    return json(res, 200, {
      user: publicUser(user),
      token: signAuthToken(user),
    });
  } catch (error) {
    return serverError(res, error);
  }
}
