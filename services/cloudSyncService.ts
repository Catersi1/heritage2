/**
 * Syncs applications to/from Supabase so data is available from any browser/device.
 * Requires Vercel API routes and SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on the server.
 */

const getBase = () => (typeof window !== 'undefined' ? window.location.origin : '');

export const cloudSyncService = {
  async getApplications(): Promise<{ id: string; encrypted: string; submitted_at: string }[] | null> {
    const base = getBase();
    if (!base) return null;
    try {
      const r = await fetch(`${base}/api/getApplications`, { method: 'GET' });
      if (!r.ok) return null;
      const data = await r.json();
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  },

  async saveApplication(payload: { id: string; encrypted: string; submitted_at: string }): Promise<boolean> {
    const base = getBase();
    if (!base) return false;
    try {
      const r = await fetch(`${base}/api/saveApplication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return r.ok;
    } catch {
      return false;
    }
  },

  async deleteApplication(id: string): Promise<boolean> {
    const base = getBase();
    if (!base) return false;
    try {
      const r = await fetch(`${base}/api/deleteApplication?id=${encodeURIComponent(id)}`, { method: 'GET' });
      return r.ok;
    } catch {
      return false;
    }
  }
};
