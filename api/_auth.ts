import jwt from 'jsonwebtoken';
import type { IncomingMessage, ServerResponse } from 'http';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AdminUser {
  id: string; email: string; name: string; role: string;
}

export function authenticate(req: IncomingMessage, res: ServerResponse): AdminUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return null;
  }
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as AdminUser;
  } catch {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid token' }));
    return null;
  }
}

export function json(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function getBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}
