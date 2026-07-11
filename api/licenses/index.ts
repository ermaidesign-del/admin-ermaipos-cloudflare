import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../_db.js';
import { licenses, clients, licenseActivations } from '../_schema.js';
import { authenticate, json } from '../_auth.js';
import { eq, desc } from 'drizzle-orm';
import { getExpirationInfo } from '../_license.js';

const LICENSE_SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'dev-license-key';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const db = getDb();
  const allLicenses = await db.select().from(licenses).orderBy(desc(licenses.createdAt));
  const clientsList = await db.select().from(clients);

  const result = await Promise.all(allLicenses.map(async (l) => {
    const client = clientsList.find(c => c.id === l.clientId);
    const info = getExpirationInfo(l.serial, LICENSE_SECRET_KEY);
    const activations = await db.select().from(licenseActivations).where(eq(licenseActivations.licenseId, l.id));
    return { ...l, client_name: client?.name || '—', info, activations: activations || [] };
  }));

  return json(res, 200, result);
}
