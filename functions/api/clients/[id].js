import { getDb } from '../../_db';
import { clients, licenses, licenseActivations } from '../../_schema';
import { authenticate, json, getBody } from '../../_auth';
import { eq, desc } from 'drizzle-orm';

export async function onRequest(context) {
  const { request, env, params } = context;
  const user = authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const db = getDb(env);
  const id = params.id;

  if (request.method === 'GET') {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    if (!result[0]) return json({ error: 'Client not found' }, 404);
    const clientLicenses = await db.select().from(licenses).where(eq(licenses.clientId, id)).orderBy(desc(licenses.createdAt));
    const withActivations = await Promise.all(clientLicenses.map(async (l) => {
      const activations = await db.select().from(licenseActivations).where(eq(licenseActivations.licenseId, l.id));
      return { ...l, activations };
    }));
    return json({ ...result[0], licenses: withActivations });
  }

  if (request.method === 'PUT') {
    const existing = await db.select().from(clients).where(eq(clients.id, id));
    if (!existing[0]) return json({ error: 'Client not found' }, 404);
    const { name, email, phone, notes } = await getBody(request);
    await db.update(clients).set({
      name: name || existing[0].name,
      email: email !== undefined ? email : existing[0].email,
      phone: phone !== undefined ? phone : existing[0].phone,
      notes: notes !== undefined ? notes : existing[0].notes,
      updatedAt: new Date(),
    }).where(eq(clients.id, id));
    return json({ id, updatedAt: new Date().toISOString() });
  }

  if (request.method === 'DELETE') {
    await db.delete(licenseActivations).where(
      eq(licenseActivations.licenseId, id)
    );
    await db.delete(licenses).where(eq(licenses.clientId, id));
    await db.delete(clients).where(eq(clients.id, id));
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}
