import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../../src/db/client.js';
import { products } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, noContent, serverError } from '../../src/http/responses.js';
import { getIdParam, parseBody } from '../../src/http/validation.js';
import { requireAuth } from '../../src/modules/auth.js';
import { updateProductSchema } from '../../src/modules/catalog.js';

const idSchema = z.string().uuid();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const id = idSchema.safeParse(getIdParam(req));
  if (!id.success) {
    return json(res, 400, { error: 'Invalid product id.' });
  }

  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const db = getDb();
    const where = and(eq(products.id, id.data), eq(products.userId, user.id));

    if (req.method === 'GET') {
      const [product] = await db.select().from(products).where(where).limit(1);

      if (!product) {
        return json(res, 404, { error: 'Product not found.' });
      }

      return json(res, 200, { product });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = parseBody(req, res, updateProductSchema);
      if (!body) return;

      const [updatedProduct] = await db
        .update(products)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(where)
        .returning();

      if (!updatedProduct) {
        return json(res, 404, { error: 'Product not found.' });
      }

      return json(res, 200, { product: updatedProduct });
    }

    if (req.method === 'DELETE') {
      const [deletedProduct] = await db.delete(products).where(where).returning({ id: products.id });

      if (!deletedProduct) {
        return json(res, 404, { error: 'Product not found.' });
      }

      return noContent(res);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
