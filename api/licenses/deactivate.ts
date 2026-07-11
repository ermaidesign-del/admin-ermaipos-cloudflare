import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../_db.js';
import { licenses, licenseActivations } from '../_schema.js';
import { eq, and } from 'drizzle-orm';
import { json, getBody } from '../_auth.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') return json(res, 200, {});
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { serial, hardwareId } = await getBody(req);
  if (!serial || !hardwareId) return json(res, 400, { error: 'Serial and hardwareId are required' });

  const db = getDb();
  const dbLicenses = await db.select().from(licenses).where(eq(licenses.serial, serial));
  const dbLicense = dbLicenses[0];
  if (!dbLicense) return json(res, 404, { error: 'License not found' });

  await db.delete(licenseActivations)
    .where(and(eq(licenseActivations.licenseId, dbLicense.id), eq(licenseActivations.hardwareId, hardwareId)));

  return json(res, 200, { success: true, message: 'Deactivated' });
}
