/**
 * AES-256-GCM encryption for data at rest. Uses a key derived from a passphrase.
 * Data is encrypted before being stored in IndexedDB.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 250000;

const PASSPHRASE = 'HeritageHousing#SecurePortal2025!DataAtRest';
const SALT = new Uint8Array([0x48, 0x48, 0x50, 0x4f, 0x4b, 0x43, 0x32, 0x30, 0x32, 0x35, 0x73, 0x61, 0x6c, 0x74, 0x31, 0x32]);

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
  return cachedKey;
}

function b64Encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function b64Decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const cryptoService = {
  async encrypt(plaintext: string): Promise<string> {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv, tagLength: 128 },
      key,
      enc.encode(plaintext)
    );
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return b64Encode(combined);
  },

  async decrypt(ciphertextB64: string): Promise<string> {
    const key = await getKey();
    const combined = b64Decode(ciphertextB64);
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: 128 },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  }
};
