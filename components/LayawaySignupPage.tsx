import React, { useState } from 'react';
import { t } from '../constants';
import { Language, LayawayData, LeadApplication } from '../types';
import { storageService } from '../services/storageService';

const emptyApplicantFields = {
  ssn: '',
  dob: '',
  currentAddress: '',
  yearsAtAddress: '',
  employmentStatus: '',
  employerName: '',
  jobTitle: '',
  employerPhone: '',
  yearsEmployed: '',
  monthlyIncome: '' as number | '',
  language: 'English' as Language,
  wantAppointment: false,
  appointmentDetails: '',
  landStatus: '',
  landLocation: '',
  utilities: '',
  bedrooms: '',
  targetPayment: '' as number | '',
  creditEstimate: '',
  downPayment: '' as number | '',
  downPaymentSource: '',
  repoHistory: '',
  hasCoSigner: false,
  internalScore: 0,
  date: '',
};

interface Props {
  language: Language;
  onBack: () => void;
  onStartCreditApp: () => void;
}

const LayawaySignupPage: React.FC<Props> = ({ language, onBack, onStartCreditApp }) => {
  const strings = t(language);
  const [layawaySubmitted, setLayawaySubmitted] = useState(false);
  const [layawaySubmitting, setLayawaySubmitting] = useState(false);
  const [layawayForm, setLayawayForm] = useState<LayawayData>({
    fullName: '',
    email: '',
    phone: '',
    monthlyPaymentAfford: '',
    targetDownPayment: '',
    preferredContact: 'Phone',
    notes: '',
    submittedAt: '',
  });

  const handleLayawayChange = (field: keyof LayawayData, value: string | number | '') => {
    setLayawayForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLayawaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!layawayForm.fullName.trim() || !layawayForm.email.trim() || !layawayForm.phone.trim()) {
      alert(language === 'English' ? 'Please enter your name, email, and phone.' : 'Por favor ingrese nombre, correo y teléfono.');
      return;
    }
    const monthly = Number(layawayForm.monthlyPaymentAfford);
    if (!monthly || monthly <= 0) {
      alert(language === 'English' ? 'Please enter a valid monthly payment amount.' : 'Por favor ingrese un monto de pago mensual válido.');
      return;
    }
    setLayawaySubmitting(true);
    const submittedAt = new Date().toISOString();
    const layawayData: LayawayData = { ...layawayForm, submittedAt };
    const id = `LAYAWAY-${Date.now()}`;
    const applicant = {
      ...emptyApplicantFields,
      name: layawayForm.fullName.trim(),
      email: layawayForm.email.trim(),
      phone: layawayForm.phone.trim(),
      monthlyIncome: monthly,
      preferredContact: layawayForm.preferredContact,
      appointmentDetails: [
        layawayForm.notes.trim(),
        layawayForm.targetDownPayment ? `Target down payment: $${layawayForm.targetDownPayment}` : '',
      ].filter(Boolean).join(' | '),
      language,
    };
    const lead: LeadApplication = {
      id,
      status: 'Pending',
      applicant,
      documents: [],
      submittedAt,
      type: 'LAYAWAY',
      isComplete: true,
      layawayData,
    };
    try {
      const { savedToCloud, cloudError } = await storageService.saveApplication(lead);
      setLayawayForm((prev) => ({ ...prev, submittedAt }));
      setLayawaySubmitted(true);
      if (!savedToCloud && cloudError && storageService.isCloudEnabled()) {
        alert(language === 'English' ? 'Saved locally but could not sync to cloud. You may not see this in the dashboard. Error: ' + cloudError : 'Guardado localmente pero no se pudo sincronizar. Error: ' + cloudError);
      }
    } catch (err) {
      console.error(err);
      alert(language === 'English' ? 'Failed to submit. Please try again.' : 'Error al enviar. Intente de nuevo.');
    } finally {
      setLayawaySubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-6 transition-colors"
      >
        <i className="fa-solid fa-arrow-left"></i>
        {language === 'English' ? 'Back to Credit Building' : 'Volver a Construir Crédito'}
      </button>

      <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl">
            <i className="fa-solid fa-calendar-plus"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{strings.layawayTitle}</h1>
            <p className="text-slate-600 text-sm mt-0.5">{strings.layawayIntro}</p>
          </div>
        </div>

        {!layawaySubmitted ? (
          <form onSubmit={handleLayawaySubmit} className="space-y-5">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{strings.layawayFormTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{strings.layawayFullName} *</label>
                <input
                  type="text"
                  required
                  value={layawayForm.fullName}
                  onChange={(e) => handleLayawayChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  placeholder={language === 'English' ? 'John Smith' : 'Juan Pérez'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{strings.layawayEmail} *</label>
                <input
                  type="email"
                  required
                  value={layawayForm.email}
                  onChange={(e) => handleLayawayChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{strings.layawayPhone} *</label>
                <input
                  type="tel"
                  required
                  value={layawayForm.phone}
                  onChange={(e) => handleLayawayChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  placeholder={language === 'English' ? '(555) 123-4567' : '(555) 123-4567'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{strings.layawayMonthlyPayment} *</label>
                <input
                  type="number"
                  required
                  min={1}
                  step={1}
                  value={layawayForm.monthlyPaymentAfford === '' ? '' : layawayForm.monthlyPaymentAfford}
                  onChange={(e) => handleLayawayChange('monthlyPaymentAfford', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{strings.layawayTargetDownPayment}</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={layawayForm.targetDownPayment === '' ? '' : layawayForm.targetDownPayment}
                  onChange={(e) => handleLayawayChange('targetDownPayment', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                  placeholder={language === 'English' ? 'Optional' : 'Opcional'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{strings.layawayPreferredContact}</label>
                <select
                  value={layawayForm.preferredContact}
                  onChange={(e) => handleLayawayChange('preferredContact', e.target.value as LayawayData['preferredContact'])}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                >
                  <option value="Phone">{language === 'English' ? 'Phone' : 'Teléfono'}</option>
                  <option value="Email">Email</option>
                  <option value="Text">{language === 'English' ? 'Text' : 'Mensaje'}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{strings.layawayNotes}</label>
              <textarea
                value={layawayForm.notes}
                onChange={(e) => handleLayawayChange('notes', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-500 resize-none"
                placeholder={language === 'English' ? 'Any questions or comments...' : 'Preguntas o comentarios...'}
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                {strings.back}
              </button>
              <button
                type="submit"
                disabled={layawaySubmitting}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {layawaySubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    {language === 'English' ? 'Submitting...' : 'Enviando...'}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    {strings.layawaySubmit}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <i className="fa-solid fa-check-circle text-amber-600"></i>
              {strings.layawaySuccessTitle}
            </h2>
            <p className="text-slate-700 mt-2 leading-relaxed">{strings.layawaySuccessMessage}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={onStartCreditApp}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                <i className="fa-solid fa-file-signature"></i>
                {strings.layawayBeginCta}
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 border-2 border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i>
                {language === 'English' ? 'Back to Credit Building' : 'Volver a Construir Crédito'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayawaySignupPage;
