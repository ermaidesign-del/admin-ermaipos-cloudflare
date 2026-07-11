import crypto from 'crypto';
import { getDb } from '../../_db';
import { licenses, licenseActivations } from '../../_schema';
import { eq, and, count } from 'drizzle-orm';
import { json, getBody } from '../../_auth';
import { validateLicense } from '../../_license';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const LICENSE_SECRET_KEY = env.LICENSE_SECRET_KEY || 'dev-license-key';
  const { serial, hardwareId, machineName = '' } = await getBody(request);
  if (!serial || !hardwareId) return json({ error: 'Serial and hardwareId are required' }, 400);

  const validation = validateLicense(serial, LICENSE_SECRET_KEY);
  if (!validation.valid) return json({ error: validation.error || 'Invalid serial' }, 400);
  if (!validation.payload) return json({ error: 'Invalid license payload' }, 400);

  const expiresDate = new Date(validation.payload.expiresAt + 'T23:59:59');
  if (expiresDate < new Date()) return json({ error: 'License expired' }, 400);

  const db = getDb(env);
  const dbLicenses = await db.select().from(licenses).where(eq(licenses.serial, serial));
  const dbLicense = dbLicenses[0];
  if (!dbLicense) return json({ error: 'License not found in database' }, 404);

  const existingActivation = await db.select().from(licenseActivations)
    .where(and(eq(licenseActivations.licenseId, dbLicense.id), eq(licenseActivations.hardwareId, hardwareId)));

  if (existingActivation.length > 0) {
    await db.update(licenseActivations).set({ lastSeenAt: new Date() })
      .where(eq(licenseActivations.id, existingActivation[0].id));
    return json({ success: true, message: 'Already activated on this machine', reactivated: true });
  }

  if (dbLicense.maxActivations > 0) {
    const activationCount = await db.select({ value: count() }).from(licenseActivations)
      .where(eq(licenseActivations.licenseId, dbLicense.id));
    if (activationCount[0]?.value >= dbLicense.maxActivations) {
      return json({
        error: `Maximum activations reached (${dbLicense.maxActivations}/${dbLicense.maxActivations}). Desvincule otra máquina primero.`,
        maxActivations: dbLicense.maxActivations,
      }, 403);
    }
  }

  await db.insert(licenseActivations).values({
    id: crypto.randomUUID(),
    licenseId: dbLicense.id,
    hardwareId,
    machineName,
    activatedAt: new Date(),
    lastSeenAt: new Date(),
  });

  return json({ success: true, message: 'License activated' });
}
