import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../../src/db/client.js';
import { patients } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, noContent, serverError } from '../../src/http/responses.js';
import { getIdParam, parseBody } from '../../src/http/validation.js';
import { requireAuth } from '../../src/modules/auth.js';
import { updatePatientSchema } from '../../src/modules/catalog.js';

const idSchema = z.string().uuid();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const id = idSchema.safeParse(getIdParam(req));
  if (!id.success) {
    return json(res, 400, { error: 'Invalid patient id.' });
  }

  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    const where = and(eq(patients.id, id.data), eq(patients.userId, user.id));

    if (req.method === 'GET') {
      const [patient] = await db.select().from(patients).where(where).limit(1);

      if (!patient) {
        return json(res, 404, { error: 'Patient not found.' });
      }

      return json(res, 200, { patient });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = parseBody(req, res, updatePatientSchema);
      if (!body) return;

      const [updatedPatient] = await db
        .update(patients)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(where)
        .returning();

      if (!updatedPatient) {
        return json(res, 404, { error: 'Patient not found.' });
      }

      return json(res, 200, { patient: updatedPatient });
    }

    if (req.method === 'DELETE') {
      const [deletedPatient] = await db.delete(patients).where(where).returning({ id: patients.id });

      if (!deletedPatient) {
        return json(res, 404, { error: 'Patient not found.' });
      }

      return noContent(res);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
