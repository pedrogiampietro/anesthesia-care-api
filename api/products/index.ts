import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { getDb } from '../../src/db/client.js';
import { products } from '../../src/db/schema.js';
import { handleOptions, json, methodNotAllowed, serverError } from '../../src/http/responses.js';
import { parseBody } from '../../src/http/validation.js';
import { createProductSchema } from '../../src/modules/catalog.js';
import { requireAuth } from '../../src/modules/auth.js';

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
        .from(products)
        .where(
          and(
            eq(products.userId, user.id),
            onlyActive ? eq(products.isActive, true) : undefined,
            search
              ? or(
                  ilike(products.name, `%${search}%`),
                  ilike(products.sku, `%${search}%`),
                  ilike(products.category, `%${search}%`),
                )
              : undefined,
          ),
        )
        .orderBy(desc(products.createdAt));

      return json(res, 200, { products: rows });
    }

    if (req.method === 'POST') {
      const body = parseBody(req, res, createProductSchema);
      if (!body) return;

      const db = getDb();
      const [createdProduct] = await db
        .insert(products)
        .values({
          ...body,
          userId: user.id,
        })
        .returning();

      return json(res, 201, { product: createdProduct });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
