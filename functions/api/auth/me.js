import { authenticate, json } from '../../_auth';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const user = authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  return json(user);
}
