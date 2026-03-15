
import { createClient } from '@supabase/supabase-js';
import { LeadApplication } from '../types';

// Access environment variables with multiple fallbacks
// In Vite, import.meta.env is preferred, but process.env is often used in this environment
const getEnv = (key: string): string => {
  // @ts-ignore - process might not be defined in all environments
  const processEnv = typeof process !== 'undefined' ? process.env : {};
  
  // Try to find a temporary manual override first
  const tempKey = key.replace('VITE_', 'TEMP_');
  const tempVal = typeof window !== 'undefined' ? sessionStorage.getItem(tempKey) : null;
  if (tempVal) return tempVal;

  return import.meta.env[key] || processEnv[key] || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

// Initialize Supabase client if credentials exist
const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.log("Supabase initialization skipped: Missing or invalid credentials.");
  console.log("URL detected:", supabaseUrl ? "Yes (starts with " + supabaseUrl.substring(0, 8) + "...)" : "No");
  console.log("Key detected:", supabaseAnonKey ? "Yes" : "No");
} else {
  console.log("Supabase initialized successfully.");
}

const STORAGE_KEY = 'heritage_applications';
const MAX_LOCAL_STORAGE_SIZE = 3 * 1024 * 1024; // ~3MB limit for safety

export interface SyncStats {
  lastSync: Date | null;
  cloudCount: number;
  localCount: number;
  isCloudEnabled: boolean;
  debugInfo?: {
    urlFound: boolean;
    keyFound: boolean;
    urlStart?: string;
  };
}

let syncStats: SyncStats = {
  lastSync: null,
  cloudCount: 0,
  localCount: 0,
  isCloudEnabled: !!supabase,
  debugInfo: {
    urlFound: !!supabaseUrl && supabaseUrl !== 'undefined',
    keyFound: !!supabaseAnonKey && supabaseAnonKey !== 'undefined',
    urlStart: supabaseUrl ? supabaseUrl.substring(0, 10) : undefined
  }
};

export const storageService = {
  isCloudEnabled: (): boolean => !!supabase,
  
  getSyncStats: (): SyncStats => {
    const local = storageService.getApplications();
    return { ...syncStats, localCount: local.length };
  },

  uploadFile: async (appId: string, file: { name: string, data: string, type: string }): Promise<string> => {
    if (!supabase) {
      console.warn("Supabase not configured, cannot upload file to storage.");
      return file.data;
    }

    try {
      // If it's already a URL, don't re-upload
      if (file.data.startsWith('http')) return file.data;

      // Convert base64 to Blob
      const base64Data = file.data.split(',')[1];
      if (!base64Data) return file.data;

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });

      // Create a clean filename
      const cleanName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const filePath = `${appId}/${Date.now()}_${cleanName}`;
      
      console.log(`Uploading ${file.name} to Supabase Storage...`);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, {
          contentType: file.type,
          upsert: true
        });

      if (error) {
        if (error.message.includes('bucket not found')) {
          console.warn("Supabase Storage bucket 'documents' not found. Please create it in Supabase dashboard.");
          return file.data;
        }
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log(`File uploaded successfully: ${publicUrl}`);
      return publicUrl;
    } catch (e) {
      console.error("File upload failed:", e);
      return file.data;
    }
  },

  saveApplication: async (app: LeadApplication): Promise<{ savedToCloud: boolean; cloudError?: string }> => {
    console.log(`Saving application ${app.id}...`);
    const appToSave = { ...app };
    let savedToCloud = false;
    let cloudError: string | undefined;

    // 1. Try to save to Supabase first if enabled
    if (supabase) {
      try {
        // Process documents to move large base64 to storage
        const processedDocuments = [...appToSave.documents];
        let changed = false;

        for (let i = 0; i < processedDocuments.length; i++) {
          const doc = processedDocuments[i];
          if (doc.data.startsWith('data:')) {
            const url = await storageService.uploadFile(app.id, doc);
            if (url !== doc.data) {
              processedDocuments[i] = { ...doc, data: url };
              changed = true;
            }
          }
        }

        const finalApp = changed ? { ...appToSave, documents: processedDocuments } : appToSave;

        const { error } = await supabase
          .from('applications')
          .upsert({ 
            id: app.id, 
            data: finalApp, 
            status: app.status,
            applicant_name: app.applicant.name,
            applicant_phone: app.applicant.phone,
            submitted_at: app.submittedAt || new Date().toISOString()
          }, { onConflict: 'id' });
        
        if (error) throw error;
        console.log("Application saved to Supabase successfully");
        syncStats.lastSync = new Date();
        savedToCloud = true;
        
        // Update appToSave for local storage stubbing
        Object.assign(appToSave, finalApp);
      } catch (e: any) {
        cloudError = e?.message || e?.error_description || String(e);
        console.error("Failed to save to Supabase:", e);
        // If Supabase fails, we still try local storage as fallback
      }
    }

    // 2. Save to localStorage
    try {
      const existing = storageService.getApplications();
      const index = existing.findIndex(a => a.id === app.id);
      
      let updated;
      if (index !== -1) {
        updated = [...existing];
        updated[index] = appToSave;
      } else {
        updated = [appToSave, ...existing];
      }
      
      let serialized = JSON.stringify(updated);
      
      // Check size before saving locally
      if (serialized.length > MAX_LOCAL_STORAGE_SIZE) {
        console.warn("Application data too large for localStorage, saving stub locally.");
        // Save a version without large document data locally to stay under limit
        const stubApp = { 
          ...appToSave, 
          documents: appToSave.documents.map(d => ({ 
            ...d, 
            data: d.data.startsWith('http') ? d.data : '[LARGE_FILE_STORED_IN_CLOUD]' 
          })) 
        };
        
        const stubUpdated = index !== -1 
          ? existing.map(a => a.id === app.id ? stubApp : a)
          : [stubApp, ...existing];
          
        serialized = JSON.stringify(stubUpdated);
        
        // If even the stub is too large (rare), we might have to just save the basic info
        if (serialized.length > MAX_LOCAL_STORAGE_SIZE) {
           localStorage.setItem(STORAGE_KEY, JSON.stringify(stubUpdated.slice(0, 10))); // Keep only last 10
        } else {
           localStorage.setItem(STORAGE_KEY, serialized);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, serialized);
      }
      
      console.log(`Application ${app.id} saved to localStorage.`);
    } catch (e) {
      console.warn("LocalStorage quota exceeded:", e);
      if (!supabase) {
        throw new Error("STORAGE_FULL");
      }
    }
    return { savedToCloud, cloudError };
  },

  getApplications: (): LeadApplication[] => {
    // For the dashboard, we'll try to fetch from Supabase if available, 
    // otherwise fallback to localStorage
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Data corruption or access error", e);
      return [];
    }
  },

  // New method to fetch from Supabase specifically for the dashboard
  fetchApplications: async (): Promise<LeadApplication[]> => {
    const localApps = storageService.getApplications();
    if (!supabase) {
      console.log("Supabase not configured, showing local data only.");
      return localApps;
    }

    try {
      console.log("Fetching applications from Supabase...");
      const { data, error } = await supabase
        .from('applications')
        .select('data')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
      }
      
      if (!data) return localApps;

      const remoteApps = data
        .filter(item => item && item.data && typeof item.data === 'object')
        .map(item => item.data as LeadApplication);
      
      console.log(`Fetched ${remoteApps.length} applications from Supabase.`);
      syncStats.lastSync = new Date();
      syncStats.cloudCount = remoteApps.length;
      
      // Merge local and remote, preferring remote for the same ID
      const mergedMap = new Map<string, LeadApplication>();
      
      // Add local first
      localApps.forEach(app => mergedMap.set(app.id, app));
      
      // Overwrite with remote (remote is source of truth for shared data)
      remoteApps.forEach(app => mergedMap.set(app.id, app));
      
      const merged = Array.from(mergedMap.values()).sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      // Optional: Sync back to local storage to keep them in sync
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged.slice(0, 50))); // Keep last 50 locally
      } catch (e) {
        console.warn("Failed to sync remote data back to local storage:", e);
      }

      return merged;
    } catch (e: any) {
      console.error("Supabase fetch error, falling back to local:", e);
      // Rethrow so the dashboard can show the actual error (e.g. table missing, RLS)
      const msg = e?.message || e?.error_description || String(e);
      throw new Error(msg);
    }
  },

  updateApplicationStatus: async (id: string, status: LeadApplication['status']): Promise<void> => {
    // Update local
    const apps = storageService.getApplications();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    }

    // Update Supabase
    if (supabase) {
      try {
        // Update both the status column and the data JSONB
        const appToUpdate = apps.find(a => a.id === id);
        if (appToUpdate) {
          const { error } = await supabase
            .from('applications')
            .update({ status, data: appToUpdate })
            .eq('id', id);
          if (error) throw error;
        }
      } catch (e) {
        console.error("Supabase update error:", e);
      }
    }
  },

  deleteApplication: async (id: string): Promise<void> => {
    // Delete local
    const apps = storageService.getApplications();
    const filtered = apps.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Delete Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from('applications')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error("Supabase delete error:", e);
      }
    }
  }
};
