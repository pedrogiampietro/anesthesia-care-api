import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../../src/db/client.js';
import { users } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, serverError } from '../../src/http/responses.js';
import { parseBody } from '../../src/http/validation.js';
import { hashPassword, publicUser, signAuthToken } from '../../src/modules/auth.js';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(120),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return methodNotAllowed(res);

  const body = parseBody(req, res, registerSchema);
  if (!body) return;

  try {
    const db = getDb();
    const [existingUser] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

    if (existingUser) {
      return json(res, 409, { error: 'Email already registered.' });
    }

    const [createdUser] = await db
      .insert(users)
      .values({
        name: body.name,
        email: body.email,
        passwordHash: await hashPassword(body.password),
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return json(res, 201, {
      user: publicUser(createdUser),
      token: signAuthToken(createdUser),
    });
  } catch (error) {
    return serverError(res, error);
  }
}
