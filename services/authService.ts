/**
 * Admin auth: password hashing (SHA-256 with salt) and session with expiry.
 * No plain-text password is stored; dashboard is protected by session.
 */

const SALT = 'hh_okc_admin_salt_v1';
const SESSION_KEY = 'hh_admin_session';
const SESSION_EXP_KEY = 'hh_admin_session_exp';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

async function sha256(message: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(message));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Hash of (salt + default password). Set your own via ADMIN_PASSWORD_HASH in constants. */
export async function hashPassword(password: string): Promise<string> {
  return sha256(SALT + password);
}

export function createSession(): void {
  try {
    const token = btoa([Date.now(), crypto.getRandomValues(new Uint8Array(12))].join('.'));
    const exp = Date.now() + SESSION_DURATION_MS;
    sessionStorage.setItem(SESSION_KEY, token);
    sessionStorage.setItem(SESSION_EXP_KEY, String(exp));
  } catch (_) {}
}

export function hasValidSession(): boolean {
  try {
    const exp = sessionStorage.getItem(SESSION_EXP_KEY);
    if (!exp || !sessionStorage.getItem(SESSION_KEY)) return false;
    return Date.now() < Number(exp);
  } catch {
    return false;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_EXP_KEY);
  } catch (_) {}
}
