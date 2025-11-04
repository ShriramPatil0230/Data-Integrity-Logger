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
  const canonical = canonicalizeText(text);
  const payload = `${canonical}\n${createdAtIso}\n${userId}`;
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

