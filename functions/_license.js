import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateLicense(clientId, clientName, months, maxActivations, secretKey) {
  const now = new Date();
  const issuedAt = now.toISOString().split('T')[0];
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);
  const expiresAtStr = expiresAt.toISOString().split('T')[0];
  const payload = JSON.stringify({ clientId, clientName, expiresAt: expiresAtStr, issuedAt, maxActivations });
  const hmac = crypto.createHmac('sha256', secretKey).update(payload).digest('hex').substring(0, 16);
  const combined = payload + ':' + hmac;
  const encoder = new TextEncoder();
  const base32 = bytesToBase32(encoder.encode(combined));
  return { serial: formatSerial(base32), expiresAt: expiresAtStr, issuedAt };
}

export function validateLicense(serial, secretKey) {
  try {
    const cleaned = serial.replace(/-/g, '').toUpperCase();
    const combinedBytes = base32ToBytes(cleaned);
    const combined = new TextDecoder().decode(combinedBytes);
    const lastColon = combined.lastIndexOf(':');
    if (lastColon === -1) return { valid: false, error: 'Invalid serial format' };
    const payload = combined.substring(0, lastColon);
    const expectedHmac = combined.substring(lastColon + 1);
    if (crypto.createHmac('sha256', secretKey).update(payload).digest('hex').substring(0, 16) !== expectedHmac) {
      return { valid: false, error: 'Invalid serial signature' };
    }
    const parsed = JSON.parse(payload);
    if (!parsed.clientId || !parsed.clientName || !parsed.expiresAt) return { valid: false, error: 'Invalid payload structure' };
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false, error: 'Invalid serial format' };
  }
}

export function getExpirationInfo(serial, secretKey) {
  const result = validateLicense(serial, secretKey);
  if (!result.valid || !result.payload) return { isValid: false, isExpired: true, daysRemaining: 0, error: result.error };
  const expiresDate = new Date(result.payload.expiresAt + 'T23:59:59');
  const diff = expiresDate.getTime() - Date.now();
  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return { isValid: true, isExpired: daysRemaining <= 0, daysRemaining, expiresAt: result.payload.expiresAt, clientName: result.payload.clientName, maxActivations: result.payload.maxActivations };
}

function bytesToBase32(bytes) {
  let result = '';
  let bits = 0;
  let value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >> bits) & 0x1f];
    }
  }
  if (bits > 0) result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  return result;
}

function base32ToBytes(str) {
  const cleaned = str.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bytes = [];
  let bits = 0;
  let value = 0;
  for (const char of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { bits -= 8; bytes.push((value >> bits) & 0xff); }
  }
  return new Uint8Array(bytes);
}

function formatSerial(base32) {
  const groups = [];
  for (let i = 0; i < base32.length; i += 5) groups.push(base32.slice(i, i + 5));
  return groups.join('-');
}
