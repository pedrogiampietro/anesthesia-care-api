import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError, type ZodSchema } from 'zod';
import { json } from './responses.js';

export function parseBody<T>(req: VercelRequest, res: VercelResponse, schema: ZodSchema<T>) {
  try {
    const input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      json(res, 400, {
        error: 'Validation error.',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return null;
    }

    json(res, 400, { error: 'Invalid JSON body.' });
    return null;
  }
}

export function getIdParam(req: VercelRequest) {
  const id = req.query.id;
  return Array.isArray(id) ? id[0] : id;
}
