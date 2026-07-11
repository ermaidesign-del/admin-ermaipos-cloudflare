import { getDb } from '../../_db';
import { licenses, clients, licenseActivations } from '../../_schema';
import { authenticate, json } from '../../_auth';
import { eq, desc } from 'drizzle-orm';
import { getExpirationInfo } from '../../_license';

export async function onRequest(context) {
  const { request, env } = context;
  const user = authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const db = getDb(env);
  const LICENSE_SECRET_KEY = env.LICENSE_SECRET_KEY || 'dev-license-key';
  const allLicenses = await db.select().from(licenses).orderBy(desc(licenses.createdAt));
  const clientsList = await db.select().from(clients);

  const result = await Promise.all(allLicenses.map(async (l) => {
    const client = clientsList.find(c => c.id === l.clientId);
    const info = getExpirationInfo(l.serial, LICENSE_SECRET_KEY);
    const activations = await db.select().from(licenseActivations).where(eq(licenseActivations.licenseId, l.id));
    return { ...l, client_name: client?.name || '—', info, activations: activations || [] };
  }));

  return json(result);
}
