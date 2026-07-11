import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../_db.js';
import { licenses, licenseActivations } from '../_schema.js';
import { eq } from 'drizzle-orm';
import { authenticate, json } from '../_auth.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'DELETE') return json(res, 405, { error: 'Method not allowed' });

  const id = (req.url || '').split('/')[3] || '';
  const db = getDb();
  await db.delete(licenseActivations).where(eq(licenseActivations.licenseId, id));
  await db.delete(licenses).where(eq(licenses.id, id));
  return json(res, 200, { success: true });
}
