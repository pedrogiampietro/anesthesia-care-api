import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, json } from '../src/http/responses.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  return json(res, 200, {
    status: 'ok',
    service: 'anesthesia-care-api',
    timestamp: new Date().toISOString(),
  });
}
