import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { getDb } from '../_db.js';
import { clients, licenses } from '../_schema.js';
import { eq } from 'drizzle-orm';
import { authenticate, json, getBody } from '../_auth.js';
import { generateLicense } from '../_license.js';

const LICENSE_SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'dev-license-key';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { clientId, months, maxActivations = 0 } = await getBody(req);
  if (!clientId || !months || months < 1 || months > 60) {
    return json(res, 400, { error: 'Client ID and months (1-60) are required' });
  }

  const db = getDb();
  const result = await db.select().from(clients).where(eq(clients.id, clientId));
  const client = result[0];
  if (!client) return json(res, 404, { error: 'Client not found' });

  const lic = generateLicense(clientId, client.name, months, maxActivations, LICENSE_SECRET_KEY);
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(licenses).values({
    id, serial: lic.serial, clientId, issuedAt: lic.issuedAt,
    expiresAt: lic.expiresAt, monthsDuration: months, maxActivations, isActive: 1, createdAt: now,
  } as any);

  return json(res, 200, {
    id, serial: lic.serial, client_id: clientId, client_name: client.name,
    issued_at: lic.issuedAt, expires_at: lic.expiresAt,
    months_duration: months, max_activations: maxActivations, is_active: 1, created_at: now.toISOString(),
  });
}
