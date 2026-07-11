import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '../api/_db';
import { adminUsers, clients } from '../api/_schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  const db = getDb();

  const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, process.env.ADMIN_EMAIL || 'admin@ermaipos.com'));
  if (existing.length === 0) {
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await db.insert(adminUsers).values({
      id: crypto.randomUUID(),
      email: process.env.ADMIN_EMAIL || 'admin@ermaipos.com',
      name: 'Super Admin',
      passwordHash: hashed,
      role: 'superadmin',
      createdAt: new Date(),
    });
    console.log('Admin user created');
  }

  const clientCount = await db.select({ count: clients.id }).from(clients);
  if (clientCount.length === 0) {
    const now = new Date();
    await db.insert(clients).values([
      { id: crypto.randomUUID(), name: 'Demo Client 1', email: 'demo1@test.com', phone: '123456789', notes: 'Cliente de demostración', createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), name: 'Demo Client 2', email: 'demo2@test.com', phone: '987654321', createdAt: now, updatedAt: now },
    ]);
    console.log('Demo clients created');
  }
}
