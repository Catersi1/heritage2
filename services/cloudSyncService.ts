/**
 * Syncs applications to/from Supabase so data is available from any browser/device.
 * Requires Vercel API routes and SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on the server.
 */

const getBase = () => (typeof window !== 'undefined' ? window.location.origin : '');

export const cloudSyncService = {
  async getApplications(): Promise<{ id: string; encrypted: string; submitted_at: string }[] | null> {
    const base = getBase();
    if (!base) {
      console.log('[CloudSync] No base URL');
      return null;
    }
    try {
      console.log('[CloudSync] Fetching applications...');
      const r = await fetch(`${base}/api/getApplications`, { method: 'GET' });
      if (!r.ok) {
        const errorText = await r.text();
        console.error('[CloudSync] getApplications failed:', r.status, errorText);
        return null;
      }
      const data = await r.json();
      console.log('[CloudSync] Got', data?.length || 0, 'applications');
      return Array.isArray(data) ? data : null;
    } catch (err) {
      console.error('[CloudSync] getApplications error:', err);
      return null;
    }
  },

  async saveApplication(payload: { id: string; encrypted: string; submitted_at: string }): Promise<boolean> {
    const base = getBase();
    if (!base) {
      console.log('[CloudSync] No base URL');
      return false;
    }
    try {
      console.log('[CloudSync] Saving application:', payload.id);
      const r = await fetch(`${base}/api/saveApplication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const errorText = await r.text();
        console.error('[CloudSync] saveApplication failed:', r.status, errorText);
        return false;
      }
      console.log('[CloudSync] Application saved successfully');
      return true;
    } catch (err) {
      console.error('[CloudSync] saveApplication error:', err);
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
