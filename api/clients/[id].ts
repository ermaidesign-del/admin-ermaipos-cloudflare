import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from '../_db.js';
import { clients, licenses, licenseActivations } from '../_schema.js';
import { authenticate, json, getBody } from '../_auth.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  const db = getDb();
  const id = (req.url || '').split('/')[3] || '';

  if (req.method === 'GET') {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    if (!result[0]) return json(res, 404, { error: 'Client not found' });
    const clientLicenses = await db.select().from(licenses).where(eq(licenses.clientId, id)).orderBy(desc(licenses.createdAt));
    const withActivations = await Promise.all(clientLicenses.map(async (l) => {
      const activations = await db.select().from(licenseActivations).where(eq(licenseActivations.licenseId, l.id));
      return { ...l, activations };
    }));
    return json(res, 200, { ...result[0], licenses: withActivations });
  }

  if (req.method === 'PUT') {
    const existing = await db.select().from(clients).where(eq(clients.id, id));
    if (!existing[0]) return json(res, 404, { error: 'Client not found' });
    const { name, email, phone, notes } = await getBody(req);
    await db.update(clients).set({
      name: name || existing[0].name,
      email: email !== undefined ? email : existing[0].email,
      phone: phone !== undefined ? phone : existing[0].phone,
      notes: notes !== undefined ? notes : existing[0].notes,
      updatedAt: new Date(),
    }).where(eq(clients.id, id));
    return json(res, 200, { id, updatedAt: new Date().toISOString() });
  }

  if (req.method === 'DELETE') {
    await db.delete(licenseActivations).where(
      eq(licenseActivations.licenseId, id)
    );
    await db.delete(licenses).where(eq(licenses.clientId, id));
    await db.delete(clients).where(eq(clients.id, id));
    return json(res, 200, { success: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}
