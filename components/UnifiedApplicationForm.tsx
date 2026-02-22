
import React, { useState, useEffect } from 'react';
import { ApplicationData, Language } from '../types';
import { calculateScore, Icons, t } from '../constants';
import SignatureFontPicker from './SignatureFontPicker';

const InputLabel = ({ text }: { text: string }) => (
  <label className="text-sm font-semibold text-slate-700 block mb-1">{text}</label>
);

interface Props {
  onSubmit: (data: ApplicationData) => void;
  onBack: () => void;
  onNextStep?: (data: Partial<ApplicationData>) => void;
  initialData?: Partial<ApplicationData>;
  language: Language;
}

const UnifiedApplicationForm: React.FC<Props> = ({ onSubmit, onBack, onNextStep, initialData, language }) => {
  const strings = t(language);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(!!initialData?.consentGiven);
  const [formData, setFormData] = useState<Partial<ApplicationData>>(initialData || {
    language: language,
    name: '',
    phone: '',
    email: '',
    ssn: '',
    dob: '',
    currentAddress: '',
    yearsAtAddress: '',
    landStatus: language === 'English' ? 'I need to find land' : 'Necesito encontrar terreno',
    landLocation: '',
    utilities: 'N/A',
    bedrooms: '3',
    targetPayment: '',
    employmentStatus: language === 'English' ? 'W2 (Employed)' : 'W2 (Empleado)',
    employerName: '',
    jobTitle: '',
    employerPhone: '',
    yearsEmployed: '',
    monthlyIncome: '',
    creditEstimate: language === 'English' ? 'Good (640-719)' : 'Bueno (640-719)',
    downPayment: '',
    downPaymentSource: language === 'English' ? 'Savings' : 'Ahorros',
    repoHistory: 'No',
    hasCoSigner: false,
    wantAppointment: false,
    appointmentDetails: '',
    signature: ''
  });

  const [score, setScore] = useState(0);

  useEffect(() => {
    const s = calculateScore({
      landStatus: formData.landStatus || '',
      utilities: formData.utilities || '',
      employmentStatus: formData.employmentStatus || '',
      monthlyIncome: formData.monthlyIncome ?? '',
      targetPayment: formData.targetPayment ?? '',
      downPayment: formData.downPayment ?? '',
      creditEstimate: formData.creditEstimate || '',
      repoHistory: formData.repoHistory || ''
    });
    setScore(s);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.monthlyIncome || !formData.ssn || !formData.dob) {
      alert(strings.requiredFields);
      return;
    }

    if (!agreedToPrivacy) {
      alert(language === 'English' ? "Please review and accept the Security & Privacy Policy to continue." : "Por favor revise y acepte la Política de Seguridad y Privacidad para continuar.");
      return;
    }

    if (!formData.signature) {
      alert(language === 'English' ? "Please provide your signature before continuing." : "Por favor proporcione su firma antes de continuar.");
      return;
    }

    onSubmit({
      ...formData as ApplicationData,
      language: language,
      internalScore: score,
      date: new Date().toISOString(),
      consentGiven: true
    });
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in pb-20">
      {onNextStep && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-3 px-4 flex justify-center safe-area-pb">
          <button
            type="button"
            onClick={() => onNextStep({ ...formData, language, internalScore: score, date: new Date().toISOString(), consentGiven: agreedToPrivacy })}
            className="border-2 border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            {strings.nextStep} <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
      <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Icons.File /> {strings.securePortal}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{language === 'English' ? 'Your data is encrypted and protected by Heritage Housing.' : 'Sus datos están cifrados y protegidos por Heritage Housing.'}</p>
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 p-2 transition-colors">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10 pb-12">
        {/* Step 1: Basic Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</span>
            <h3 className="text-lg font-bold text-slate-800">{strings.personalTitle}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel text={strings.fullName} />
              <input type="text" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <InputLabel text={strings.phone} />
              <input type="tel" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <InputLabel text={strings.email} />
              <input type="email" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <InputLabel text={strings.dob} />
              <input type="date" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div className="col-span-full">
               <InputLabel text={strings.ssn} />
               <input type="password" required placeholder="XXX-XX-XXXX" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.ssn} onChange={e => setFormData({...formData, ssn: e.target.value})} />
               <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                 <i className="fa-solid fa-lock"></i> {strings.encryptionNote}
               </p>
            </div>
          </div>
        </section>

        {/* Step 2: Living Situation */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</span>
            <h3 className="text-lg font-bold text-slate-800">{strings.residenceTitle}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <InputLabel text={strings.streetAddress} />
              <input type="text" required placeholder={language === 'English' ? "123 Main St, Apt 4" : "123 Calle Principal, Apt 4"} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} />
            </div>
            <div>
              <InputLabel text={strings.yearsThere} />
              <input type="text" required placeholder="e.g. 3" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.yearsAtAddress} onChange={e => setFormData({...formData, yearsAtAddress: e.target.value})} />
            </div>
          </div>
        </section>

        {/* Step 3: Employment & Income */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</span>
            <h3 className="text-lg font-bold text-slate-800">{strings.incomeTitle}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel text={strings.empType} />
              <select className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.employmentStatus} onChange={e => setFormData({...formData, employmentStatus: e.target.value})}>
                <option>{language === 'English' ? 'W2 (Employed)' : 'W2 (Empleado)'}</option>
                <option>{language === 'English' ? '1099 (Self-Employed)' : '1099 (Independiente)'}</option>
                <option>{language === 'English' ? 'Fixed Income/Retired' : 'Ingreso Fijo/Jubilado'}</option>
                <option>{language === 'English' ? 'Cash/Other' : 'Efectivo/Otro'}</option>
              </select>
            </div>
            <div>
              <InputLabel text={strings.monthlyIncome} />
              <input type="number" required placeholder="0" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value === '' ? '' : Number(e.target.value)})} />
            </div>
            <div>
              <InputLabel text={strings.employerName} />
              <input type="text" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.employerName} onChange={e => setFormData({...formData, employerName: e.target.value})} />
            </div>
            <div>
              <InputLabel text={strings.jobTitle} />
              <input type="text" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
            </div>
          </div>
        </section>

        {/* Step 4: Budget & Property */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">4</span>
            <h3 className="text-lg font-bold text-slate-800">{strings.propertyTitle}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel text={strings.landStatus} />
              <select className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.landStatus} onChange={e => setFormData({...formData, landStatus: e.target.value})}>
                <option>{language === 'English' ? 'I need to find land' : 'Necesito encontrar terreno'}</option>
                <option>{language === 'English' ? 'I have land (Financed)' : 'Tengo terreno (Financiado)'}</option>
                <option>{language === 'English' ? 'I have land (Paid Off)' : 'Tengo terreno (Pagado)'}</option>
                <option>{language === 'English' ? 'Family Land' : 'Terreno Familiar'}</option>
                <option>{language === 'English' ? "I'm ok with a mobile home park" : 'Estoy de acuerdo con un parque de casas móviles'}</option>
              </select>
            </div>
            <div>
              <InputLabel text={strings.bedrooms} />
              <select className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})}>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5+</option>
              </select>
            </div>
            <div>
              <InputLabel text={strings.downPayment} />
              <input type="number" placeholder="0" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.downPayment} onChange={e => setFormData({...formData, downPayment: e.target.value === '' ? '' : Number(e.target.value)})} />
            </div>
            <div>
              <InputLabel text={strings.targetPay} />
              <input type="number" placeholder="1000" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.targetPayment} onChange={e => setFormData({...formData, targetPayment: e.target.value === '' ? '' : Number(e.target.value)})} />
            </div>
            <div className="col-span-full">
              <InputLabel text={strings.creditEst} />
              <select className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.creditEstimate} onChange={e => setFormData({...formData, creditEstimate: e.target.value})}>
                <option>{language === 'English' ? 'Excellent (720+)' : 'Excelente (720+)'}</option>
                <option>{language === 'English' ? 'Good (640-719)' : 'Bueno (640-719)'}</option>
                <option>{language === 'English' ? 'Fair (580-639)' : 'Regular (580-639)'}</option>
                <option>{language === 'English' ? 'Poor (<580)' : 'Pobre (<580)'}</option>
                <option>{language === 'English' ? 'Unknown' : 'Desconocido'}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Co-signer Toggle */}
        <section className="bg-slate-900 p-8 rounded-3xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold mb-1">{strings.needCosigner}</h3>
              <p className="text-slate-400 text-sm">{strings.cosignerDesc}</p>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({...formData, hasCoSigner: !formData.hasCoSigner})}
              className={`px-8 py-3 rounded-2xl font-bold transition-all ${formData.hasCoSigner ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {formData.hasCoSigner ? strings.removeCosigner : strings.addCosigner}
            </button>
          </div>
        </section>

        {/* Digital Signature */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">5</span>
            <h3 className="text-lg font-bold text-slate-800">{language === 'English' ? 'Your Signature (type name, choose style)' : 'Su firma (escriba nombre, elija estilo)'}</h3>
          </div>
          <SignatureFontPicker
            initialName={formData.name}
            initialSignature={formData.signature}
            label={language === 'English' ? 'Your signature' : 'Su firma'}
            clearLabel={language === 'English' ? 'Clear' : 'Borrar'}
            hintText={strings.signatureHint}
            useButtonText={strings.useSignatureButton}
            signatureHeading={strings.signatureHeading}
            onSave={(data) => setFormData(prev => ({ ...prev, signature: data }))}
            onClear={() => setFormData(prev => ({ ...prev, signature: '' }))}
          />
        </section>

        {/* Security & Privacy Consent */}
        <section className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="shrink-0 pt-1">
              <input 
                type="checkbox" 
                id="privacy-check"
                className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" 
                checked={agreedToPrivacy}
                onChange={e => setAgreedToPrivacy(e.target.checked)}
              />
            </div>
            <label htmlFor="privacy-check" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
              <span className="font-bold text-blue-800">{strings.securityConsent}</span> {strings.consentText}
            </label>
          </div>
        </section>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-3xl shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-xl"
        >
          {formData.hasCoSigner ? strings.nextCosigner : strings.continueDocs} <i className="fa-solid fa-arrow-right"></i>
        </button>

        </form>
    </div>
  );
};

export default UnifiedApplicationForm;
