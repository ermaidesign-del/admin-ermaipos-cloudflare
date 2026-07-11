import type { IncomingMessage, ServerResponse } from 'http';
import { authenticate, json } from '../_auth.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  const user = authenticate(req, res);
  if (!user) return;
  return json(res, 200, user);
}
