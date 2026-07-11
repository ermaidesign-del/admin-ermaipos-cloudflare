import type { IncomingMessage, ServerResponse } from 'http';
import { getDb } from './_db.js';
import { adminUsers } from './_schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const checks: any = {
    node: process.version,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      LICENSE_SECRET_KEY: !!process.env.LICENSE_SECRET_KEY,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    },
    db: null,
    adminUser: null,
  };

  try {
    const db = getDb();
    await db.execute('SELECT 1 AS ok');
    checks.db = true;

    const users = await db.select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role }).from(adminUsers);
    checks.adminUser = users.length > 0 ? `${users[0].email} (${users[0].role})` : 'NONE - run npm run seed';
  } catch (e: any) {
    checks.db = `FAIL: ${e.message}`;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(checks, null, 2));
}
