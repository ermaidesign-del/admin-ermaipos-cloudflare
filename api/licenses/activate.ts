import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { getDb } from '../_db.js';
import { licenses, licenseActivations } from '../_schema.js';
import { eq, and, count } from 'drizzle-orm';
import { json, getBody } from '../_auth.js';
import { validateLicense } from '../_license.js';

const LICENSE_SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'dev-license-key';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') return json(res, 200, {});
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { serial, hardwareId, machineName = '' } = await getBody(req);
  if (!serial || !hardwareId) return json(res, 400, { error: 'Serial and hardwareId are required' });

  const validation = validateLicense(serial, LICENSE_SECRET_KEY);
  if (!validation.valid) return json(res, 400, { error: validation.error || 'Invalid serial' });
  if (!validation.payload) return json(res, 400, { error: 'Invalid license payload' });

  const expiresDate = new Date(validation.payload.expiresAt + 'T23:59:59');
  if (expiresDate < new Date()) return json(res, 400, { error: 'License expired' });

  const db = getDb();
  const dbLicenses = await db.select().from(licenses).where(eq(licenses.serial, serial));
  const dbLicense = dbLicenses[0];
  if (!dbLicense) return json(res, 404, { error: 'License not found in database' });

  const existingActivation = await db.select().from(licenseActivations)
    .where(and(eq(licenseActivations.licenseId, dbLicense.id), eq(licenseActivations.hardwareId, hardwareId)));

  if (existingActivation.length > 0) {
    await db.update(licenseActivations).set({ lastSeenAt: new Date() })
      .where(eq(licenseActivations.id, existingActivation[0].id));
    return json(res, 200, { success: true, message: 'Already activated on this machine', reactivated: true });
  }

  if (dbLicense.maxActivations > 0) {
    const activationCount = await db.select({ value: count() }).from(licenseActivations)
      .where(eq(licenseActivations.licenseId, dbLicense.id));
    if (activationCount[0]?.value >= dbLicense.maxActivations) {
      return json(res, 403, {
        error: `Maximum activations reached (${dbLicense.maxActivations}/${dbLicense.maxActivations}). Desvincule otra máquina primero.`,
        maxActivations: dbLicense.maxActivations,
      });
    }
  }

  await db.insert(licenseActivations).values({
    id: crypto.randomUUID(),
    licenseId: dbLicense.id,
    hardwareId,
    machineName,
    activatedAt: new Date(),
    lastSeenAt: new Date(),
  } as any);

  return json(res, 200, { success: true, message: 'License activated' });
}
