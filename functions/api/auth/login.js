import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../../_db';
import { adminUsers } from '../../_schema';
import { json, getBody } from '../../_auth';
import { eq } from 'drizzle-orm';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { email, password } = await getBody(request);
  if (!email || !password) return json({ error: 'Email and password are required' }, 400);

  try {
    const db = getDb(env);
    const users = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    const user = users[0];
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return json({ error: 'Invalid credentials' }, 401);
    }

    const JWT_SECRET = env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
