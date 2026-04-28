import type { VercelRequest, VercelResponse } from '@vercel/node';

const defaultHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  Object.entries(defaultHeaders).forEach(([key, value]) => res.setHeader(key, value));
}

export function handleOptions(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  setCors(res);
  return res.status(status).json(body);
}

export function methodNotAllowed(res: VercelResponse) {
  return json(res, 405, { error: 'Method not allowed.' });
}

export function noContent(res: VercelResponse) {
  setCors(res);
  return res.status(204).end();
}

export function serverError(res: VercelResponse, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error.';
  return json(res, 500, { error: message });
}
