import React, { useState, useEffect } from 'react';
import { AppStep, ApplicationData, CoSignerData, DocumentFile, EarnestDepositData, LeadApplication, Language } from './types';
import LandingPage from './components/LandingPage';
import FinancingInfoPage from './components/FinancingInfoPage';
import UnifiedApplicationForm from './components/UnifiedApplicationForm';
import EarnestDepositForm from './components/EarnestDepositForm';
import CoSignerForm from './components/CoSignerForm';
import DocumentUpload from './components/DocumentUpload';
import Dashboard from './components/Dashboard';
import SuccessScreen from './components/SuccessScreen';
import AppointmentOnlyForm from './components/AppointmentOnlyForm';
import { storageService } from './services/storageService';
import { generateApplicationPDF } from './utils/pdfGenerator';
import { t } from './constants';

const DRAFT_ID_KEY = 'heritage_draft_application_id';

function sendConfirmationEmail(email: string, name: string): void {
  if (!email || !name) return;
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  fetch(`${base}/api/sendConfirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  }).catch(() => {});
}

/** Send appointment reminder SMS when customer sets an appointment (requires Twilio env in API). */
function sendAppointmentReminderSms(phone: string, name: string, appointmentDate: string): void {
  if (!phone || !appointmentDate) return;
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  fetch(`${base}/api/sendAppointmentReminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name, appointmentDate })
  }).catch(() => {});
}

/** Register appointment for 1-day and 2-day reminder SMS (requires Upstash Redis + cron). */
function registerAppointmentForReminders(phone: string, name: string, appointmentDate: string, applicationId: string): void {
  if (!phone || !appointmentDate || !applicationId) return;
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  fetch(`${base}/api/registerAppointmentReminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name, appointmentDate, applicationId })
  }).catch(() => {});
}

/** Send application via email using Resend with PDF */
async function sendApplicationEmail(application: LeadApplication, customSubject?: string): Promise<boolean> {
  console.log('[sendApplicationEmail] Starting...', customSubject);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  
  try {
    // Generate PDF
    console.log('[sendApplicationEmail] Generating PDF...');
    const pdfBlob = generateApplicationPDF(application);
    const pdfBase64 = await blobToBase64(pdfBlob);
    console.log('[sendApplicationEmail] PDF generated, size:', pdfBlob.size);
    
    const response = await fetch(`${base}/api/sendApplicationEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application: application,
        documents: application.documents || [],
        customSubject: customSubject,
        pdfBase64: pdfBase64
      })
    });
    
    console.log('[sendApplicationEmail] Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[sendApplicationEmail] Failed:', error);
      return false;
    }
    
    console.log('[sendApplicationEmail] Success!');
    return true;
  } catch (err) {
    console.error('[sendApplicationEmail] Error:', err);
    return false;
  }
}

// Helper to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:application/pdf;base64, prefix
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('LANDING');
  const [language, setLanguage] = useState<Language>('English');
  const [applicantData, setApplicantData] = useState<ApplicationData | undefined>();
  const [cosignerData, setCosignerData] = useState<CoSignerData | undefined>();
  const [earnestDepositData, setEarnestDepositData] = useState<EarnestDepositData | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [draftApplicationId, setDraftApplicationId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(DRAFT_ID_KEY);
    } catch {
      return null;
    }
  });
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const strings = t(language);

  const showSavedToast = (message: string) => {
    setSavedToast(message);
    setTimeout(() => setSavedToast(null), 4500);
  };

  // Listen for hash changes to allow deep linking and back-button support
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentStep('ADMIN_DASHBOARD');
      } else if (window.location.hash === '#appointment') {
        setCurrentStep('APPOINTMENT_ONLY');
      } else if (currentStep === 'ADMIN_DASHBOARD' || currentStep === 'APPOINTMENT_ONLY') {
        // If we were in admin/appointment and the hash is cleared, go home
        setCurrentStep('LANDING');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentStep]);

  const saveDraft = async (applicant: ApplicationData, existingDraftId?: string | null): Promise<string | null> => {
    if (existingDraftId) {
      const existing = await storageService.getApplicationById(existingDraftId);
      if (existing) {
        existing.applicant = applicant;
        existing.status = 'Pending Documents';
        existing.submittedAt = new Date().toISOString();
        await storageService.saveApplication(existing);
        try {
          sessionStorage.setItem(DRAFT_ID_KEY, existingDraftId);
        } catch (_) {}
        return existingDraftId;
      }
    }
    const draftId = `APP-${Date.now()}`;
    const draftApp: LeadApplication = {
      id: draftId,
      status: 'Pending Documents',
      applicant,
      documents: [],
      submittedAt: new Date().toISOString()
    };
    await storageService.saveApplication(draftApp);
    try {
      sessionStorage.setItem(DRAFT_ID_KEY, draftId);
    } catch (_) {}
    return draftId;
  };

  const handleMainAppSubmit = async (data: ApplicationData) => {
    setApplicantData(data);
    try {
      // Save to local storage (draft)
      const draftId = await saveDraft(data, draftApplicationId);
      setDraftApplicationId(draftId);
      
      // EMAIL STEP 1: Basic application info
      const draft = await storageService.getApplicationById(draftId);
      if (draft) {
        await sendApplicationEmail(draft, 'Step 1: Application Form Completed');
      }
      
      showSavedToast(strings.toastApplicationSaved);
    } catch (err) {
      console.error('Failed to save draft application', err);
      const msg = language === 'English'
        ? 'Your progress could not be saved. You can continue, but if you refresh the page your application may be lost. Try submitting the full form instead of Next step, or use a different browser.'
        : 'No se pudo guardar su progreso. Puede continuar, pero si actualiza la página, su solicitud puede perderse. Intente enviar el formulario completo en lugar de Siguiente paso, o use un navegador diferente.';
      alert(msg);
    }
    setCurrentStep('EARNEST_DEPOSIT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEarnestDepositSubmit = async (data: EarnestDepositData | null) => {
    setEarnestDepositData(data);
    if (data !== null && draftApplicationId) {
      try {
        const existing = await storageService.getApplicationById(draftApplicationId);
        if (existing) {
          existing.earnestDeposit = data;
          existing.submittedAt = new Date().toISOString();
          await storageService.saveApplication(existing);
          
          // EMAIL STEP 2: With earnest deposit
          await sendApplicationEmail(existing, 'Step 2: Earnest Deposit Added');
          
          showSavedToast(strings.toastEarnestSaved);
        }
      } catch (err) {
        console.error('Failed to save earnest deposit to draft', err);
        const msg = language === 'English'
          ? 'Deposit form could not be saved. Your application is still in progress—continue and submit at the end.'
          : 'No se pudo guardar el formulario de depósito. Su solicitud sigue en curso; continúe y envíe al final.';
        alert(msg);
      }
    } else {
      showSavedToast(strings.toastFormSaved);
    }
    if (applicantData?.hasCoSigner) {
      setCurrentStep('CO_SIGNER');
    } else {
      setCurrentStep('DOCUMENTS');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCoSignerSubmit = async (data: CoSignerData) => {
    setCosignerData(data);
    if (draftApplicationId) {
      try {
        const existing = await storageService.getApplicationById(draftApplicationId);
        if (existing) {
          existing.coSigner = data;
          existing.submittedAt = new Date().toISOString();
          await storageService.saveApplication(existing);
          showSavedToast(strings.toastFormSaved);
        }
      } catch (err) {
        console.error('Failed to save co-signer to draft', err);
      }
    }
    setCurrentStep('DOCUMENTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDocumentSubmit = async (docs: DocumentFile[], appointmentDate?: string | null) => {
    setDocuments(docs);
    if (draftApplicationId) {
      try {
        const existing = await storageService.getApplicationById(draftApplicationId);
        if (existing) {
          existing.documents = docs;
          existing.status = 'Submitted';
          existing.submittedAt = new Date().toISOString();
          if (appointmentDate) {
            existing.appointmentDate = appointmentDate;
          }
          await storageService.saveApplication(existing);
          
          // SEND EMAIL WITH APPLICATION
          const emailSent = await sendApplicationEmail(existing);
          if (emailSent) {
            showSavedToast('Application submitted and emailed successfully!');
          } else {
            showSavedToast('Application saved but email failed. Please contact us.');
          }
          
          // Send confirmation email
          if (existing.applicant?.email && existing.applicant?.firstName) {
            sendConfirmationEmail(existing.applicant.email, existing.applicant.firstName);
          }
          
          // Send appointment SMS if date is set
          if (appointmentDate && existing.applicant?.phone && existing.applicant?.firstName) {
            sendAppointmentReminderSms(
              existing.applicant.phone,
              existing.applicant.firstName,
              appointmentDate
            );
            registerAppointmentForReminders(
              existing.applicant.phone,
              existing.applicant.firstName,
              appointmentDate,
              draftApplicationId
            );
          }
        }
      } catch (err) {
        console.error('Failed to finalize application', err);
      }
    }
    setCurrentStep('SUCCESS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAppointmentOnly = async (date: string) => {
    if (draftApplicationId) {
      try {
        const existing = await storageService.getApplicationById(draftApplicationId);
        if (existing) {
          existing.appointmentDate = date;
          existing.submittedAt = new Date().toISOString();
          await storageService.saveApplication(existing);
          
          // Send appointment SMS
          if (existing.applicant?.phone && existing.applicant?.firstName) {
            sendAppointmentReminderSms(
              existing.applicant.phone,
              existing.applicant.firstName,
              date
            );
            registerAppointmentForReminders(
              existing.applicant.phone,
              existing.applicant.firstName,
              date,
              draftApplicationId
            );
          }
          
          showSavedToast(strings.toastFormSaved);
        }
      } catch (err) {
        console.error('Failed to save appointment', err);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'LANDING':
        return (
          <LandingPage
            onStart={() => setCurrentStep('FINANCING_INFO')}
            onLanguageChange={setLanguage}
            language={language}
          />
        );
      case 'FINANCING_INFO':
        return (
          <FinancingInfoPage
            onStartApplication={() => setCurrentStep('APPLICATION')}
            onBack={() => setCurrentStep('LANDING')}
            language={language}
          />
        );
      case 'APPLICATION':
        return (
          <UnifiedApplicationForm
            language={language}
            onBack={() => setCurrentStep('FINANCING_INFO')}
            onSubmit={handleMainAppSubmit}
            onNextStep={async (data) => {
              const applicant = { ...data, language, internalScore: data.internalScore ?? 0, date: data.date ?? new Date().toISOString() } as ApplicationData;
              setApplicantData(applicant);
              try {
                const draftId = await saveDraft(applicant, draftApplicationId);
                setDraftApplicationId(draftId);
                showSavedToast(strings.toastFormSaved);
              } catch (err) {
                console.error('Failed to save draft on next step', err);
                const msg = language === 'English'
                  ? 'Your progress could not be saved. You can continue, but if you refresh the page your application may be lost. Try submitting the full form instead of Next step, or use a different browser.'
                  : 'No se pudo guardar su progreso. Puede continuar, pero si actualiza la página podría perderse la solicitud. Intente enviar el formulario completo o use otro navegador.';
                alert(msg);
              }
              setCurrentStep('EARNEST_DEPOSIT');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            initialData={applicantData}
          />
        );
      case 'EARNEST_DEPOSIT':
        return (
          <EarnestDepositForm
            language={language}
            onBack={() => setCurrentStep('APPLICATION')}
            onSubmit={handleEarnestDepositSubmit}
            applicantData={applicantData}
            initialData={earnestDepositData}
          />
        );
      case 'CO_SIGNER':
        return (
          <CoSignerForm
            language={language}
            onBack={() => setCurrentStep('EARNEST_DEPOSIT')}
            onSubmit={handleCoSignerSubmit}
            onNextStep={() => setCurrentStep('DOCUMENTS')}
            initialData={cosignerData}
          />
        );
      case 'DOCUMENTS':
        return (
          <DocumentUpload
            language={language}
            onBack={() => applicantData?.hasCoSigner ? setCurrentStep('CO_SIGNER') : setCurrentStep('EARNEST_DEPOSIT')}
            onSubmit={handleDocumentSubmit}
            onSaveAppointmentOnly={handleSaveAppointmentOnly}
            hasCosigner={applicantData?.hasCoSigner ?? false}
          />
        );
      case 'SUCCESS':
        return (
          <SuccessScreen
            language={language}
            onStartOver={() => {
              setApplicantData(undefined);
              setCosignerData(undefined);
              setEarnestDepositData(null);
              setDocuments([]);
              setDraftApplicationId(null);
              try {
                sessionStorage.removeItem(DRAFT_ID_KEY);
              } catch (_) {}
              setCurrentStep('LANDING');
            }}
            applicantData={applicantData}
          />
        );
      case 'ADMIN_DASHBOARD':
        return <Dashboard language={language} onBack={() => setCurrentStep('LANDING')} />;
      case 'APPOINTMENT_ONLY':
        return (
          <AppointmentOnlyForm
            language={language}
            onBack={() => setCurrentStep('LANDING')}
            onSubmit={async (data) => {
              console.log('Appointment scheduled:', data);
              setCurrentStep('LANDING');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {savedToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {savedToast}
        </div>
      )}
      {renderStep()}
    </div>
  );
};

export default App;
