
import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LeadApplication } from '../types';
import { storageService } from '../services/storageService';
import { Icons, ADMIN_PASSWORD } from '../constants';

interface Props {
  onLogout: () => void;
  onExit: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type DashboardView = 'table' | 'profile';

const Dashboard: React.FC<Props> = ({ onLogout, onExit, showToast }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [apps, setApps] = useState<LeadApplication[]>([]);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<LeadApplication | null>(null);
  const [viewMode, setViewMode] = useState<DashboardView | 'appointments'>('table');
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const refreshData = async () => {
    setIsLoading(true);
    setSyncError(null);
    try {
      const data = await storageService.fetchApplications();
      setApps(data);
      if (storageService.isCloudEnabled() && data.length === 0) {
        console.log("Cloud connected but no data found.");
      }
      if (showToast && !syncError) {
        // Only show success toast if manually triggered or first load? 
        // Maybe too much for auto-refresh. Let's only show if manual.
      }
    } catch (e: any) {
      const msg = e.message || "Failed to sync with cloud";
      setSyncError(msg);
      if (showToast) showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      // Auto-refresh every 60 seconds
      const interval = setInterval(refreshData, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert("Invalid password");
    }
  };

  const toggleReveal = (appId: string) => {
    setRevealedFields(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const maskSSN = (ssn: string) => {
    if (!ssn) return 'N/A';
    const clean = ssn.replace(/\D/g, '');
    if (clean.length < 4) return ssn;
    return `***-**-${clean.slice(-4)}`;
  };

  const updateStatus = async (id: string, status: LeadApplication['status']) => {
    await storageService.updateApplicationStatus(id, status);
    const updatedApps = await storageService.fetchApplications();
    setApps(updatedApps);
    if (selectedApp?.id === id) {
      setSelectedApp(updatedApps.find(a => a.id === id) || null);
    }
  };

  const deleteApp = async (id: string) => {
    if (confirm("Are you sure you want to delete this application? This cannot be undone.")) {
      await storageService.deleteApplication(id);
      const updatedApps = await storageService.fetchApplications();
      setApps(updatedApps);
      setSelectedApp(null);
      setViewMode('table');
    }
  };

  const downloadFile = async (doc: { data: string, name: string, type?: string }) => {
    try {
      if (doc.data.startsWith('http')) {
        // For cloud URLs, fetch the blob to force download and preserve filename
        // If this fails due to CORS, we fallback to direct link
        try {
          const response = await fetch(doc.data, { mode: 'cors' });
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = doc.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (fetchErr) {
          console.warn('Blob download failed, falling back to direct link:', fetchErr);
          const link = document.createElement('a');
          link.href = doc.data;
          link.target = '_blank';
          link.download = doc.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // For base64 data
        const link = document.createElement('a');
        link.href = doc.data;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Download failed:", e);
      // Fallback to direct link if fetch fails
      window.open(doc.data, '_blank');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!profileRef.current || !selectedApp) return;
    
    setIsLoading(true);
    try {
      // Temporarily hide elements we don't want in the PDF
      // Ensure the element is visible and scrolled to top for capture
      const originalScrollTop = window.scrollY;
      window.scrollTo(0, 0);
      
      const canvas = await html2canvas(profileRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0
      });
      
      window.scrollTo(0, originalScrollTop);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Heritage_Housing_App_${(selectedApp.applicant?.name || 'Unknown').replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try using the Print button instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignature = (sig?: string) => {
    if (!sig) return <p className="text-slate-400 italic text-xs">No signature provided</p>;
    if (sig.includes('|')) {
      const [name, fontClass] = sig.split('|');
      return <p className={`text-3xl ${fontClass} text-blue-900 border-b border-slate-200 pb-2 inline-block min-w-[200px]`}>{name}</p>;
    }
    return <img src={sig} alt="Signature" className="h-16 mix-blend-multiply border-b border-slate-200" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const seedSampleData = async () => {
    setIsLoading(true);
    try {
      const samples: LeadApplication[] = [
        {
          id: `APP-SAMPLE-1`,
          status: 'Approved',
          type: 'CREDIT_APP',
          submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          documents: [
            { id: 'doc1', name: 'driver_license.png', type: 'image/png', data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', category: 'license', owner: 'applicant' }
          ],
          applicant: {
            name: 'John Sample',
            phone: '555-0101',
            email: 'john@example.com',
            ssn: '123-45-6789',
            dob: '1985-05-15',
            currentAddress: '123 Maple St',
            city: 'Oklahoma City',
            state: 'OK',
            yearsAtAddress: '5',
            employmentStatus: 'W2 (Employed)',
            employerName: 'Tech Corp',
            jobTitle: 'Engineer',
            employerPhone: '555-9999',
            yearsEmployed: '3',
            monthlyIncome: 5500,
            language: 'English',
            wantAppointment: true,
            appointmentDetails: 'Saturday morning preferred',
            landStatus: 'I have land (Paid Off)',
            landLocation: 'Oklahoma City',
            utilities: 'Yes, all utilities',
            bedrooms: '3',
            targetPayment: 1200,
            creditEstimate: 'Good (640-719)',
            downPayment: 5000,
            downPaymentSource: 'Savings',
            repoHistory: 'No',
            hasCoSigner: true,
            internalScore: 85,
            date: new Date().toISOString(),
            signature: 'John Sample|font-serif'
          },
          cosigner: {
            name: 'Jane Sample',
            phone: '555-0102',
            email: 'jane@example.com',
            ssn: '987-65-4321',
            dob: '1987-08-20',
            currentAddress: '123 Maple St',
            city: 'Oklahoma City',
            state: 'OK',
            yearsAtAddress: '5',
            employmentStatus: 'W2 (Employed)',
            employerName: 'Health Inc',
            jobTitle: 'Nurse',
            employerPhone: '555-8888',
            yearsEmployed: '4',
            monthlyIncome: 4800,
            relationship: 'Spouse',
            signature: 'Jane Sample|font-serif'
          }
        },
        {
          id: `APP-SAMPLE-2`,
          status: 'Reviewing',
          type: 'CREDIT_APP',
          submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          documents: [],
          applicant: {
            name: 'Robert Test',
            phone: '555-0202',
            email: 'robert@test.com',
            ssn: '444-55-6666',
            dob: '1990-12-01',
            currentAddress: '456 Oak Ave',
            city: 'Tulsa',
            state: 'OK',
            yearsAtAddress: '2',
            employmentStatus: '1099 (Self-Employed)',
            employerName: 'Self',
            jobTitle: 'Contractor',
            employerPhone: '555-7777',
            yearsEmployed: '2',
            monthlyIncome: 4200,
            language: 'English',
            wantAppointment: false,
            appointmentDetails: '',
            landStatus: 'I need to find land',
            landLocation: 'Tulsa',
            utilities: 'No utilities',
            bedrooms: '2',
            targetPayment: 900,
            creditEstimate: 'Fair (580-639)',
            downPayment: 2000,
            downPaymentSource: 'Tax Refund',
            repoHistory: 'No',
            hasCoSigner: false,
            internalScore: 45,
            date: new Date().toISOString(),
            signature: 'Robert Test|font-sans',
            customization: {
              homeType: 'Double Wide',
              bedrooms: '3',
              bathrooms: '2',
              isIdeal: true,
              hasWell: true,
              hasSeptic: true,
              hasElectric: true,
              wantsPark: false,
              estimatedTotal: 145000
            }
          }
        },
        {
          id: `APP-SAMPLE-3`,
          status: 'Denied',
          type: 'CREDIT_APP',
          submittedAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
          documents: [],
          applicant: {
            name: 'Maria Example',
            phone: '555-0303',
            email: 'maria@example.com',
            ssn: '111-22-3333',
            dob: '1975-03-10',
            currentAddress: '789 Pine Rd',
            city: 'Norman',
            state: 'OK',
            yearsAtAddress: '1',
            employmentStatus: 'Cash/Other',
            employerName: 'Various',
            jobTitle: 'Helper',
            employerPhone: '555-6666',
            yearsEmployed: '1',
            monthlyIncome: 2500,
            language: 'Español',
            wantAppointment: true,
            appointmentDetails: 'Necesito ayuda con el enganche',
            landStatus: 'Family Land',
            landLocation: 'Norman',
            utilities: 'Unknown',
            bedrooms: '4',
            targetPayment: 700,
            creditEstimate: 'Poor (<580)',
            downPayment: 500,
            downPaymentSource: 'Savings',
            repoHistory: 'Yes, within last 2 years',
            hasCoSigner: false,
            internalScore: 15,
            date: new Date().toISOString(),
            signature: 'Maria Example|font-serif'
          }
        }
      ];

      for (const sample of samples) {
        await storageService.saveApplication(sample);
      }
      
      await refreshData();
      alert("3 Sample applications added successfully!");
    } catch (e) {
      console.error("Failed to seed data:", e);
      alert("Failed to seed sample data.");
    } finally {
      setIsLoading(false);
    }
  };

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl && manualKey) {
      sessionStorage.setItem('TEMP_SUPABASE_URL', manualUrl);
      sessionStorage.setItem('TEMP_SUPABASE_ANON_KEY', manualKey);
      window.location.reload();
    }
  };

  const clearManualCredentials = () => {
    sessionStorage.removeItem('TEMP_SUPABASE_URL');
    sessionStorage.removeItem('TEMP_SUPABASE_ANON_KEY');
    window.location.reload();
  };

  if (!isAuthenticated) {
    return (
      <div className="relative max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center animate-fade-in">
        <button 
          onClick={onExit}
          className="absolute top-4 left-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-black text-xs transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
        >
          <i className="fa-solid fa-house"></i>
          <span>BACK TO HOME</span>
        </button>

        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-8">
          <i className="fa-solid fa-shield-halved text-slate-400 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Heritage Sales Portal</h2>
        <p className="text-slate-500 text-sm mb-8">Unauthorized access is monitored.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            autoFocus 
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg tracking-widest" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all">Secure Login</button>
        </form>
      </div>
    );
  }

  const filteredApps = apps.filter(a => 
    (a.applicant?.name?.toLowerCase().includes(search.toLowerCase()) || 
     a.applicant?.phone?.includes(search))
  );

  return (
    <div className="max-w-full overflow-hidden space-y-6 animate-fade-in print:p-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div className="shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Sales Dashboard</h2>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-lock text-[8px]"></i> Encrypted
            </span>
            {storageService.isCloudEnabled() ? (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 ${syncError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                <i className={`fa-solid ${syncError ? 'fa-circle-exclamation' : 'fa-cloud'} text-[8px]`}></i> 
                {syncError ? 'Sync Error' : 'Cloud Sync Active'}
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                <i className="fa-solid fa-triangle-exclamation text-[8px]"></i> Local Only
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">Managing {apps.length} active leads</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden p-1 shadow-sm w-full sm:w-auto">
            <button 
              onClick={() => setViewMode('table')}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <i className="fa-solid fa-table-list"></i> Table
            </button>
            <button 
              onClick={() => setViewMode('appointments')}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all ${viewMode === 'appointments' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <i className="fa-solid fa-calendar-check"></i> <span className="hidden xs:inline">Appointments</span><span className="xs:hidden">Apps</span>
            </button>
            <button 
              onClick={() => { if(selectedApp) setViewMode('profile'); else alert('Select an application first'); }}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all ${viewMode === 'profile' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <i className="fa-solid fa-address-card"></i> Profile
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden lg:block"></div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={refreshData}
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <i className={`fa-solid fa-arrows-rotate ${isLoading ? 'animate-spin' : ''}`}></i>
              <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button 
              onClick={async () => {
                if (confirm("Are you sure you want to clear ALL local data? This will not affect cloud data.")) {
                  localStorage.clear();
                  await refreshData();
                }
              }}
              className="flex-1 sm:flex-none bg-white border border-red-100 text-red-400 px-4 py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-red-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-eraser"></i>
              <span className="hidden sm:inline">Clear Local</span>
            </button>
            <button 
              onClick={onExit}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-house"></i>
              <span className="hidden sm:inline">Main Site</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex-1 sm:flex-none bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 border border-red-100"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {syncError && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 text-red-700 text-sm animate-shake print:hidden">
          <i className="fa-solid fa-circle-exclamation text-2xl"></i>
          <div>
            <p className="font-bold">Cloud Synchronization Issue</p>
            <p className="opacity-80">We couldn't reach the database. Showing local data instead. Error: {syncError}</p>
          </div>
        </div>
      )}

      {!storageService.isCloudEnabled() && (
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4 text-blue-800 text-sm print:hidden">
          <i className="fa-solid fa-circle-info text-2xl mt-0.5"></i>
          <div>
            <p className="font-bold mb-1 text-lg">Cloud Sync Not Configured</p>
            <p className="opacity-90 leading-relaxed mb-3">
              To see applications across different devices, you must connect a Supabase database. 
              Go to <b>Settings &gt; Environment Variables</b> and add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
            </p>
            <div className="bg-white/50 p-3 rounded-xl border border-blue-200 text-xs">
              <p className="font-bold mb-1">Troubleshooting:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Ensure the keys are exactly <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                <li>If you just added them, try <b>refreshing the page</b>.</li>
                <li>Check your browser's console (F12) for initialization logs.</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-blue-200/50">
                <p className="font-bold mb-1">System Detection:</p>
                <p>URL Found: <span className={storageService.getSyncStats().debugInfo?.urlFound ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{storageService.getSyncStats().debugInfo?.urlFound ? "YES" : "NO"}</span></p>
                <p>Key Found: <span className={storageService.getSyncStats().debugInfo?.keyFound ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{storageService.getSyncStats().debugInfo?.keyFound ? "YES" : "NO"}</span></p>
                {storageService.getSyncStats().debugInfo?.urlFound && (
                  <p className="mt-1 opacity-70">URL starts with: {storageService.getSyncStats().debugInfo?.urlStart}...</p>
                )}
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="text-blue-700 font-bold underline hover:text-blue-900 transition-colors"
                >
                  {showManualEntry ? "Hide Manual Connection" : "→ Manually Connect (Temporary Fix)"}
                </button>
                
                {showManualEntry && (
                  <form onSubmit={handleManualConnect} className="mt-3 space-y-3 bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Enter Supabase Credentials</p>
                    <input 
                      type="text" 
                      placeholder="Supabase URL (https://...)" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      value={manualUrl}
                      onChange={e => setManualUrl(e.target.value)}
                      required
                    />
                    <input 
                      type="password" 
                      placeholder="Supabase Anon Key" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      value={manualKey}
                      onChange={e => setManualKey(e.target.value)}
                      required
                    />
                    <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-blue-700 transition-all">
                      Connect for this Session
                    </button>
                    <p className="text-[9px] text-slate-400 italic text-center">Note: This only works in this browser tab. For a permanent fix, set variables in your hosting provider.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {storageService.isCloudEnabled() && sessionStorage.getItem('TEMP_SUPABASE_URL') && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-amber-800 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-plug-circle-exclamation"></i>
            <span>Using <b>Temporary Manual Connection</b>. Permanent environment variables are still missing.</span>
          </div>
          <button onClick={clearManualCredentials} className="underline font-bold hover:text-amber-950">Clear & Reset</button>
        </div>
      )}

      {storageService.isCloudEnabled() && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <i className="fa-solid fa-database text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Database Verification</h3>
                <p className="text-xs text-slate-500">Source of Truth: Supabase Cloud Database</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cloud Records</p>
                <p className="text-xl font-black text-slate-900">{storageService.getSyncStats().cloudCount}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Local Backup</p>
                <p className="text-xl font-black text-slate-900">{storageService.getSyncStats().localCount}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Activity</p>
                <p className="text-sm font-bold text-slate-700">
                  {storageService.getSyncStats().lastSync 
                    ? storageService.getSyncStats().lastSync?.toLocaleTimeString() 
                    : 'No recent activity'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden">
        {viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50">
              <div className="relative flex-1">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Filter applications by name or phone..." 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
              <button 
                onClick={refreshData}
                disabled={isLoading}
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <i className={`fa-solid fa-rotate ${isLoading ? 'animate-spin' : ''}`}></i> {isLoading ? 'Syncing...' : 'Refresh'}
              </button>
              <button 
                onClick={seedSampleData}
                disabled={isLoading}
                className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <i className="fa-solid fa-database"></i> Seed Data
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                    <th className="px-6 py-4 whitespace-nowrap">ID / Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Applicant Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4">Income</th>
                    <th className="px-6 py-4">Rooms</th>
                    <th className="px-6 py-4">Documents</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length > 0 ? filteredApps.map(app => (
                    <tr 
                      key={app.id} 
                      className={`hover:bg-blue-50/30 transition-colors cursor-pointer group ${selectedApp?.id === app.id ? 'bg-blue-50/50' : ''}`}
                      onClick={() => { setSelectedApp(app); setViewMode('profile'); }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-xs">{app.id}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{new Date(app.submittedAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                          app.type === 'CREDIT_APP' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {app.type === 'CREDIT_APP' ? 'Credit App' : 'Appt Only'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${(app.applicant?.internalScore || 0) >= 60 ? 'bg-green-500' : (app.applicant?.internalScore || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}>
                            {app.applicant?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-none">{app.applicant?.name || 'Unknown'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-slate-400">{app.applicant?.phone || 'No phone'}</p>
                              {app.isComplete === false && (
                                <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Partial Lead</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          !app.isComplete ? 'bg-amber-100 text-amber-700' :
                          app.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          app.status === 'Denied' ? 'bg-red-100 text-red-700' :
                          app.status === 'Reviewing' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {app.isComplete ? app.status : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${app.isComplete ? 'bg-green-500' : 'bg-amber-500'}`} 
                            style={{ width: app.isComplete ? '100%' : (app.documents?.length || 0) > 0 ? '80%' : app.applicant?.customization ? '60%' : app.cosigner ? '40%' : '20%' }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-sm ${getScoreColor(app.applicant?.internalScore || 0).split(' ')[0]}`}>
                          {app.applicant?.internalScore || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">${app.applicant?.monthlyIncome || 0}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{app.applicant?.bedrooms || 0} BR</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-paperclip text-slate-300"></i>
                          <span className="font-bold text-slate-500">{app.documents.length} files</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            title="View Full Profile"
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button 
                            title="Quick Delete"
                            onClick={(e) => { e.stopPropagation(); deleteApp(app.id); }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-4">
                          <i className="fa-solid fa-folder-open text-5xl opacity-20"></i>
                          <p className="font-bold uppercase tracking-widest text-xs">No applications found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'appointments' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">Requested Appointments</h3>
              <p className="text-slate-500 text-sm">Leads who requested a callback or viewing</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Preferred Date</th>
                    <th className="px-6 py-4">Contact Method</th>
                    <th className="px-6 py-4">Best Time</th>
                    <th className="px-6 py-4">Home Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apps.filter(a => a.applicant?.wantAppointment).length > 0 ? apps.filter(a => a.applicant?.wantAppointment).map(app => (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900">{app.applicant?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{app.applicant?.phone || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {app.applicant.date ? new Date(app.applicant.date).toLocaleDateString() : 'Not Set'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">{app.applicant.preferredContact || 'Phone'}</span>
                        <p className="text-[10px] text-slate-400">{app.applicant.email}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{app.applicant.bestTimeToCall || 'Morning'}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{app.applicant.homeTypeInterest || 'Any'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          app.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          app.status === 'Denied' ? 'bg-red-100 text-red-700' :
                          app.status === 'Reviewing' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedApp(app); setViewMode('profile'); }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                        <p className="font-bold uppercase tracking-widest text-xs">No appointment requests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
            <div className="lg:col-span-1 hidden lg:block space-y-4">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                 <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-400 tracking-widest">
                    Quick Leads
                 </div>
                 <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {filteredApps.map(app => (
                      <button 
                        key={app.id} 
                        onClick={() => setSelectedApp(app)}
                        className={`w-full p-4 text-left transition-all ${selectedApp?.id === app.id ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
                      >
                        <p className="font-black text-slate-900 text-sm truncate">{app.applicant?.name || 'Unknown'}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{app.status}</span>
                          <span className={`text-[10px] font-black ${getScoreColor(app.applicant.internalScore).split(' ')[0]}`}>{app.applicant.internalScore} pts</span>
                        </div>
                      </button>
                    ))}
                 </div>
               </div>
            </div>

            <div className="lg:col-span-3 min-w-0">
              {selectedApp ? (
                <div ref={profileRef} className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
                  <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-900 text-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                      <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-xl md:text-3xl font-black text-white shrink-0 shadow-2xl ${(selectedApp.applicant?.internalScore || 0) >= 60 ? 'bg-green-500 shadow-green-500/30' : (selectedApp.applicant?.internalScore || 0) >= 40 ? 'bg-amber-500 shadow-amber-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
                        {selectedApp.applicant?.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl md:text-3xl font-black truncate">{selectedApp.applicant?.name || 'Unknown'}</h3>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                            <i className="fa-solid fa-hashtag text-[8px]"></i> {selectedApp.id}
                          </p>
                          <span className="hidden xs:block w-1 h-1 rounded-full bg-slate-700"></span>
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                            {new Date(selectedApp.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:gap-3 w-full xl:w-auto">
                      <button 
                        onClick={handlePrint}
                        className="flex-1 xl:flex-none bg-slate-800 hover:bg-slate-700 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 whitespace-nowrap transition-all"
                      >
                        <i className="fa-solid fa-print"></i> Print
                      </button>
                      <button 
                        onClick={handleDownloadPDF}
                        disabled={isLoading}
                        className="flex-1 xl:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 whitespace-nowrap transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                      >
                        <i className={`fa-solid ${isLoading ? 'fa-spinner animate-spin' : 'fa-file-pdf'}`}></i> <span className="hidden sm:inline">{isLoading ? 'Generating...' : 'Download PDF'}</span><span className="sm:hidden">PDF</span>
                      </button>
                      <button 
                        onClick={() => deleteApp(selectedApp.id)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 md:p-8 max-h-[calc(100vh-250px)] overflow-y-auto space-y-8 md:space-y-12 pb-24">
                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4 w-full xl:w-auto">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm text-slate-400 shrink-0">
                          <i className="fa-solid fa-clipboard-check text-lg md:text-xl"></i>
                        </div>
                        <div>
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Workflow</p>
                          <p className="text-slate-900 font-bold text-sm md:text-base">Status: <span className="text-blue-600">{selectedApp.status}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm w-full xl:w-auto">
                        {['Pending', 'Reviewing', 'Approved', 'Denied'].map(s => (
                          <button 
                            key={s}
                            onClick={() => updateStatus(selectedApp.id, s as any)}
                            className={`flex-1 xl:flex-none px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black uppercase transition-all ${selectedApp.status === s ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className={`p-6 rounded-3xl border border-slate-100 text-center shadow-sm ${getScoreColor(selectedApp.applicant?.internalScore || 0)}`}>
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Approval Score</p>
                        <p className="text-4xl font-black leading-none">{selectedApp.applicant?.internalScore || 0}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Income</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">${selectedApp.applicant?.monthlyIncome || 0}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Down Payment</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">${selectedApp.applicant?.downPayment || 0}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Co-signer</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">{selectedApp.cosigner ? 'YES' : 'NO'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                             <i className="fa-solid fa-user text-blue-600"></i> Applicant Data
                          </h4>
                          <button 
                            onClick={() => toggleReveal(selectedApp.id)}
                            className={`text-[10px] font-black px-3 py-1.5 rounded-xl transition-all uppercase ${revealedFields[selectedApp.id] ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}
                          >
                            {revealedFields[selectedApp.id] ? 'Hide PII' : 'Reveal SSN/DOB'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <DataRow label="Phone Number" value={selectedApp.applicant?.phone || 'No phone'} />
                          <DataRow label="Email Address" value={selectedApp.applicant?.email || 'No email'} />
                          <DataRow 
                            label="Social Security" 
                            value={revealedFields[selectedApp.id] ? selectedApp.applicant?.ssn : maskSSN(selectedApp.applicant?.ssn || '')} 
                            masked={!revealedFields[selectedApp.id]}
                          />
                          <DataRow 
                            label="Date of Birth" 
                            value={revealedFields[selectedApp.id] ? selectedApp.applicant?.dob : 'MM/DD/YYYY'} 
                            masked={!revealedFields[selectedApp.id]}
                          />
                          <DataRow label="Current Address" value={selectedApp.applicant?.currentAddress || 'No address'} />
                          <div className="grid grid-cols-2 gap-4">
                            <DataRow label="City" value={selectedApp.applicant?.city || 'N/A'} />
                            <DataRow label="State" value={selectedApp.applicant?.state || 'N/A'} />
                          </div>
                          <DataRow label="Years at Address" value={selectedApp.applicant?.yearsAtAddress || 'N/A'} />
                          {selectedApp.applicant?.wantAppointment && (
                            <>
                              <div className="col-span-full pt-4 border-t border-slate-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Appointment Preferences</p>
                                <div className="grid grid-cols-3 gap-4">
                                  <DataRow label="Preferred Contact" value={selectedApp.applicant?.preferredContact || 'Phone'} />
                                  <DataRow label="Best Time to Call" value={selectedApp.applicant?.bestTimeToCall || 'Morning'} />
                                  <DataRow label="Home Interest" value={selectedApp.applicant?.homeTypeInterest || 'Any'} />
                                </div>
                                <div className="mt-4">
                                  <DataRow label="Appointment Details / Message" value={selectedApp.applicant?.appointmentDetails || 'No details'} />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="pt-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Applicant Signature</p>
                          {renderSignature(selectedApp.applicant?.signature)}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-3 flex items-center gap-2">
                           <i className="fa-solid fa-briefcase text-blue-600"></i> Employment & Preferences
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <DataRow label="Employer" value={selectedApp.applicant?.employerName || 'N/A'} />
                          <DataRow label="Employment Type" value={selectedApp.applicant?.employmentStatus || 'N/A'} />
                          <DataRow label="Job Title" value={selectedApp.applicant?.jobTitle || 'N/A'} />
                          <DataRow label="Bedrooms Needed" value={`${selectedApp.applicant?.bedrooms || 0} Bedrooms`} />
                          <DataRow label="Land Status" value={selectedApp.applicant?.landStatus || 'N/A'} />
                          <DataRow label="Utilities" value={selectedApp.applicant?.utilities || 'N/A'} />
                        </div>
                      </section>
                    </div>

                    {selectedApp.cosigner && (
                      <section className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100/50 space-y-6">
                        <h4 className="font-black text-blue-900 border-b border-blue-100/50 pb-3 uppercase tracking-widest text-xs flex items-center gap-2">
                          <i className="fa-solid fa-users"></i> Co-signer Details ({selectedApp.cosigner?.relationship || 'N/A'})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          <DataRow label="Co-signer Name" value={selectedApp.cosigner?.name || 'N/A'} />
                          <DataRow label="Phone" value={selectedApp.cosigner?.phone || 'N/A'} />
                          <DataRow 
                            label="SSN" 
                            value={revealedFields[selectedApp.id] ? selectedApp.cosigner?.ssn || '' : maskSSN(selectedApp.cosigner?.ssn || '')} 
                            masked={!revealedFields[selectedApp.id]}
                          />
                          <DataRow label="Monthly Income" value={`$${selectedApp.cosigner?.monthlyIncome || 0}`} />
                          <DataRow label="Employer" value={selectedApp.cosigner?.employerName || 'N/A'} colSpan={2} />
                          <div className="md:col-span-2 pt-4 border-t border-blue-100">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Co-signer Signature</p>
                            {renderSignature(selectedApp.cosigner?.signature)}
                          </div>
                        </div>
                      </section>
                    )}

                    {selectedApp.applicant?.customization && (
                      <section className="bg-green-50/50 p-8 rounded-[2.5rem] border border-green-100/50 space-y-6">
                        <h4 className="font-black text-green-900 border-b border-green-100/50 pb-3 uppercase tracking-widest text-xs flex items-center gap-2">
                          <i className="fa-solid fa-house-circle-check"></i> Home Customization Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <DataRow label="Home Type" value={selectedApp.applicant?.customization.homeType} />
                          <DataRow label="Quality Level" value={selectedApp.applicant?.customization.isIdeal ? 'Ideal (Premium)' : 'Bare Minimum (Value)'} />
                          <DataRow label="Estimated Total" value={`$${selectedApp.applicant?.customization.estimatedTotal.toLocaleString()}`} />
                          <DataRow label="Well" value={selectedApp.applicant?.customization.hasWell ? 'Yes' : 'No'} />
                          <DataRow label="Septic" value={selectedApp.applicant?.customization.hasSeptic ? 'Yes' : 'No'} />
                          <DataRow label="Electric" value={selectedApp.applicant?.customization.hasElectric ? 'Yes' : 'No'} />
                        </div>
                      </section>
                    )}

                    {selectedApp.depositReceipt && (
                      <section className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100/50 space-y-6">
                        <h4 className="font-black text-amber-900 border-b border-amber-100/50 pb-3 uppercase tracking-widest text-xs flex items-center gap-2">
                          <i className="fa-solid fa-receipt"></i> Deposit Receipt
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <DataRow label="Amount" value={`$${selectedApp.depositReceipt.amount}`} />
                          <DataRow label="Payment Method" value={selectedApp.depositReceipt.paymentMethod} />
                          <DataRow label="Date" value={selectedApp.depositReceipt.date} />
                        </div>
                        <div className="pt-4 border-t border-amber-100">
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Customer Signature</p>
                          {renderSignature(selectedApp.depositReceipt?.signature)}
                        </div>
                      </section>
                    )}

                    {selectedApp.paymentAuth && (
                      <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 space-y-6">
                        <h4 className="font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-widest text-xs flex items-center gap-2">
                          <i className="fa-solid fa-credit-card"></i> Payment Authorization
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <DataRow label="Card Type" value={selectedApp.paymentAuth.cardType} />
                          <DataRow label="Card Number" value={revealedFields[selectedApp.id] ? selectedApp.paymentAuth.cardNumber : `**** **** **** ${selectedApp.paymentAuth.cardNumber.slice(-4)}`} masked={!revealedFields[selectedApp.id]} />
                          <DataRow label="Expiration" value={selectedApp.paymentAuth.expirationDate} />
                          <DataRow label="Cardholder Name" value={selectedApp.paymentAuth.customerName} />
                          <DataRow label="Billing Address" value={selectedApp.paymentAuth.billingAddress} colSpan={2} />
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Authorization Signature</p>
                          {renderSignature(selectedApp.paymentAuth?.signature)}
                        </div>
                      </section>
                    )}

                    <section className="space-y-6">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-3 flex items-center gap-2">
                         <i className="fa-solid fa-folder-tree text-blue-600"></i> Secured Attachments
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApp.documents.map(doc => (
                          <div 
                            key={doc.id} 
                            onClick={() => downloadFile(doc)}
                            className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                {doc.category === 'license' || doc.category === 'ss_card' ? <i className="fa-solid fa-id-card"></i> : <i className="fa-solid fa-file-invoice"></i>}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate group-hover:text-blue-700 transition-colors">{doc.name}</p>
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                                  {doc.owner} — {doc.category.replace('_', ' ')} {doc.size ? `(${formatSize(doc.size)})` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <i className="fa-solid fa-download text-xs"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 animate-pulse">
                   <i className="fa-solid fa-fingerprint text-6xl mb-6 opacity-20"></i>
                   <p className="text-sm font-black uppercase tracking-[0.2em]">Select an encrypted profile to begin processing</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedApp && (
        <div className="hidden print:block print:bg-white print:text-black print:p-0 print:m-0">
          <div className="p-10 max-w-[8.5in] mx-auto min-h-[11in] bg-white">
            <div className="flex justify-between items-start border-b-8 border-slate-900 pb-8 mb-10">
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-slate-900">Heritage Housing</h1>
                <p className="text-sm font-black mt-2 uppercase tracking-[0.3em] text-slate-500">Official Credit Application Report</p>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg mb-2">
                  <p className="text-[10px] font-bold uppercase opacity-70">Application ID</p>
                  <p className="text-xl font-black">{selectedApp.id}</p>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase">{new Date(selectedApp.submittedAt).toLocaleDateString()} | {new Date(selectedApp.submittedAt).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border-4 border-slate-900 mb-10 rounded-2xl overflow-hidden">
              <div className="p-6 border-r-4 border-slate-900 text-center bg-slate-50">
                <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest">Internal Score</p>
                <p className="text-6xl font-black text-slate-900">{selectedApp.applicant?.internalScore || 0}</p>
              </div>
              <div className="p-6 border-r-4 border-slate-900 text-center">
                <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest">Monthly Income</p>
                <p className="text-4xl font-black text-slate-900">${selectedApp.applicant?.monthlyIncome || 0}</p>
              </div>
              <div className="p-6 text-center bg-slate-50">
                <p className="text-[10px] font-black uppercase mb-2 text-slate-500 tracking-widest">Down Payment</p>
                <p className="text-4xl font-black text-slate-900">${selectedApp.applicant?.downPayment || 0}</p>
              </div>
            </div>

            <div className="space-y-10">
              <section>
                <h2 className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] inline-block mb-6 rounded-md">I. Primary Applicant Details</h2>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <PrintField label="Full Name" value={selectedApp.applicant?.name || 'Unknown'} />
                  <PrintField label="Social Security #" value={selectedApp.applicant?.ssn || 'N/A'} />
                  <PrintField label="Phone Number" value={selectedApp.applicant?.phone || 'No phone'} />
                  <PrintField label="Date of Birth" value={selectedApp.applicant?.dob || 'N/A'} />
                  <PrintField label="Email Address" value={selectedApp.applicant?.email || 'No email'} />
                  <PrintField label="Current Address" value={`${selectedApp.applicant?.currentAddress || ''}${selectedApp.applicant?.city ? `, ${selectedApp.applicant.city}` : ''}${selectedApp.applicant?.state ? `, ${selectedApp.applicant.state}` : ''}`} />
                  <PrintField label="Employer Name" value={selectedApp.applicant?.employerName || 'N/A'} />
                  <PrintField label="Job Title" value={selectedApp.applicant?.jobTitle || 'N/A'} />
                </div>
              </section>

              {selectedApp.cosigner ? (
                <section>
                  <h2 className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] inline-block mb-6 rounded-md">II. Co-signer Details ({selectedApp.cosigner.relationship})</h2>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <PrintField label="Co-signer Name" value={selectedApp.cosigner?.name || 'N/A'} />
                    <PrintField label="Social Security #" value={selectedApp.cosigner.ssn} />
                    <PrintField label="Co-signer Phone" value={selectedApp.cosigner.phone} />
                    <PrintField label="Monthly Income" value={`$${selectedApp.cosigner.monthlyIncome}`} />
                    <PrintField label="Employer Name" value={selectedApp.cosigner.employerName} colSpan={2} />
                  </div>
                </section>
              ) : (
                <div className="border-2 border-dashed border-slate-300 p-6 text-center rounded-2xl bg-slate-50">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No Co-signer Application Submitted</p>
                </div>
              )}

              <section>
                <h2 className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] inline-block mb-6 rounded-md">III. Home Customization & Cost Summary</h2>
                {selectedApp.applicant?.customization ? (
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 bg-slate-50 p-6 rounded-2xl border-2 border-slate-900">
                    <PrintField label="Home Type" value={selectedApp.applicant?.customization.homeType} />
                    <PrintField label="Quality Level" value={selectedApp.applicant?.customization.isIdeal ? 'Ideal (Premium)' : 'Bare Minimum (Value)'} />
                    <PrintField label="Estimated Total" value={`$${selectedApp.applicant?.customization.estimatedTotal.toLocaleString()}`} />
                    <PrintField label="Utilities (Well/Septic/Electric)" value={`${selectedApp.applicant?.customization.hasWell ? 'Well' : 'No Well'}, ${selectedApp.applicant?.customization.hasSeptic ? 'Septic' : 'No Septic'}, ${selectedApp.applicant?.customization.hasElectric ? 'Electric' : 'No Electric'}`} />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 p-6 text-center rounded-2xl bg-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No Customization Data Provided</p>
                  </div>
                )}
              </section>

              <section>
                <h2 className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] inline-block mb-6 rounded-md">IV. Property & Preferences</h2>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <PrintField label="Bedrooms Requested" value={selectedApp.applicant?.bedrooms || 0} />
                  <PrintField label="Property Status" value={selectedApp.applicant?.landStatus || 'N/A'} />
                  <PrintField label="Utilities Present" value={selectedApp.applicant?.utilities || 'N/A'} />
                  <PrintField label="Credit Score Estimate" value={selectedApp.applicant?.creditEstimate || 'N/A'} />
                  <PrintField label="Appointment Requested" value={selectedApp.applicant?.wantAppointment ? 'YES' : 'NO'} />
                  <PrintField label="Appointment Details" value={selectedApp.applicant?.appointmentDetails || 'No details'} colSpan={2} />
                </div>
              </section>

              {selectedApp.depositReceipt && (
                <section>
                  <h2 className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] inline-block mb-6 rounded-md">V. Deposit Receipt</h2>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 bg-amber-50 p-6 rounded-2xl border-2 border-slate-900">
                    <PrintField label="Amount Received" value={`$${selectedApp.depositReceipt.amount}`} />
                    <PrintField label="Payment Method" value={selectedApp.depositReceipt.paymentMethod} />
                    <PrintField label="Date" value={selectedApp.depositReceipt.date} />
                  </div>
                </section>
              )}

              {selectedApp.paymentAuth && (
                <section>
                  <h2 className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] inline-block mb-6 rounded-md">VI. Payment Authorization</h2>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 bg-slate-50 p-6 rounded-2xl border-2 border-slate-900">
                    <PrintField label="Cardholder Name" value={selectedApp.paymentAuth.customerName} />
                    <PrintField label="Card Type" value={selectedApp.paymentAuth.cardType} />
                    <PrintField label="Card Number" value={`**** **** **** ${selectedApp.paymentAuth.cardNumber.slice(-4)}`} />
                    <PrintField label="Expiration" value={selectedApp.paymentAuth.expirationDate} />
                    <PrintField label="Billing Address" value={selectedApp.paymentAuth.billingAddress} colSpan={2} />
                  </div>
                </section>
              )}

              <section>
                 <h2 className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-[0.2em] inline-block mb-6 rounded-md">{selectedApp.depositReceipt || selectedApp.paymentAuth ? 'VII' : 'V'}. Submitted Evidence</h2>
                 <div className="grid grid-cols-3 gap-3">
                   {selectedApp.documents.map(d => (
                     <div key={d.id} className="border-2 border-slate-200 p-3 flex items-center gap-3 rounded-xl bg-slate-50">
                       <i className="fa-solid fa-check-circle text-green-600 text-xs"></i>
                       <p className="text-[10px] font-black text-slate-700 uppercase truncate">{d.name}</p>
                     </div>
                   ))}
                 </div>
              </section>

              <div className="pt-12 border-t-4 border-slate-900 mt-auto">
                <div className="grid grid-cols-2 gap-20">
                  <div className="space-y-4">
                     <div className="border-b-4 border-slate-900 min-h-[80px] flex items-end justify-center pb-2 bg-slate-50/50 rounded-t-xl">
                       {renderSignature(selectedApp.applicant.signature)}
                     </div>
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Applicant: {selectedApp.applicant?.name || 'Unknown'}</p>
                  </div>
                  {selectedApp.cosigner && (
                    <div className="space-y-4">
                      <div className="border-b-4 border-slate-900 min-h-[80px] flex items-end justify-center pb-2 bg-slate-50/50 rounded-t-xl">
                        {renderSignature(selectedApp.cosigner?.signature)}
                      </div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Co-signer: {selectedApp.cosigner?.name || 'N/A'}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between gap-20 mt-12">
                  <div className="flex-1">
                     <div className="border-b-4 border-slate-900 h-16 bg-slate-50/50 rounded-t-xl"></div>
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-2">Reviewing Salesperson</p>
                  </div>
                  <div className="flex-1">
                     <div className="border-b-4 border-slate-900 h-16 bg-slate-50/50 rounded-t-xl"></div>
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mt-2">Management Review</p>
                  </div>
                </div>
                <p className="text-[8px] text-slate-400 mt-12 italic leading-relaxed text-center max-w-2xl mx-auto">
                  CONFIDENTIAL: This document contains sensitive personal information and is for internal verification by Heritage Housing Sales Personnel only. Any unauthorized duplication or distribution is strictly prohibited. Final approval is subject to manual verification of all submitted documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataRow = ({ label, value, masked = false, colSpan = 1 }: { label: string, value: string, masked?: boolean, colSpan?: number }) => (
  <div className={`space-y-1 ${colSpan > 1 ? 'md:col-span-2' : ''}`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm font-bold text-slate-900 border-b border-slate-50 pb-1 ${masked ? 'blur-[4px] select-none opacity-50' : ''}`}>
      {value || 'Not Provided'}
    </p>
  </div>
);

const PrintField = ({ label, value, colSpan = 1 }: { label: string, value: string, colSpan?: number }) => (
  <div className={colSpan > 1 ? 'col-span-2' : ''}>
    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-1">{label}</p>
    <p className="text-sm font-black text-black border-b border-slate-200 pb-1">{value || 'N/A'}</p>
  </div>
);

export default Dashboard;
