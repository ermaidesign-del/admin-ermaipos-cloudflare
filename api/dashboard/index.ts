import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../_db.js';
import { clients, licenses, licenseActivations } from '../_schema.js';
import { eq, and, count, gt, lt } from 'drizzle-orm';
import { authenticate, json } from '../_auth.js';
import { getExpirationInfo } from '../_license.js';
import { sql } from 'drizzle-orm';

const LICENSE_SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'dev-license-key';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });

  const db = getDb();
  const totalClients = (await db.select({ value: count() }).from(clients))[0]?.value || 0;
  const totalLicenses = (await db.select({ value: count() }).from(licenses))[0]?.value || 0;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

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

  return json(res, 200, { totalClients, totalLicenses, activeLicenses, expiringSoon, expired });
}
