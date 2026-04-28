import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../../src/db/client.js';
import { medications } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, noContent, serverError } from '../../src/http/responses.js';
import { getIdParam, parseBody } from '../../src/http/validation.js';
import { requireAuth } from '../../src/modules/auth.js';
import { updateMedicationSchema } from '../../src/modules/catalog.js';

const idSchema = z.string().uuid();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const id = idSchema.safeParse(getIdParam(req));
  if (!id.success) {
    return json(res, 400, { error: 'Invalid medication id.' });
  }

  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    const where = and(eq(medications.id, id.data), eq(medications.userId, user.id));

    if (req.method === 'GET') {
      const [medication] = await db.select().from(medications).where(where).limit(1);

      if (!medication) {
        return json(res, 404, { error: 'Medication not found.' });
      }

      return json(res, 200, { medication });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = parseBody(req, res, updateMedicationSchema);
      if (!body) return;

      const [updatedMedication] = await db
        .update(medications)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(where)
        .returning();

      if (!updatedMedication) {
        return json(res, 404, { error: 'Medication not found.' });
      }

      return json(res, 200, { medication: updatedMedication });
    }

    if (req.method === 'DELETE') {
      const [deletedMedication] = await db.delete(medications).where(where).returning({ id: medications.id });

      if (!deletedMedication) {
        return json(res, 404, { error: 'Medication not found.' });
      }

      return noContent(res);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
