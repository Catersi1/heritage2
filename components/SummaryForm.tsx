
import React, { useRef, useState } from 'react';
import { ApplicationData, CoSignerData, CustomizationData, Language } from '../types';
import { t } from '../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  applicant: ApplicationData;
  cosigner?: CoSignerData;
  customization?: CustomizationData;
  language: Language;
  onConfirm: () => void;
  onBack: () => void;
}

const SummaryForm: React.FC<Props> = ({ applicant, cosigner, customization, language, onConfirm, onBack }) => {
  const strings = t(language);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!summaryRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Heritage_Housing_Application_${applicant?.name || 'Summary'}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(language === 'English' ? 'Failed to generate PDF. Please use the Print button instead.' : 'Error al generar PDF. Por favor use el botón de Imprimir.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (e) {
      console.error("Submission failed:", e);
      alert(language === 'English' ? "Submission failed. Please try again." : "El envío falló. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSignature = (sig?: string) => {
    if (!sig) return <span className="text-slate-400 italic">No signature</span>;
    if (sig.includes('|')) {
      const [name, fontClass] = sig.split('|');
      return <span className={`text-2xl ${fontClass} text-blue-900`}>{name}</span>;
    }
    return <img src={sig} alt="Signature" className="h-12 inline-block" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div ref={summaryRef} className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center print:bg-white print:text-black print:border-b-4 print:border-black">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Application Summary</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest print:text-slate-600">Heritage Housing Official Record</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50"
            >
              <i className={`fa-solid ${isGeneratingPDF ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-red-400`}></i> 
              {isGeneratingPDF ? '...' : 'PDF'}
            </button>
            <button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <i className="fa-solid fa-print"></i> PRINT
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 md:space-y-10">
          {/* Earnest Deposit Explanation */}
          <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-[2rem] flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <i className="fa-solid fa-star text-xl"></i>
            </div>
            <div>
              <h4 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-1">
                {language === 'English' ? 'Priority Processing' : 'Procesamiento Prioritario'}
              </h4>
              <p className="text-blue-800 text-sm font-medium leading-relaxed">
                {language === 'English' 
                  ? "The following forms are for your earnest deposit. You will NOT be charged anything today. This is simply a way for us to gauge how serious you are about your new home, which places your application at the top of our priority list."
                  : "Los siguientes formularios son para su depósito de garantía. NO se le cobrará nada hoy. Esta es simplemente una forma de medir qué tan serio es usted acerca de su nueva casa, lo que coloca su solicitud al principio de nuestra lista de prioridades."}
              </p>
            </div>
          </div>

          {/* Section 1: Applicant Information */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">I. Applicant Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Name</p>
                  <p className="font-black text-slate-900">{applicant?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Phone</p>
                  <p className="font-black text-slate-900">{applicant?.phone || 'No phone'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Current Address</p>
                  <p className="font-bold text-slate-700 text-sm">
                    {applicant?.currentAddress || 'No address provided'}
                    {applicant?.city && applicant?.state ? `, ${applicant.city}, ${applicant.state}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Customization & Costs */}
          {customization && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">II. Home Customization & Estimates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Home Type</p>
                  <p className="font-black text-slate-900">{customization.homeType}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Quality</p>
                  <p className="font-black text-slate-900">{customization.isIdeal ? 'Premium' : 'Value'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 md:col-span-2">
                  <p className="text-[9px] font-bold text-green-600 uppercase">Estimated Total</p>
                  <p className="text-2xl font-black text-green-700">${customization.estimatedTotal.toLocaleString()}</p>
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Financials */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">III. Financial Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Monthly Income</p>
                <p className="font-black text-slate-900">${applicant?.monthlyIncome || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Down Payment</p>
                <p className="font-black text-slate-900">${applicant?.downPayment || 0}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Credit Est.</p>
                <p className="font-black text-slate-900">{applicant?.creditEstimate || 'N/A'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Co-signer</p>
                <p className="font-black text-slate-900">{cosigner ? 'YES' : 'NO'}</p>
              </div>
            </div>
          </section>

          {/* Section 4: Appointment & Preferences */}
          {applicant?.wantAppointment && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">IV. Appointment Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Preferred Contact</p>
                  <p className="font-black text-blue-900">{applicant?.preferredContact || 'Phone'}</p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Best Time</p>
                  <p className="font-black text-blue-900">{applicant?.bestTimeToCall || 'Morning'}</p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Home Interest</p>
                  <p className="font-black text-blue-900">{applicant?.homeTypeInterest || 'Any'}</p>
                </div>
                <div className="col-span-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Details / Message</p>
                  <p className="text-sm font-medium text-slate-700 italic">"{applicant?.appointmentDetails || 'No specific details provided'}"</p>
                </div>
              </div>
            </section>
          )}

          {/* Section 5: Signatures */}
          <section className="pt-8 border-t-2 border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applicant Signature</p>
                <div className="border-b-2 border-slate-900 pb-2 min-h-[40px]">
                  {renderSignature(applicant?.signature)}
                </div>
                <p className="text-[10px] font-bold text-slate-500">{applicant?.name || 'Unknown'}</p>
              </div>
              {cosigner && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Co-signer Signature</p>
                  <div className="border-b-2 border-slate-900 pb-2 min-h-[40px]">
                    {renderSignature(cosigner.signature)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">{cosigner.name}</p>
                </div>
              )}
            </div>
          </section>

          <p className="text-[8px] text-slate-400 italic text-center pt-8">
            This summary is for internal sales use only. All figures are estimates based on provided data.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 print:hidden">
        <button 
          onClick={onBack}
          className="w-full sm:w-auto text-slate-400 hover:text-slate-600 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Documents
        </button>
        <button 
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-base md:text-lg transition-all shadow-2xl transform flex items-center justify-center gap-3 ${
            isSubmitting 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-slate-900 hover:bg-black text-white shadow-slate-200 hover:-translate-y-1 active:scale-95'
          }`}
        >
          {isSubmitting ? (language === 'English' ? 'PROCESSING...' : 'PROCESANDO...') : 'CONTINUE TO FINAL FORMS'} 
          {isSubmitting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-arrow-right"></i>}
        </button>
      </div>
    </div>
  );
};

export default SummaryForm;
