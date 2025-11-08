import crypto from 'crypto';

export function canonicalizeText(input) {
  if (typeof input !== 'string') return '';
  const normalized = input.normalize('NFKC');
  // Normalize CRLF/CR to LF; do not trim to preserve intentional leading/trailing whitespace
  return normalized.replace(/\r\n?/g, '\n');
}

export function computeSha256Hex(input) {
  const canonical = canonicalizeText(input);
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export function computeHmacHex({ text, createdAtIso, userId, secret }) {
  // Validate secret is provided and is a string
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    throw new Error('HMAC secret is required and must be a non-empty string');
  }
  
  const canonical = canonicalizeText(text);
  const payload = `${canonical}\n${createdAtIso}\n${userId}`;
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

