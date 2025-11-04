// Ensure Web Crypto available for tools that expect globalThis.crypto
import { webcrypto } from 'node:crypto'
if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}


