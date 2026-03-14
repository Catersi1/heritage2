import React, { useState } from 'react';
import { AppointmentOnlyData, Language } from '../types';
import { t } from '../constants';

interface Props {
  onSubmit: (data: AppointmentOnlyData) => void;
  onBack: () => void;
  language: Language;
}

const AppointmentOnlyForm: React.FC<Props> = ({ onSubmit, onBack, language }) => {
  const strings = t(language);
  const [formData, setFormData] = useState<Partial<AppointmentOnlyData>>({
    name: '',
    phone: '',
    email: '',
    monthlyIncome: '',
    employmentStatus: '',
    bedroomsNeeded: '',
    utilitiesAtSite: '',
    creditScoreEstimate: '',
    hasLand: '',
    landLocation: '',
    repoHistory7Years: '',
    preferredDate: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert(strings.requiredFields);
      return;
    }
    onSubmit({
      ...formData as AppointmentOnlyData,
      submittedAt: new Date().toISOString()
    });
  };

  const SectionTitle = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 mb-4 mt-8">
      <div className="w-1.5 h-8 bg-[#2D936C] rounded-full"></div>
      <h3 className="text-xl font-bold text-slate-800">{text}</h3>
    </div>
  );

  const Label = ({ text }: { text: string }) => (
    <label className="text-sm font-bold text-slate-700 block mb-1">{text}</label>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-8 bg-[#2D936C] text-white">
        <div className="flex items-center gap-3 mb-2">
          <i className="fa-solid fa-calendar-check text-3xl"></i>
          <h2 className="text-3xl font-black tracking-tight">{strings.appointmentTitle}</h2>
        </div>
        <p className="text-emerald-50 text-lg opacity-90">
          {strings.appointmentSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Contact Information */}
        <section>
          <SectionTitle text={language === 'English' ? 'Contact Information' : 'Información de Contacto'} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label text={strings.fullName + " *"} />
              <input 
                type="text" 
                required 
                placeholder="John Smith"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label text={strings.phone + " *"} />
              <input 
                type="tel" 
                required 
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label text={strings.email + " *"} />
              <input 
                type="email" 
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Financial Information */}
        <section>
          <SectionTitle text={strings.financialInfo} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label text={strings.monthlyIncomeBeforeTaxes} />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input 
                  type="number" 
                  required
                  placeholder="3,500"
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all"
                  value={formData.monthlyIncome}
                  onChange={e => setFormData({...formData, monthlyIncome: e.target.value === '' ? '' : Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label text={strings.empType + " *"} />
              <select 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all appearance-none bg-white"
                value={formData.employmentStatus}
                onChange={e => setFormData({...formData, employmentStatus: e.target.value})}
              >
                <option value="">Select...</option>
                <option value="W2 (Employed)">{language === 'English' ? 'W2 (Employed)' : 'W2 (Empleado)'}</option>
                <option value="1099 (Self-Employed)">{language === 'English' ? '1099 (Self-Employed)' : '1099 (Independiente)'}</option>
                <option value="Fixed Income/Retired">{language === 'English' ? 'Fixed Income/Retired' : 'Ingreso Fijo/Jubilado'}</option>
                <option value="Cash/Other">{language === 'English' ? 'Cash/Other' : 'Efectivo/Otro'}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Home Requirements */}
        <section>
          <SectionTitle text={strings.homeRequirements} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label text={strings.bedrooms + " *"} />
              <select 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all appearance-none bg-white"
                value={formData.bedroomsNeeded}
                onChange={e => setFormData({...formData, bedroomsNeeded: e.target.value})}
              >
                <option value="">Select...</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </div>
            <div>
              <Label text={strings.utilitiesAtSite} />
              <select 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all appearance-none bg-white"
                value={formData.utilitiesAtSite}
                onChange={e => setFormData({...formData, utilitiesAtSite: e.target.value})}
              >
                <option value="">Select...</option>
                <option value="Yes, all utilities">{language === 'English' ? 'Yes, all utilities' : 'Sí, todos los servicios'}</option>
                <option value="Some utilities">{language === 'English' ? 'Some utilities' : 'Algunos servicios'}</option>
                <option value="No utilities">{language === 'English' ? 'No utilities' : 'Sin servicios'}</option>
                <option value="Unknown">{language === 'English' ? 'Unknown' : 'Desconocido'}</option>
              </select>
            </div>
            <div>
              <Label text={strings.creditEst + " *"} />
              <select 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all appearance-none bg-white"
                value={formData.creditScoreEstimate}
                onChange={e => setFormData({...formData, creditScoreEstimate: e.target.value})}
              >
                <option value="">Select...</option>
                <option value="Excellent (720+)">{language === 'English' ? 'Excellent (720+)' : 'Excelente (720+)'}</option>
                <option value="Good (640-719)">{language === 'English' ? 'Good (640-719)' : 'Bueno (640-719)'}</option>
                <option value="Fair (580-639)">{language === 'English' ? 'Fair (580-639)' : 'Regular (580-639)'}</option>
                <option value="Poor (<580)">{language === 'English' ? 'Poor (<580)' : 'Pobre (<580)'}</option>
                <option value="Unknown">{language === 'English' ? 'Unknown' : 'Desconocido'}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Land Information */}
        <section>
          <SectionTitle text={strings.landInformation} />
          <div className="space-y-6">
            <div>
              <Label text={strings.doYouHaveLand} />
              <select 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all appearance-none bg-white"
                value={formData.hasLand}
                onChange={e => setFormData({...formData, hasLand: e.target.value})}
              >
                <option value="">Select...</option>
                <option value="I need to find land">{language === 'English' ? 'I need to find land' : 'Necesito encontrar terreno'}</option>
                <option value="I have land (Financed)">{language === 'English' ? 'I have land (Financed)' : 'Tengo terreno (Financiado)'}</option>
                <option value="I have land (Paid Off)">{language === 'English' ? 'I have land (Paid Off)' : 'Tengo terreno (Pagado)'}</option>
                <option value="Family Land">{language === 'English' ? 'Family Land' : 'Terreno Familiar'}</option>
                <option value="Mobile Home Park">{language === 'English' ? 'Mobile Home Park' : 'Parque de Casas Móviles'}</option>
              </select>
            </div>
            <div>
              <Label text={strings.landLocationArea} />
              <input 
                type="text" 
                placeholder="e.g., Oklahoma City, Tulsa..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all"
                value={formData.landLocation}
                onChange={e => setFormData({...formData, landLocation: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Credit History */}
        <section>
          <SectionTitle text={strings.creditHistory} />
          <div>
            <Label text={strings.anyRepos7Years} />
            <select 
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all appearance-none bg-white"
              value={formData.repoHistory7Years}
              onChange={e => setFormData({...formData, repoHistory7Years: e.target.value})}
            >
              <option value="">Select...</option>
              <option value="No">{language === 'English' ? 'No' : 'No'}</option>
              <option value="Yes, within last 2 years">{language === 'English' ? 'Yes, within last 2 years' : 'Sí, en los últimos 2 años'}</option>
              <option value="Yes, 2-7 years ago">{language === 'English' ? 'Yes, 2-7 years ago' : 'Sí, hace 2-7 años'}</option>
            </select>
          </div>
        </section>

        {/* Preferred Appointment Date */}
        <section>
          <SectionTitle text={strings.preferredAppointmentDate} />
          <input 
            type="date" 
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all"
            value={formData.preferredDate}
            onChange={e => setFormData({...formData, preferredDate: e.target.value})}
          />
        </section>

        {/* Additional Notes */}
        <section>
          <SectionTitle text={strings.additionalNotesOptional} />
          <textarea 
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D936C] outline-none transition-all h-32 resize-none"
            placeholder={language === 'English' ? "Any specific requirements or questions..." : "Cualquier requisito o pregunta específica..."}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </section>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 pt-8">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all"
          >
            {strings.back}
          </button>
          <button 
            type="submit"
            className="flex-[2] bg-[#2D936C] hover:bg-[#247556] text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            {strings.scheduleAppointment} <i className="fa-solid fa-calendar-plus"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentOnlyForm;
