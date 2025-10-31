import crypto from 'crypto';

export function computeSha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}


