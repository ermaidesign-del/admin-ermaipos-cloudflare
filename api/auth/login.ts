import type { IncomingMessage, ServerResponse } from 'http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../_db.js';
import { adminUsers } from '../_schema.js';
import { eq } from 'drizzle-orm';
import { json, getBody } from '../_auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const { email, password } = await getBody(req);
  if (!email || !password) return json(res, 400, { error: 'Email and password are required' });

  try {
    const db = getDb();
    const users = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    const user = users[0];
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return json(res, 401, { error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return json(res, 200, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return json(res, 500, { error: 'Internal server error' });
  }
}
