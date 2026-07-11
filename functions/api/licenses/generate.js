import crypto from 'crypto';
import { getDb } from '../../_db';
import { clients, licenses } from '../../_schema';
import { eq } from 'drizzle-orm';
import { authenticate, json, getBody } from '../../_auth';
import { generateLicense } from '../../_license';

export async function onRequest(context) {
  const { request, env } = context;
  const user = authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { clientId, months, maxActivations = 0 } = await getBody(request);
  if (!clientId || !months || months < 1 || months > 60) {
    return json({ error: 'Client ID and months (1-60) are required' }, 400);
  }

  const LICENSE_SECRET_KEY = env.LICENSE_SECRET_KEY || 'dev-license-key';
  const db = getDb(env);
  const result = await db.select().from(clients).where(eq(clients.id, clientId));
  const client = result[0];
  if (!client) return json({ error: 'Client not found' }, 404);

  const lic = generateLicense(clientId, client.name, months, maxActivations, LICENSE_SECRET_KEY);
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(licenses).values({
    id, serial: lic.serial, clientId, issuedAt: lic.issuedAt,
    expiresAt: lic.expiresAt, monthsDuration: months, maxActivations, isActive: 1, createdAt: now,
  });

  return json({
    id, serial: lic.serial, client_id: clientId, client_name: client.name,
    issued_at: lic.issuedAt, expires_at: lic.expiresAt,
    months_duration: months, max_activations: maxActivations, is_active: 1, created_at: now.toISOString(),
  });
}
