import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, json, methodNotAllowed, serverError } from '../../src/http/responses.js';
import { publicUser, requireAuth } from '../../src/modules/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    return json(res, 200, { user: publicUser(user) });
  } catch (error) {
    return serverError(res, error);
  }
}
