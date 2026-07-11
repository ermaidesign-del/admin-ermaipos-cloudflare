import { getDb } from '../../_db';
import { licenses, licenseActivations } from '../../_schema';
import { eq } from 'drizzle-orm';
import { authenticate, json } from '../../_auth';

export async function onRequest(context) {
  const { request, env, params } = context;
  const user = authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  if (request.method !== 'DELETE') return json({ error: 'Method not allowed' }, 405);

  const id = params.id;
  const db = getDb(env);
  await db.delete(licenseActivations).where(eq(licenseActivations.licenseId, id));
  await db.delete(licenses).where(eq(licenses.id, id));
  return json({ success: true });
}
