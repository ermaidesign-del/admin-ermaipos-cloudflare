import { getDb } from '../../_db';
import { clients, licenses } from '../../_schema';
import { authenticate, json } from '../../_auth';
import { count } from 'drizzle-orm';
import { getExpirationInfo } from '../../_license';

export async function onRequest(context) {
  const { request, env } = context;
  const user = authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const db = getDb(env);
  const LICENSE_SECRET_KEY = env.LICENSE_SECRET_KEY || 'dev-license-key';
  const totalClients = (await db.select({ value: count() }).from(clients))[0]?.value || 0;
  const totalLicenses = (await db.select({ value: count() }).from(licenses))[0]?.value || 0;

  let activeLicenses = 0, expiringSoon = 0, expired = 0;
  const allLicenses = await db.select().from(licenses);

  for (const lic of allLicenses) {
    const info = getExpirationInfo(lic.serial, LICENSE_SECRET_KEY);
    if (info.isExpired) expired++;
    else {
      activeLicenses++;
      if (info.daysRemaining <= 30) expiringSoon++;
    }
  }

  return json({ totalClients, totalLicenses, activeLicenses, expiringSoon, expired });
}
