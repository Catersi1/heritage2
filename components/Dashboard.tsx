
import React, { useState, useEffect, useRef } from 'react';
import { LeadApplication, EarnestDepositData } from '../types';
import { storageService } from '../services/storageService';
import { Icons, ADMIN_PASSWORD_HASH } from '../constants';
import { downloadHtmlAsPdf } from '../pdfUtils';
import { buildApplicationPrintHtml, buildCreditCardAuthPrintHtml, buildDepositReceiptPrintHtml } from '../printUtils';

// Auth helpers (inlined so build does not depend on services/authService)
const AUTH_SESSION_KEY = 'hh_admin_session';
const AUTH_SESSION_EXP_KEY = 'hh_admin_session_exp';
const AUTH_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const AUTH_SALT = 'hh_okc_admin_salt_v1';

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(AUTH_SALT + password));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function createSession(): void {
  try {
    sessionStorage.setItem(AUTH_SESSION_KEY, btoa([Date.now(), crypto.getRandomValues(new Uint8Array(12))].join('.')));
    sessionStorage.setItem(AUTH_SESSION_EXP_KEY, String(Date.now() + AUTH_SESSION_DURATION_MS));
  } catch (_) {}
}
function hasValidSession(): boolean {
  try {
    const exp = sessionStorage.getItem(AUTH_SESSION_EXP_KEY);
    return !!(exp && sessionStorage.getItem(AUTH_SESSION_KEY) && Date.now() < Number(exp));
  } catch { return false; }
}
function clearSession(): void {
  try {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_SESSION_EXP_KEY);
  } catch (_) {}
}

interface Props {
  onLogout: () => void;
  onBack?: () => void;
}

type DashboardView = 'table' | 'profile';

const Dashboard: React.FC<Props> = ({ onLogout, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(hasValidSession());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [apps, setApps] = useState<LeadApplication[]>([]);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<LeadApplication | null>(null);
  const [viewMode, setViewMode] = useState<DashboardView>('table');
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const check = () => {
      if (!hasValidSession()) {
        clearSession();
        setIsAuthenticated(false);
      }
    };
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      storageService.getApplications().then(setApps);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!password || password.length < 12) {
      setLoginError('Password must be at least 12 characters.');
      return;
    }
    const hashed = await hashPassword(password);
    if (hashed === ADMIN_PASSWORD_HASH) {
      createSession();
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid password.');
    }
  };

  const handleLogout = () => {
    clearSession();
    onLogout();
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
    const updatedApps = await storageService.getApplications();
    setApps(updatedApps);
    if (selectedApp?.id === id) {
      setSelectedApp(updatedApps.find(a => a.id === id) || null);
    }
  };

  const deleteApp = async (id: string) => {
    if (confirm("Are you sure you want to delete this application? This cannot be undone.")) {
      await storageService.deleteApplication(id);
      const updatedApps = await storageService.getApplications();
      setApps(updatedApps);
      setSelectedApp(null);
      setViewMode('table');
    }
  };

  const downloadFile = (doc: { data: string, name: string }) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!selectedApp) return;
    document.body.classList.add('print-application-only');
    const cleanup = () => {
      document.body.classList.remove('print-application-only');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print());
    });
  };

  const handlePrintDepositForms = () => {
    if (!selectedApp?.earnestDeposit) return;
    document.body.classList.add('print-deposit-forms-only');
    const cleanup = () => {
      document.body.classList.remove('print-deposit-forms-only');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print());
    });
  };

  /** Download as PDF. */
  const handleDownloadApplicationPdf = () => {
    if (!selectedApp) return;
    const html = buildApplicationPrintHtml(selectedApp);
    downloadHtmlAsPdf(html, `application-${selectedApp.id}.pdf`).catch(() => alert('PDF download failed. Try again or use Print.'));
  };

  const handleDownloadCreditCardAuthPdf = () => {
    if (!selectedApp?.earnestDeposit) return;
    const html = buildCreditCardAuthPrintHtml(selectedApp.earnestDeposit);
    downloadHtmlAsPdf(html, `credit-card-authorization-${selectedApp.id}.pdf`).catch(() => alert('PDF download failed. Try again or use Print.'));
  };

  const handleDownloadDepositReceiptPdf = () => {
    if (!selectedApp?.earnestDeposit) return;
    const html = buildDepositReceiptPrintHtml(selectedApp.earnestDeposit);
    downloadHtmlAsPdf(html, `deposit-receipt-${selectedApp.id}.pdf`).catch(() => alert('PDF download failed. Try again or use Print.'));
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  if (!isAuthenticated) {
    return (
      <div className="relative max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center animate-fade-in">
        <button 
          onClick={handleLogout}
          className="absolute top-4 left-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-black text-xs transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
        >
          <i className="fa-solid fa-house"></i>
          <span>BACK TO HOME</span>
        </button>

        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-8">
          <i className="fa-solid fa-shield-halved text-slate-400 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Heritage Sales Portal</h2>
        <p className="text-slate-500 text-sm mb-2">Unauthorized access is monitored.</p>
        <p className="text-slate-400 text-xs mb-6">Password must be at least 12 characters.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            autoFocus 
            minLength={12}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg tracking-widest" 
            placeholder="Enter admin password" 
            value={password} 
            onChange={e => { setPassword(e.target.value); setLoginError(''); }} 
          />
          {loginError && <p className="text-red-600 text-sm font-medium">{loginError}</p>}
          <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all">Secure Login</button>
        </form>
      </div>
    );
  }

  const filteredApps = apps.filter(a => 
    a.applicant.name.toLowerCase().includes(search.toLowerCase()) || 
    a.applicant.phone.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-slate-900">Sales Dashboard</h2>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-lock text-[8px]"></i> Encrypted
            </span>
          </div>
          <p className="text-slate-500">Managing {apps.length} active leads</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Data syncs to the cloud (Supabase)—same list from any browser or device when configured.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <i className="fa-solid fa-table-list"></i> Table
            </button>
            <button 
              onClick={() => { if(selectedApp) setViewMode('profile'); else alert('Select an application first'); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'profile' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <i className="fa-solid fa-address-card"></i> Profile
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { window.location.hash = ''; onBack?.(); }}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              <i className="fa-solid fa-house"></i>
              <span className="hidden sm:inline">Main Site</span>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2 border border-red-100"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </div>

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
                onClick={() => storageService.getApplications().then(setApps)}
                className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-rotate"></i> Refresh
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                    <th className="px-6 py-4 whitespace-nowrap">ID / Date</th>
                    <th className="px-6 py-4">Applicant Name</th>
                    <th className="px-6 py-4">Status</th>
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
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${app.applicant.internalScore >= 60 ? 'bg-green-500' : app.applicant.internalScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}>
                            {app.applicant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-none">{app.applicant.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{app.applicant.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'Denied' ? 'bg-red-100 text-red-700' :
                          app.status === 'Reviewing' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'Pending Documents' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-sm ${getScoreColor(app.applicant.internalScore).split(' ')[0]}`}>
                          {app.applicant.internalScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">${app.applicant.monthlyIncome}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{app.applicant.bedrooms} BR</td>
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
                      <td colSpan={8} className="px-6 py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                          <i className="fa-solid fa-folder-open text-5xl opacity-20"></i>
                          <p className="font-bold uppercase tracking-widest text-xs">
                            {apps.length === 0 && !search
                              ? 'No applications in this browser yet'
                              : 'No applications found matching your criteria'}
                          </p>
                          {apps.length === 0 && !search && (
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Configure Supabase (see docs/SUPABASE_SETUP.md) to sync applications to the cloud so you can open the dashboard from any browser or device. Until then, data is stored only in this browser.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] gap-6 animate-fade-in min-w-0">
            <div className="hidden lg:block min-w-0">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                 <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-400 tracking-widest shrink-0">
                    Quick Leads
                 </div>
                 <div className="flex-1 overflow-y-auto divide-y divide-slate-50 min-h-0">
                    {filteredApps.map(app => (
                      <button 
                        key={app.id} 
                        onClick={() => setSelectedApp(app)}
                        className={`w-full p-4 text-left transition-all ${selectedApp?.id === app.id ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'}`}
                      >
                        <p className="font-black text-slate-900 text-sm truncate">{app.applicant.name}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{app.status}</span>
                          <span className={`text-[10px] font-black shrink-0 ${getScoreColor(app.applicant.internalScore).split(' ')[0]}`}>{app.applicant.internalScore} pts</span>
                        </div>
                      </button>
                    ))}
                 </div>
               </div>
            </div>

            <div className="min-w-0 flex flex-col">
              {selectedApp ? (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden animate-fade-in min-w-0 flex flex-col flex-1">
                  <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shrink-0 shadow-2xl ${selectedApp.applicant.internalScore >= 60 ? 'bg-green-500 shadow-green-500/30' : selectedApp.applicant.internalScore >= 40 ? 'bg-amber-500 shadow-amber-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
                        {selectedApp.applicant.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl sm:text-2xl xl:text-3xl font-black truncate">{selectedApp.applicant.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                            <i className="fa-solid fa-hashtag text-[8px]"></i> {selectedApp.id}
                          </p>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            {new Date(selectedApp.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={handlePrint}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
                        >
                          <i className="fa-solid fa-print"></i> Print Application
                        </button>
                        {selectedApp.earnestDeposit && (
                          <button 
                            onClick={handlePrintDepositForms}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
                          >
                            <i className="fa-solid fa-file-invoice"></i> Print Deposit Forms
                          </button>
                        )}
                        <button 
                          onClick={() => deleteApp(selectedApp.id)}
                          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-2xl font-bold transition-all"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap text-sm">
                        <button 
                          onClick={handleDownloadApplicationPdf}
                          className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
                        >
                          <i className="fa-solid fa-file-pdf"></i> Download Application (PDF)
                        </button>
                        {selectedApp.earnestDeposit && (
                          <>
                            <button 
                              onClick={handleDownloadCreditCardAuthPdf}
                              className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
                            >
                              <i className="fa-solid fa-file-pdf"></i> Download Credit Card Auth (PDF)
                            </button>
                            <button 
                              onClick={handleDownloadDepositReceiptPdf}
                              className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
                            >
                              <i className="fa-solid fa-file-pdf"></i> Download Deposit Receipt (PDF)
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-10 pb-24">
                    <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                          <i className="fa-solid fa-clipboard-check text-xl"></i>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Workflow</p>
                          <p className="text-slate-900 font-bold">Current Status: <span className="text-blue-600">{selectedApp.status}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex-wrap min-w-0">
                        {['Pending', 'Pending Documents', 'Reviewing', 'Approved', 'Denied'].map(s => (
                          <button 
                            key={s}
                            onClick={() => updateStatus(selectedApp.id, s as any)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all whitespace-nowrap ${selectedApp.status === s ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 min-w-0">
                      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 text-center shadow-sm min-w-0 ${getScoreColor(selectedApp.applicant.internalScore)}`}>
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">Approval Score</p>
                        <p className="text-4xl font-black leading-none">{selectedApp.applicant.internalScore}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Income</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">${selectedApp.applicant.monthlyIncome}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Down Payment</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">${selectedApp.applicant.downPayment}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Co-signer</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none">{selectedApp.cosigner ? 'YES' : 'NO'}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Appointment</p>
                        <p className="text-lg font-bold text-slate-900 leading-none">
                          {selectedApp.appointmentDate ? new Date(selectedApp.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 min-w-0">
                      <section className="space-y-6 min-w-0">
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
                          <DataRow label="Phone Number" value={selectedApp.applicant.phone} />
                          <DataRow label="Email Address" value={selectedApp.applicant.email} />
                          <DataRow 
                            label="Social Security" 
                            value={revealedFields[selectedApp.id] ? selectedApp.applicant.ssn : maskSSN(selectedApp.applicant.ssn)} 
                            masked={!revealedFields[selectedApp.id]}
                          />
                          <DataRow 
                            label="Date of Birth" 
                            value={revealedFields[selectedApp.id] ? selectedApp.applicant.dob : 'MM/DD/YYYY'} 
                            masked={!revealedFields[selectedApp.id]}
                          />
                          <DataRow label="Current Address" value={selectedApp.applicant.currentAddress} />
                          <DataRow label="Years at Address" value={selectedApp.applicant.yearsAtAddress} />
                          {selectedApp.appointmentDate && (
                            <DataRow label="Preferred appointment" value={new Date(selectedApp.appointmentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
                          )}
                        </div>
                        {selectedApp.applicant.signature && (
                          <div className="pt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Applicant Signature</p>
                            <img src={selectedApp.applicant.signature} alt="Signature" className="h-20 border-b border-slate-200" />
                          </div>
                        )}
                      </section>

                      <section className="space-y-6 min-w-0">
                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-3 flex items-center gap-2">
                           <i className="fa-solid fa-briefcase text-blue-600"></i> Employment & Preferences
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <DataRow label="Employer" value={selectedApp.applicant.employerName} />
                          <DataRow label="Employment Type" value={selectedApp.applicant.employmentStatus} />
                          <DataRow label="Job Title" value={selectedApp.applicant.jobTitle} />
                          <DataRow label="Bedrooms Needed" value={`${selectedApp.applicant.bedrooms} Bedrooms`} />
                          <DataRow label="Land Status" value={selectedApp.applicant.landStatus} />
                          <DataRow label="Utilities" value={selectedApp.applicant.utilities} />
                        </div>
                      </section>
                    </div>

                    {selectedApp.cosigner && (
                      <section className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100/50 space-y-6">
                        <h4 className="font-black text-blue-900 border-b border-blue-100/50 pb-3 uppercase tracking-widest text-xs flex items-center gap-2">
                          <i className="fa-solid fa-users"></i> Co-signer Details ({selectedApp.cosigner.relationship})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          <DataRow label="Co-signer Name" value={selectedApp.cosigner.name} />
                          <DataRow label="Phone" value={selectedApp.cosigner.phone} />
                          <DataRow 
                            label="SSN" 
                            value={revealedFields[selectedApp.id] ? selectedApp.cosigner.ssn : maskSSN(selectedApp.cosigner.ssn)} 
                            masked={!revealedFields[selectedApp.id]}
                          />
                          <DataRow label="Monthly Income" value={`$${selectedApp.cosigner.monthlyIncome}`} />
                          <DataRow label="Employer" value={selectedApp.cosigner.employerName} colSpan={2} />
                          {selectedApp.cosigner.signature && (
                            <div className="md:col-span-2 pt-4 border-t border-blue-100">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Co-signer Signature</p>
                              <img src={selectedApp.cosigner.signature} alt="Co-signer Signature" className="h-16 mix-blend-multiply" />
                            </div>
                          )}
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
                                  {doc.owner} — {doc.category.replace('_', ' ')}
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
        <div className="hidden print:block print:bg-white print:text-black print:m-0 print:absolute print:inset-0 print-application-block">
          <div className="print-fit-one-page border-2 border-black p-4 max-w-[8.5in] mx-auto bg-white text-black text-[11px]">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-none">Heritage Housing</h1>
                <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Official Credit Application Report</p>
              </div>
              <div className="text-right text-[10px]">
                <p className="font-bold uppercase">Application ID</p>
                <p className="text-lg font-black">{selectedApp.id}</p>
                <p className="font-medium">{new Date(selectedApp.submittedAt).toLocaleDateString()} {new Date(selectedApp.submittedAt).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex border border-black mb-3">
              <div className="flex-1 py-2 border-r border-black text-center">
                <p className="text-[8px] font-bold uppercase">Score</p>
                <p className="text-2xl font-black leading-none">{selectedApp.applicant.internalScore}</p>
              </div>
              <div className="flex-1 py-2 border-r border-black text-center">
                <p className="text-[8px] font-bold uppercase">Monthly Income</p>
                <p className="text-lg font-black leading-none">${selectedApp.applicant.monthlyIncome}</p>
              </div>
              <div className="flex-1 py-2 text-center">
                <p className="text-[8px] font-bold uppercase">Down Payment</p>
                <p className="text-lg font-black leading-none">${selectedApp.applicant.downPayment}</p>
              </div>
            </div>

            <div className="mb-3">
              <h2 className="bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase inline-block mb-2">I. Applicant</h2>
              <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-[10px]">
                <PrintField label="Name" value={selectedApp.applicant.name} />
                <PrintField label="SSN" value={selectedApp.applicant.ssn} />
                <PrintField label="Phone" value={selectedApp.applicant.phone} />
                <PrintField label="DOB" value={selectedApp.applicant.dob} />
                <PrintField label="Email" value={selectedApp.applicant.email} colSpan={2} />
                <PrintField label="Address" value={selectedApp.applicant.currentAddress} colSpan={2} />
                <PrintField label="Employer" value={selectedApp.applicant.employerName} />
                <PrintField label="Job Title" value={selectedApp.applicant.jobTitle} />
              </div>
            </div>

            {selectedApp.cosigner ? (
              <div className="mb-3">
                <h2 className="bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase inline-block mb-2">II. Co-signer ({selectedApp.cosigner.relationship})</h2>
                <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-[10px]">
                  <PrintField label="Name" value={selectedApp.cosigner.name} />
                  <PrintField label="SSN" value={selectedApp.cosigner.ssn} />
                  <PrintField label="Phone" value={selectedApp.cosigner.phone} />
                  <PrintField label="Income" value={`$${selectedApp.cosigner.monthlyIncome}`} />
                  <PrintField label="Employer" value={selectedApp.cosigner.employerName} colSpan={2} />
                </div>
              </div>
            ) : (
              <div className="mb-3 border border-dashed border-black py-1.5 text-center text-[9px] font-bold uppercase">No Co-signer</div>
            )}

            <div className="mb-3">
              <h2 className="bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase inline-block mb-2">III. Property</h2>
              <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-[10px]">
                <PrintField label="Bedrooms" value={selectedApp.applicant.bedrooms} />
                <PrintField label="Land" value={selectedApp.applicant.landStatus} />
                <PrintField label="Utilities" value={selectedApp.applicant.utilities} />
                <PrintField label="Credit Est." value={selectedApp.applicant.creditEstimate} />
              </div>
            </div>

            <div className="mb-3">
              <h2 className="bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase inline-block mb-2">IV. Documents</h2>
              <div className="flex flex-wrap gap-1">
                {selectedApp.documents.map(d => (
                  <span key={d.id} className="border border-black px-2 py-0.5 text-[8px] font-bold uppercase">{d.name}</span>
                ))}
              </div>
            </div>

            <div className="border-t border-black pt-3">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="border-b border-black min-h-[36px] flex items-end justify-center pb-0.5">
                    {selectedApp.applicant.signature && <img src={selectedApp.applicant.signature} alt="Applicant" className="h-8 mix-blend-multiply" />}
                  </div>
                  <p className="text-[8px] font-bold uppercase">Applicant: {selectedApp.applicant.name}</p>
                </div>
                {selectedApp.cosigner && (
                  <div>
                    <div className="border-b border-black min-h-[36px] flex items-end justify-center pb-0.5">
                      {selectedApp.cosigner.signature && <img src={selectedApp.cosigner.signature} alt="Co-signer" className="h-8 mix-blend-multiply" />}
                    </div>
                    <p className="text-[8px] font-bold uppercase">Co-signer: {selectedApp.cosigner.name}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="border-b border-black h-8" />
                  <p className="text-[8px] font-bold uppercase mt-0.5">Salesperson</p>
                </div>
                <div className="flex-1">
                  <div className="border-b border-black h-8" />
                  <p className="text-[8px] font-bold uppercase mt-0.5">Management</p>
                </div>
              </div>
              <p className="text-[7px] text-slate-500 mt-2 italic text-center">Internal use only. Final approval subject to verification.</p>
            </div>
          </div>
        </div>
      )}

      {selectedApp?.earnestDeposit && (
        <div className="hidden print-deposit-forms-block print:bg-white print:text-black print:p-6 print:m-0 print:absolute print:inset-0" aria-hidden="true">
          <DepositFormsPrintView data={selectedApp.earnestDeposit} />
        </div>
      )}
    </div>
  );
};

const DataRow = ({ label, value, masked = false, colSpan = 1 }: { label: string, value: string, masked?: boolean, colSpan?: number }) => (
  <div className={`space-y-1 min-w-0 ${colSpan > 1 ? 'md:col-span-2' : ''}`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm font-bold text-slate-900 border-b border-slate-50 pb-1 break-words ${masked ? 'blur-[4px] select-none opacity-50' : ''}`}>
      {value || 'Not Provided'}
    </p>
  </div>
);

const PrintField = ({ label, value, colSpan = 1 }: { label: string, value: string, colSpan?: number }) => (
  <div className={colSpan > 1 ? 'col-span-2' : ''}>
    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-0.5">{label}</p>
    <p className="text-[10px] font-bold text-black border-b border-slate-300 pb-0.5 leading-tight">{value || 'N/A'}</p>
  </div>
);

const HERITAGE_NAME = 'Heritage Housing';
const HERITAGE_ADDRESS = '6220 S. Shields Blvd. · Oklahoma City, OK 73149';
const HERITAGE_PHONE = '405-601-5650';

/** Form-style field: small label above, value on underlined line (like pre-printed forms). Uses deposit-form-* classes for print CSS. */
const FormField = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-black min-h-[1.6rem]">
    <p className="deposit-form-field-label text-[9px] font-semibold text-black uppercase tracking-wide mb-0.5">{label}</p>
    <p className="deposit-form-field-value text-[13px] font-medium text-black min-h-[1.1rem] leading-tight pb-0.5" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{value || '\u00A0'}</p>
  </div>
);

/** Same as FormField but for signature block (larger line). Uses deposit-form-* for print. */
const FormSignature = ({ label, signatureImg }: { label: string; signatureImg?: string }) => (
  <div className="deposit-form-signature-line border-b border-black min-h-[2.25rem] flex flex-col justify-end">
    <p className="deposit-form-field-label text-[9px] font-semibold text-black uppercase tracking-wide mb-0.5">{label}</p>
    <div className="min-h-[1.75rem] flex items-end pb-0.5">
      {signatureImg ? <img src={signatureImg} alt="" className="max-h-8 object-contain object-left" /> : '\u00A0'}
    </div>
  </div>
);

const DepositFormsPrintView: React.FC<{ data: EarnestDepositData }> = ({ data }) => {
  const cc = data.creditCardAuth;
  const dr = data.depositReceipt;
  const cardDisplay = cc.cardNumber ? `**** **** **** ${cc.cardNumber.slice(-4)}` : (cc as { cardLast4?: string }).cardLast4 ? `**** ${(cc as { cardLast4: string }).cardLast4}` : '—';

  const formStyle = { fontFamily: 'Georgia, "Times New Roman", serif' };

  return (
    <div className="deposit-form-sheet max-w-[8.5in] mx-auto bg-white text-black p-0 print:p-0 space-y-0" style={formStyle}>
      {/* FORM 1: Credit Card Payment Authorization — match original form layout */}
      <article className="deposit-form-article break-inside-avoid border-2 border-black overflow-hidden bg-white" style={formStyle}>
        <header className="deposit-form-header text-center border-b-2 border-black py-3 px-6">
          <h1 className="text-lg font-bold tracking-tight text-black" style={formStyle}>{HERITAGE_NAME}</h1>
          <p className="text-[11px] text-black mt-0.5">{HERITAGE_ADDRESS}</p>
          <p className="text-[11px] font-semibold">Tel: {HERITAGE_PHONE}</p>
        </header>
        <div className="deposit-form-body px-6 py-4">
          <h2 className="deposit-form-title text-base font-bold uppercase tracking-wide text-center border-b-2 border-black pb-1.5 mb-3">Credit Card Payment Authorization</h2>
          <div className="deposit-form-notice border-l-2 border-slate-300 pl-3 py-1 mb-4">
            <p className="text-[11px] leading-relaxed text-black">
              I authorize Heritage Housing to charge the amount indicated below to the card provided. This authorization is for an earnest deposit and will be processed per our agreement. Nothing will be charged without further authorization for the actual transaction.
            </p>
          </div>
          <table className="deposit-form-table w-full text-left border-collapse" style={{ fontSize: '13px' }}>
            <tbody>
              <tr>
                <td className="py-1.5 pr-6 align-top w-1/2"><FormField label="Name on card" value={cc.nameOnCard || ''} /></td>
                <td className="py-1.5 align-top"><FormField label="Card number (last 4)" value={cardDisplay} /></td>
              </tr>
              <tr>
                <td className="py-1.5 pr-6 align-top"><FormField label="Expiration (MM/YY)" value={cc.expDate || ''} /></td>
                <td className="py-1.5 align-top"><FormField label="Amount authorized ($)" value={cc.amountAuthorized || ''} /></td>
              </tr>
              <tr>
                <td colSpan={2} className="py-1.5 align-top"><FormField label="Billing address" value={cc.billingAddress || ''} /></td>
              </tr>
              <tr>
                <td className="py-1.5 pr-6 align-top"><FormField label="Date" value={cc.date || ''} /></td>
                <td className="py-1.5 align-top"><FormSignature label="Customer signature" signatureImg={cc.signature} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* FORM 2: Deposit Receipt — match original form layout */}
      <article className="deposit-form-article break-inside-avoid border-2 border-black overflow-hidden bg-white mt-8" style={formStyle}>
        <header className="deposit-form-header text-center border-b-2 border-black py-3 px-6">
          <h1 className="text-lg font-bold tracking-tight text-black" style={formStyle}>{HERITAGE_NAME}</h1>
          <p className="text-[11px] text-black mt-0.5">{HERITAGE_ADDRESS}</p>
          <p className="text-[11px] font-semibold">Tel: {HERITAGE_PHONE}</p>
        </header>
        <div className="deposit-form-body px-6 py-4">
          <h2 className="deposit-form-title text-base font-bold uppercase tracking-wide text-center border-b-2 border-black pb-1.5 mb-3">Deposit Receipt</h2>
          <div className="deposit-form-notice-box border border-slate-400 bg-slate-50/80 px-3 py-2 mb-4">
            <p className="text-[10px] leading-snug text-black italic" style={formStyle}>
              You have the right to demand a refund of the deposit or down payment, and receive that refund within 15 days thereafter, if you timely and properly rescind the sales purchase contract. A retailer may keep up to 5% of the estimated cash price under certain conditions.
            </p>
          </div>
          <table className="deposit-form-table w-full text-left border-collapse" style={{ fontSize: '13px' }}>
            <tbody>
              <tr>
                <td className="py-1.5 pr-6 align-top w-1/2"><FormField label="Date" value={dr.date || ''} /></td>
                <td className="py-1.5 align-top"><FormField label="Customer name" value={dr.customer || ''} /></td>
              </tr>
              <tr>
                <td colSpan={2} className="py-1.5 align-top"><FormField label="Address" value={dr.address || ''} /></td>
              </tr>
              <tr>
                <td className="py-1.5 pr-6 align-top"><FormField label="Phone" value={dr.phone || ''} /></td>
                <td className="py-1.5 pr-6 align-top"><FormField label="Model #" value={dr.modelNumber || ''} /></td>
              </tr>
              <tr>
                <td className="py-1.5 pr-6 align-top"><FormField label="Serial #" value={dr.serialNumber || ''} /></td>
                <td className="py-1.5 align-top"><FormField label="Amount ($)" value={dr.amount || ''} /></td>
              </tr>
              <tr>
                <td className="py-3 pr-6 align-bottom w-1/2">
                  <FormSignature label="Customer signature" signatureImg={dr.customerSignature} />
                </td>
                <td className="py-3 align-bottom">
                  <FormSignature label="Heritage Housing (in person)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
};

export default Dashboard;
