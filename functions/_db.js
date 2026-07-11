import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './_schema';

export function getDb(env) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}
