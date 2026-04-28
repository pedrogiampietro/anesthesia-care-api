import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, json } from '../src/http/responses.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  return json(res, 200, {
    service: 'anesthesia-care-api',
    status: 'online',
    endpoints: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      patients: '/api/patients',
      products: '/api/products',
      medications: '/api/medications',
    },
  });
}
