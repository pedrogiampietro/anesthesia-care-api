import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, desc, eq, ilike } from 'drizzle-orm';
import { getDb } from '../../src/db/client.js';
import { patients } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, serverError } from '../../src/http/responses.js';
import { parseBody } from '../../src/http/validation.js';
import { requireAuth } from '../../src/modules/auth.js';
import { createPatientSchema } from '../../src/modules/catalog.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const db = getDb();
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

      const rows = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.userId, user.id),
            search ? ilike(patients.name, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(patients.createdAt));

      return json(res, 200, { patients: rows });
    }

    if (req.method === 'POST') {
      const body = parseBody(req, res, createPatientSchema);
      if (!body) return;

      const db = getDb();
      const [createdPatient] = await db
        .insert(patients)
        .values({
          ...body,
          userId: user.id,
        })
        .returning();

      return json(res, 201, { patient: createdPatient });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
