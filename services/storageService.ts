import { LeadApplication } from '../types';
import { cryptoService } from './cryptoService';
import { cloudSyncService } from './cloudSyncService';

const DB_NAME = 'HeritageHousingDB';
const DB_VERSION = 2;
const STORE_NAME = 'applications';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

type StoredRow = { id: string; encrypted?: string } | LeadApplication;

function isEncrypted(row: StoredRow): row is { id: string; encrypted: string } {
  return 'encrypted' in row && typeof (row as { encrypted?: string }).encrypted === 'string';
}

async function decryptRow(row: StoredRow): Promise<LeadApplication> {
  if (isEncrypted(row)) {
    const json = await cryptoService.decrypt(row.encrypted);
    return JSON.parse(json) as LeadApplication;
  }
  return row as LeadApplication;
}

/**
 * Uses IndexedDB with AES-256-GCM encryption. Application data is encrypted
 * before being stored so it is not stored in plain text.
 */
export const storageService = {
  async saveApplication(app: LeadApplication): Promise<void> {
    const json = JSON.stringify(app);
    const encrypted = await cryptoService.encrypt(json);
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: app.id, encrypted });
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
    cloudSyncService.saveApplication({
      id: app.id,
      encrypted,
      submitted_at: app.submittedAt
    }).catch(() => {});
  },

  async getApplications(): Promise<LeadApplication[]> {
    const fromCloud = await cloudSyncService.getApplications();
    if (fromCloud && fromCloud.length >= 0) {
      const list: LeadApplication[] = [];
      for (const row of fromCloud) {
        try {
          const app = await decryptRow({ id: row.id, encrypted: row.encrypted });
          list.push(app);
        } catch (_) {
          // skip corrupted or legacy entries that fail to decrypt
        }
      }
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      if (list.length > 0) {
        const encList = await Promise.all(list.map(app => cryptoService.encrypt(JSON.stringify(app))));
        const db = await openDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          list.forEach((app, i) => store.put({ id: app.id, encrypted: encList[i] }));
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => { db.close(); reject(tx.error); };
        });
      }
      return list;
    }
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = async () => {
        db.close();
        const rows = (request.result || []) as StoredRow[];
        const list: LeadApplication[] = [];
        for (const row of rows) {
          try {
            list.push(await decryptRow(row));
          } catch (_) {
            // skip corrupted or legacy entries that fail to decrypt
          }
        }
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        resolve(list);
      };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  },

  async getApplicationById(id: string): Promise<LeadApplication | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = async () => {
        db.close();
        const row = request.result as StoredRow | undefined;
        if (!row) {
          resolve(null);
          return;
        }
        try {
          resolve(await decryptRow(row));
        } catch (_) {
          resolve(null);
        }
      };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  },

  async updateApplicationStatus(id: string, status: LeadApplication['status']): Promise<void> {
    const apps = await storageService.getApplications();
    const app = apps.find(a => a.id === id);
    if (!app) return;
    app.status = status;
    await storageService.saveApplication(app);
  },

  async deleteApplication(id: string): Promise<void> {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
    cloudSyncService.deleteApplication(id).catch(() => {});
  }
};
