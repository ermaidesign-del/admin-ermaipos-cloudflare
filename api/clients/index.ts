import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { getDb } from '../_db.js';
import { clients } from '../_schema.js';
import { authenticate, json, getBody } from '../_auth.js';
import { desc, asc } from 'drizzle-orm';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  const db = getDb();

  if (req.method === 'GET') {
    const list = await db.select().from(clients).orderBy(desc(clients.createdAt));
    return json(res, 200, list);
  }

  if (req.method === 'POST') {
    const { name, email, phone, notes } = await getBody(req);
    if (!name) return json(res, 400, { error: 'Name is required' });
    const now = new Date();
    const client = { id: crypto.randomUUID(), name, email: email || null, phone: phone || null, notes: notes || null, createdAt: now, updatedAt: now };
    await db.insert(clients).values(client as any);
    return json(res, 200, client);
  }

  return json(res, 405, { error: 'Method not allowed' });
}
