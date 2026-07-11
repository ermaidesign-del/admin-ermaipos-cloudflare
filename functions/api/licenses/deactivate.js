import { getDb } from '../../_db';
import { licenses, licenseActivations } from '../../_schema';
import { eq, and } from 'drizzle-orm';
import { json, getBody } from '../../_auth';

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

  const { serial, hardwareId } = await getBody(request);
  if (!serial || !hardwareId) return json({ error: 'Serial and hardwareId are required' }, 400);

  const db = getDb(env);
  const dbLicenses = await db.select().from(licenses).where(eq(licenses.serial, serial));
  const dbLicense = dbLicenses[0];
  if (!dbLicense) return json({ error: 'License not found' }, 404);

  await db.delete(licenseActivations)
    .where(and(eq(licenseActivations.licenseId, dbLicense.id), eq(licenseActivations.hardwareId, hardwareId)));

  return json({ success: true, message: 'Deactivated' });
}
