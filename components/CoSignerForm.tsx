
import React, { useState } from 'react';
import { CoSignerData, Language } from '../types';
import { Icons, t } from '../constants';
import SignatureFontPicker from './SignatureFontPicker';

const InputLabel = ({ text }: { text: string }) => (
  <label className="text-sm font-semibold text-slate-700 block mb-1">{text}</label>
);

interface Props {
  onSubmit: (data: CoSignerData) => void;
  onBack: () => void;
  onNextStep?: (data: Partial<CoSignerData>) => void;
  initialData?: Partial<CoSignerData>;
  language: Language;
}

const CoSignerForm: React.FC<Props> = ({ onSubmit, onBack, onNextStep, initialData, language }) => {
  const strings = t(language);
  const [formData, setFormData] = useState<Partial<CoSignerData>>(initialData || {
    name: '',
    phone: '',
    email: '',
    ssn: '',
    dob: '',
    currentAddress: '',
    yearsAtAddress: '',
    employmentStatus: language === 'English' ? 'W2 (Employed)' : 'W2 (Empleado)',
    employerName: '',
    jobTitle: '',
    employerPhone: '',
    yearsEmployed: '',
    monthlyIncome: '',
    relationship: language === 'English' ? 'Family Member' : 'Miembro de la Familia',
    signature: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.ssn || !formData.dob) {
      alert(strings.requiredFields);
      return;
    }
    if (!formData.signature) {
      alert(language === 'English' ? "Co-signer signature is required." : "Se requiere la firma del co-fiador.");
      return;
    }
    onSubmit(formData as CoSignerData);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in pb-20">
      {onNextStep && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-3 px-4 flex justify-center safe-area-pb">
          <button
            type="button"
            onClick={() => onNextStep(formData)}
            className="border-2 border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            {strings.nextStep} <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
      <div className="p-8 border-b border-slate-100 bg-blue-600 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <i className="fa-solid fa-users"></i> {strings.addCosigner}
          </h2>
          <p className="text-blue-100 text-sm mt-1">{language === 'English' ? 'Provide information for the secondary applicant.' : 'Proporcione información para el solicitante secundario.'}</p>
        </div>
        <button onClick={onBack} className="text-blue-200 hover:text-white p-2 transition-colors">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 pb-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputLabel text={strings.cosignerRelationship} />
            <select className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})}>
              <option>{language === 'English' ? 'Spouse' : 'Cónyuge'}</option>
              <option>{language === 'English' ? 'Family Member' : 'Miembro de la Familia'}</option>
              <option>{language === 'English' ? 'Friend' : 'Amigo'}</option>
              <option>{language === 'English' ? 'Other' : 'Otro'}</option>
            </select>
          </div>
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
            <InputLabel text={strings.dob} />
            <input type="date" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          </div>
          <div className="col-span-full">
            <InputLabel text={strings.ssn} />
            <input type="password" required placeholder="XXX-XX-XXXX" className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.ssn} onChange={e => setFormData({...formData, ssn: e.target.value})} />
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800">{strings.cosignerEmp}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel text={strings.employerName} />
              <input type="text" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.employerName} onChange={e => setFormData({...formData, employerName: e.target.value})} />
            </div>
            <div>
              <InputLabel text={language === 'English' ? "Monthly Income ($)" : "Ingreso Mensual ($)"} />
              <input type="number" required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.monthlyIncome} onChange={e => setFormData({...formData, monthlyIncome: e.target.value === '' ? '' : Number(e.target.value)})} />
            </div>
          </div>
        </section>

        {/* Digital Signature */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <SignatureFontPicker
            initialName={formData.name}
            initialSignature={formData.signature}
            label={language === 'English' ? 'Co-signer signature' : 'Firma del co-fiador'}
            clearLabel={language === 'English' ? 'Clear' : 'Borrar'}
            hintText={strings.signatureHint}
            useButtonText={strings.useSignatureButton}
            signatureHeading={strings.signatureHeading}
            onSave={(data) => setFormData(prev => ({ ...prev, signature: data }))}
            onClear={() => setFormData(prev => ({ ...prev, signature: '' }))}
          />
        </section>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onBack}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all">
            {strings.back}
          </button>
          <button type="submit"
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2">
            {strings.continueDocs} <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        </form>
    </div>
  );
};

export default CoSignerForm;
