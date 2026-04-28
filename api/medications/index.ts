import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { getDb } from '../../src/db/client.js';
import { medications } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, serverError } from '../../src/http/responses.js';
import { parseBody } from '../../src/http/validation.js';
import { requireAuth } from '../../src/modules/auth.js';
import { createMedicationSchema } from '../../src/modules/catalog.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const db = getDb();
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const onlyActive = req.query.active === 'true';

      const rows = await db
        .select()
        .from(medications)
        .where(
          and(
            eq(medications.userId, user.id),
            onlyActive ? eq(medications.isActive, true) : undefined,
            search
              ? or(
                  ilike(medications.name, `%${search}%`),
                  ilike(medications.genericName, `%${search}%`),
                  ilike(medications.category, `%${search}%`),
                )
              : undefined,
          ),
        )
        .orderBy(desc(medications.createdAt));

      return json(res, 200, { medications: rows });
    }

    if (req.method === 'POST') {
      const body = parseBody(req, res, createMedicationSchema);
      if (!body) return;

      const db = getDb();
      const [createdMedication] = await db
        .insert(medications)
        .values({
          ...body,
          userId: user.id,
        })
        .returning();

      return json(res, 201, { medication: createdMedication });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
