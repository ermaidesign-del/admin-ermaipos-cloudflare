import { getDb } from '../_db';
import { adminUsers } from '../_schema';
import { json } from '../_auth';
import { eq } from 'drizzle-orm';

export async function onRequest(context) {
  const { env } = context;
  const checks = {
    node: 'cloudflare-workers',
    env: {
      DATABASE_URL: !!env.DATABASE_URL,
      JWT_SECRET: !!env.JWT_SECRET,
      LICENSE_SECRET_KEY: !!env.LICENSE_SECRET_KEY,
      ADMIN_EMAIL: !!env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!env.ADMIN_PASSWORD,
    },
    db: null,
    adminUser: null,
  };

  try {
    const db = getDb(env);
    await db.execute('SELECT 1 AS ok');
    checks.db = true;

    const users = await db.select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role }).from(adminUsers);
    checks.adminUser = users.length > 0 ? `${users[0].email} (${users[0].role})` : 'NONE - run npm run seed';
  } catch (e) {
    checks.db = `FAIL: ${e.message}`;
  }

  return json(checks);
}
