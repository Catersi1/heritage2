
import React, { useState } from 'react';
import { CoSignerData, Language } from '../types';
import { Icons, t } from '../constants';
import SignaturePad from './SignaturePad';

const InputLabel = ({ text }: { text: string }) => (
  <label className="text-sm font-semibold text-slate-700 block mb-1">{text}</label>
);

interface Props {
  onSubmit: (data: CoSignerData) => void;
  onBack: () => void;
  initialData?: Partial<CoSignerData>;
  language: Language;
}

const CoSignerForm: React.FC<Props> = ({ onSubmit, onBack, initialData, language }) => {
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
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-slate-100 bg-blue-600 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <i className="fa-solid fa-users"></i> {strings.addCosigner}
          </h2>
          <p className="text-blue-100 text-sm mt-1">{language === 'English' ? 'Provide information for the secondary applicant.' : 'Proporcione información para el solicitante secundario.'}</p>
        </div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-2 rounded-xl text-xs font-black text-white hover:bg-white/30 transition-all shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i> {strings.back}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
          <SignaturePad 
            label={language === 'English' ? 'Co-signer Signature' : 'Firma del Co-fiador'}
            clearLabel={language === 'English' ? 'Clear' : 'Borrar'}
            onSave={(data) => setFormData({...formData, signature: data})}
            onClear={() => setFormData({...formData, signature: ''})}
            initialName={formData.name}
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
