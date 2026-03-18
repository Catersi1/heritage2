
import React, { useState, useEffect } from 'react';
import { AppStep, ApplicationData, CoSignerData, DocumentFile, LeadApplication, Language, CustomizationData, AppointmentOnlyData, DepositReceiptData, PaymentAuthData } from './types';
import LandingPage from './components/LandingPage';
import UnifiedApplicationForm from './components/UnifiedApplicationForm';
import CoSignerForm from './components/CoSignerForm';
import DocumentUpload from './components/DocumentUpload';
import Dashboard from './components/Dashboard';
import SuccessScreen from './components/SuccessScreen';
import ProcessExplanation from './components/ProcessExplanation';
import HomeCustomizer from './components/HomeCustomizer';
import AppointmentOnlyForm from './components/AppointmentOnlyForm';
import SummaryForm from './components/SummaryForm';
import DepositReceiptForm from './components/DepositReceiptForm';
import PaymentAuthForm from './components/PaymentAuthForm';
import CreditBuilding from './components/CreditBuilding';
import Toast from './components/Toast';
import { storageService } from './services/storageService';
import { t } from './constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('LANDING');
  const [language, setLanguage] = useState<Language>('English');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicantData, setApplicantData] = useState<ApplicationData | undefined>();
  const [cosignerData, setCosignerData] = useState<CoSignerData | undefined>();
  const [customizationData, setCustomizationData] = useState<CustomizationData | undefined>();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [depositReceipt, setDepositReceipt] = useState<DepositReceiptData | undefined>();
  const [paymentAuth, setPaymentAuth] = useState<PaymentAuthData | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const strings = t(language);

  // Listen for hash changes to allow deep linking and back-button support
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentStep('ADMIN_DASHBOARD');
      } else if (currentStep === 'ADMIN_DASHBOARD') {
        setCurrentStep('LANDING');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentStep]);

  const handleMainAppSubmit = async (data: ApplicationData) => {
    setApplicantData(data);
    showToast(language === 'English' ? 'Saving applicant data...' : 'Guardando datos del solicitante...', 'info');
    
    // Generate or use existing ID
    const id = applicationId || `APP-${Date.now()}`;
    if (!applicationId) setApplicationId(id);

    // Interim save as a lead
    const interimApp: LeadApplication = {
      id: id,
      status: 'Pending',
      applicant: data,
      documents: [],
      submittedAt: new Date().toISOString(),
      type: 'CREDIT_APP',
      isComplete: false
    };
    
    await storageService.saveApplication(interimApp);
    showToast(language === 'English' ? 'Applicant data saved and uploaded' : 'Datos del solicitante guardados y cargados');

    if (data.hasCoSigner) {
      setCurrentStep('CO_SIGNER');
    } else {
      setCurrentStep('CUSTOMIZER');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCoSignerSubmit = async (data: CoSignerData) => {
    setCosignerData(data);
    showToast(language === 'English' ? 'Saving co-signer data...' : 'Guardando datos del cofirmante...', 'info');
    
    // Update interim save with cosigner data
    if (applicantData && applicationId) {
      const updatedApp: LeadApplication = {
        id: applicationId,
        status: 'Pending',
        applicant: applicantData,
        cosigner: data,
        documents: documents,
        submittedAt: new Date().toISOString(),
        type: 'CREDIT_APP',
        isComplete: false
      };
      await storageService.saveApplication(updatedApp);
      showToast(language === 'English' ? 'Co-signer data saved and uploaded' : 'Datos del cofirmante guardados y cargados');
    }

    setCurrentStep('CUSTOMIZER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomizerSubmit = async (data: CustomizationData) => {
    setCustomizationData(data);
    showToast(language === 'English' ? 'Saving customization...' : 'Guardando personalización...', 'info');

    // Update interim save with customization
    if (applicantData && applicationId) {
      const updatedApp: LeadApplication = {
        id: applicationId,
        status: 'Pending',
        applicant: {
          ...applicantData,
          customization: data
        },
        cosigner: cosignerData,
        documents: documents,
        submittedAt: new Date().toISOString(),
        type: 'CREDIT_APP',
        isComplete: false
      };
      await storageService.saveApplication(updatedApp);
      showToast(language === 'English' ? 'Home customization saved and uploaded' : 'Personalización de la casa guardada y cargada');
    }

    setCurrentStep('DOCUMENTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePartialDocumentUpdate = async (docs: DocumentFile[]) => {
    setDocuments(docs);
    
    if (applicantData && applicationId) {
      const updatedApp: LeadApplication = {
        id: applicationId,
        status: 'Pending',
        applicant: {
          ...applicantData,
          customization: customizationData
        },
        cosigner: cosignerData,
        documents: docs,
        submittedAt: new Date().toISOString(),
        type: 'CREDIT_APP',
        isComplete: false
      };
      await storageService.saveApplication(updatedApp);
      // No toast for every single file to avoid spam, but data is safe
    }
  };

  const handleDocumentSubmit = async (docs: DocumentFile[]) => {
    setDocuments(docs);
    showToast(language === 'English' ? 'Documents saved and uploaded' : 'Documentos guardados y cargados');
    setCurrentStep('SUMMARY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSummaryConfirm = () => {
    setCurrentStep('DEPOSIT_RECEIPT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDepositReceiptSubmit = async (data: DepositReceiptData) => {
    setDepositReceipt(data);
    showToast(language === 'English' ? 'Deposit receipt saved' : 'Recibo de depósito guardado');
    
    // Update interim save
    if (applicationId && applicantData) {
      const updatedApp: LeadApplication = {
        id: applicationId,
        status: 'Pending',
        applicant: applicantData,
        cosigner: cosignerData,
        documents: documents,
        depositReceipt: data,
        submittedAt: new Date().toISOString(),
        type: 'CREDIT_APP',
        isComplete: false
      };
      await storageService.saveApplication(updatedApp);
    }

    setCurrentStep('PAYMENT_AUTH');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentAuthSubmit = async (data: PaymentAuthData) => {
    setPaymentAuth(data);
    await handleFinalSubmit(data);
  };

  const handleFinalSubmit = async (finalPaymentAuth?: PaymentAuthData) => {
    if (!applicantData || !applicationId) {
      console.error("Missing application data:", { applicantData, applicationId });
      alert(language === 'English' 
        ? "Error: Application data is missing. Please try starting over." 
        : "Error: Faltan datos de la solicitud. Por favor, intente comenzar de nuevo.");
      return;
    }

    try {
      const newApp: LeadApplication = {
        id: applicationId,
        status: 'Pending',
        applicant: {
          ...applicantData,
          customization: customizationData
        },
        cosigner: cosignerData,
        documents: documents,
        depositReceipt: depositReceipt,
        paymentAuth: finalPaymentAuth || paymentAuth,
        submittedAt: new Date().toISOString(),
        type: 'CREDIT_APP',
        isComplete: true
      };

      await storageService.saveApplication(newApp);
      showToast(language === 'English' ? 'Final application submitted successfully' : 'Solicitud final enviada con éxito');
      setCurrentStep('SUCCESS');
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Final submission error:", error);
      
      let errorMsg = language === 'English'
        ? "Failed to submit application. Please check your connection and try again."
        : "Error al enviar la solicitud. Por favor, compruebe su conexión e inténtelo de nuevo.";
        
      if (error.message === 'STORAGE_FULL') {
        errorMsg = language === 'English'
          ? "The application is too large to save locally (likely due to high-resolution photos). Please try uploading smaller files or contact support."
          : "La solicitud es demasiado grande para guardarla localmente (probablemente debido a fotos de alta resolución). Intente subir archivos más pequeños o contacte al soporte.";
      }
      
      alert(errorMsg);
    }
  };

  const handleAppointmentOnlySubmit = async (data: AppointmentOnlyData) => {
    const newApp: LeadApplication = {
      id: `APT-${Date.now()}`,
      status: 'Pending',
      applicant: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        monthlyIncome: data.monthlyIncome.toString(),
        employmentStatus: data.employmentStatus,
        bedrooms: data.bedroomsNeeded,
        utilities: data.utilitiesAtSite,
        creditEstimate: data.creditScoreEstimate,
        landStatus: data.hasLand,
        landLocation: data.landLocation,
        repoHistory: data.repoHistory7Years,
        appointmentDetails: data.notes,
        wantAppointment: true,
        preferredContact: 'Phone', // Default or could be added to form if needed
        bestTimeToCall: 'Morning', // Default or could be added to form if needed
        homeTypeInterest: 'Any', // Default or could be added to form if needed
        language: language,
        date: data.preferredDate || data.submittedAt,
        ssn: '', dob: '', currentAddress: '', yearsAtAddress: '', employerName: '', jobTitle: '', employerPhone: '', yearsEmployed: '', targetPayment: '', downPayment: '', downPaymentSource: '', hasCoSigner: false, internalScore: 0
      } as ApplicationData,
      documents: [],
      submittedAt: data.submittedAt,
      type: 'APPOINTMENT_ONLY',
      isComplete: true
    };

    await storageService.saveApplication(newApp);
    showToast(language === 'English' ? 'Appointment request saved and uploaded' : 'Solicitud de cita guardada y cargada');
    
    setCurrentStep('SUCCESS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToAdmin = () => {
    window.location.hash = 'admin';
    setCurrentStep('ADMIN_DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    returnToPublic();
  };

  const returnToPublic = () => {
    // Reset all state for next application
    setApplicationId(null);
    setApplicantData(undefined);
    setCosignerData(undefined);
    setCustomizationData(undefined);
    setDocuments([]);
    setDepositReceipt(undefined);
    setPaymentAuth(undefined);

    window.location.hash = '';
    setCurrentStep('LANDING');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SkipButton = ({ to }: { to: AppStep }) => (
    <div className="max-w-4xl mx-auto px-4 mt-8 mb-12 text-center">
      <button 
        onClick={() => {
          setCurrentStep(to);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="text-slate-400 hover:text-blue-600 font-bold transition-all text-sm flex items-center justify-center gap-2 mx-auto group"
      >
        <span>{language === 'English' ? 'Preview next step (see what info is needed)' : 'Vista previa del siguiente paso (ver qué información se necesita)'}</span>
        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
      </button>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'LANDING':
        return (
          <>
            <LandingPage 
              language={language} 
              setLanguage={setLanguage} 
              onStart={() => setCurrentStep('PROCESS')} 
              onCustomizer={() => setCurrentStep('CUSTOMIZER')}
              onAppointment={() => setCurrentStep('APPOINTMENT_ONLY')}
              onCreditBuilding={() => setCurrentStep('CREDIT_BUILDING')}
            />
            <SkipButton to="PROCESS" />
          </>
        );
      case 'PROCESS':
        return (
          <>
            <ProcessExplanation 
              language={language} 
              onBack={() => setCurrentStep('LANDING')} 
              onContinue={() => setCurrentStep('APPLICATION')} 
            />
            <SkipButton to="APPLICATION" />
          </>
        );
      case 'APPLICATION':
        return (
          <>
            <UnifiedApplicationForm 
              language={language}
              onBack={() => setCurrentStep('PROCESS')}
              onSubmit={handleMainAppSubmit} 
              initialData={applicantData} 
            />
            <SkipButton to="CO_SIGNER" />
          </>
        );
      case 'CO_SIGNER':
        return (
          <>
            <CoSignerForm 
              language={language}
              onBack={() => setCurrentStep('APPLICATION')} 
              onSubmit={handleCoSignerSubmit} 
              initialData={cosignerData}
            />
            <SkipButton to="CUSTOMIZER" />
          </>
        );
      case 'CUSTOMIZER':
        return (
          <>
            <HomeCustomizer 
              language={language}
              applicantData={applicantData}
              initialData={customizationData}
              onBack={() => applicantData ? (applicantData.hasCoSigner ? setCurrentStep('CO_SIGNER') : setCurrentStep('APPLICATION')) : setCurrentStep('LANDING')}
              onSubmit={handleCustomizerSubmit}
              onGoToAppointment={() => setCurrentStep('APPOINTMENT_ONLY')}
            />
            <SkipButton to="DOCUMENTS" />
          </>
        );
      case 'DOCUMENTS':
        return (
          <>
            <DocumentUpload 
              language={language}
              onBack={() => setCurrentStep('CUSTOMIZER')} 
              onSubmit={handleDocumentSubmit}
              onPartialUpdate={handlePartialDocumentUpdate}
              hasCosigner={!!applicantData?.hasCoSigner}
              initialDocs={documents}
            />
            <SkipButton to="SUMMARY" />
          </>
        );
      case 'SUMMARY':
        return (
          <>
            <SummaryForm 
              applicant={applicantData || {} as any}
              cosigner={cosignerData}
              customization={customizationData}
              language={language}
              onConfirm={handleSummaryConfirm}
              onBack={() => setCurrentStep('DOCUMENTS')}
            />
            <SkipButton to="DEPOSIT_RECEIPT" />
          </>
        );
      case 'DEPOSIT_RECEIPT':
        return (
          <>
            <DepositReceiptForm 
              applicant={applicantData || {} as any}
              language={language}
              onSubmit={handleDepositReceiptSubmit}
              onBack={() => setCurrentStep('SUMMARY')}
            />
            <SkipButton to="PAYMENT_AUTH" />
          </>
        );
      case 'PAYMENT_AUTH':
        return (
          <>
            <PaymentAuthForm 
              applicant={applicantData || {} as any}
              language={language}
              onSubmit={handlePaymentAuthSubmit}
              onBack={() => setCurrentStep('DEPOSIT_RECEIPT')}
            />
            <SkipButton to="SUCCESS" />
          </>
        );
      case 'APPOINTMENT_ONLY':
        return (
          <>
            <AppointmentOnlyForm 
              language={language}
              onBack={() => setCurrentStep('LANDING')}
              onSubmit={handleAppointmentOnlySubmit}
            />
            <SkipButton to="SUCCESS" />
          </>
        );
      case 'CREDIT_BUILDING':
        return (
          <CreditBuilding 
            language={language}
            onBack={() => setCurrentStep('LANDING')}
            onStartApp={() => setCurrentStep('PROCESS')}
          />
        );
      case 'SUCCESS':
        return <SuccessScreen language={language} applicant={applicantData} onRestart={() => returnToPublic()} />;
      case 'ADMIN_DASHBOARD':
        return <Dashboard onLogout={handleLogout} onExit={returnToPublic} showToast={showToast} />;
      default:
        return <LandingPage language={language} setLanguage={setLanguage} onStart={() => setCurrentStep('PROCESS')} onCustomizer={() => setCurrentStep('CUSTOMIZER')} onAppointment={() => setCurrentStep('APPOINTMENT_ONLY')} onCreditBuilding={() => setCurrentStep('CREDIT_BUILDING')} />;
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => returnToPublic()}
          >
            <div className="bg-white p-1.5 rounded-lg">
              <img src="https://cdn-icons-png.flaticon.com/512/25/25694.png" className="w-8 h-8" alt="Logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Heritage Housing</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{strings.securePortal}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {storageService.isCloudEnabled() ? (
               <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Cloud Sync Active</span>
               </div>
             ) : (
               <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                 <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                 <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Local Only</span>
               </div>
             )}
             
             {currentStep === 'ADMIN_DASHBOARD' && (
                <button 
                  onClick={returnToPublic}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-900/20"
                >
                  <i className="fa-solid fa-house"></i>
                  <span>EXIT TO WEBSITE</span>
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {renderStep()}
      </main>

      <footer className="mt-20 border-t border-slate-200 py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Contact Sales</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <i className="fa-solid fa-phone text-sm"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Miza</p>
                    <p className="font-bold text-sm">701-441-1388</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <i className="fa-solid fa-phone text-sm"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Eva</p>
                    <p className="font-bold text-sm">405-268-2502</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-widest">Heritage Housing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Expert guidance for mobile home buyers. Secured with end-to-end encryption for your peace of mind.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Staff Access</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={goToAdmin}
                    className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-shield-halved"></i> Employee Dashboard Login
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
               © 2024 Heritage Housing Mobile Homes
             </p>
          </div>
        </div>
      </footer>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;
