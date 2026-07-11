import crypto from 'crypto';
import { getDb } from '../../_db';
import { clients } from '../../_schema';
import { authenticate, json, getBody } from '../../_auth';
import { desc } from 'drizzle-orm';

export async function onRequest(context) {
  const { request, env } = context;
  const user = authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const db = getDb(env);

  if (request.method === 'GET') {
    const list = await db.select().from(clients).orderBy(desc(clients.createdAt));
    return json(list);
  }

  if (request.method === 'POST') {
    const { name, email, phone, notes } = await getBody(request);
    if (!name) return json({ error: 'Name is required' }, 400);
    const now = new Date();
    const client = { id: crypto.randomUUID(), name, email: email || null, phone: phone || null, notes: notes || null, createdAt: now, updatedAt: now };
    await db.insert(clients).values(client);
    return json(client);
  }

  return json({ error: 'Method not allowed' }, 405);
}
