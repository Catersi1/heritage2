import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../constants';

interface Props {
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    monthlyIncome: string;
    employmentStatus: string;
    appointmentDate: string;
    landStatus: string;
    landLocation?: string;
    repoHistory: string;
    bedrooms: string;
    utilities: string;
    creditEstimate: string;
    notes?: string;
  }) => void;
  onBack: () => void;
  language: Language;
}

const AppointmentOnlyForm: React.FC<Props> = ({ onSubmit, onBack, language }) => {
  const strings = t(language);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    monthlyIncome: '',
    employmentStatus: '',
    appointmentDate: '',
    landStatus: '',
    landLocation: '',
    repoHistory: '',
    bedrooms: '',
    utilities: '',
    creditEstimate: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const employmentOptions = [
    { value: 'employed', label: language === 'English' ? 'Employed Full-Time' : 'Empleado Tiempo Completo' },
    { value: 'part_time', label: language === 'English' ? 'Employed Part-Time' : 'Empleado Medio Tiempo' },
    { value: 'self_employed', label: language === 'English' ? 'Self-Employed' : 'Autoempleado' },
    { value: 'retired', label: language === 'English' ? 'Retired' : 'Jubilado' },
    { value: 'other', label: language === 'English' ? 'Other' : 'Otro' }
  ];

  const landStatusOptions = [
    { value: 'own_land', label: language === 'English' ? 'I own land' : 'Tengo terreno propio' },
    { value: 'family_land', label: language === 'English' ? 'Family/Friend land' : 'Terreno de familia/amigo' },
    { value: 'need_land', label: language === 'English' ? 'I need to find land' : 'Necesito encontrar terreno' },
    { value: 'community', label: language === 'English' ? 'Community/RV park' : 'Comunidad/Parque de RV' },
    { value: 'other', label: language === 'English' ? 'Other' : 'Otro' }
  ];

  const repoOptions = [
    { value: 'none', label: language === 'English' ? 'No reposessions' : 'Sin embargos' },
    { value: '1', label: language === 'English' ? '1 repossession' : '1 embargo' },
    { value: '2_plus', label: language === 'English' ? '2+ repossessions' : '2+ embargos' }
  ];

  const bedroomOptions = [
    { value: '2', label: '2 BR' },
    { value: '3', label: '3 BR' },
    { value: '4', label: '4 BR' },
    { value: '5_plus', label: language === 'English' ? '5+ BR' : '5+ Habitaciones' }
  ];

  const utilityOptions = [
    { value: 'all', label: language === 'English' ? 'All utilities available' : 'Todos los servicios disponibles' },
    { value: 'partial', label: language === 'English' ? 'Some utilities' : 'Algunos servicios' },
    { value: 'none', label: language === 'English' ? 'No utilities yet' : 'Sin servicios aún' },
    { value: 'unknown', label: language === 'English' ? 'Not sure' : 'No estoy seguro' }
  ];

  const creditOptions = [
    { value: 'excellent', label: language === 'English' ? 'Excellent (720+)' : 'Excelente (720+)' },
    { value: 'good', label: language === 'English' ? 'Good (680-719)' : 'Bueno (680-719)' },
    { value: 'fair', label: language === 'English' ? 'Fair (620-679)' : 'Regular (620-679)' },
    { value: 'poor', label: language === 'English' ? 'Poor (below 620)' : 'Bajo (menos de 620)' },
    { value: 'unknown', label: language === 'English' ? 'Not sure' : 'No estoy seguro' }
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = language === 'English' ? 'Name is required' : 'El nombre es requerido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'English' ? 'Phone is required' : 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = language === 'English' ? 'Please enter a valid 10-digit phone number' : 'Ingrese un número de teléfono válido de 10 dígitos';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = language === 'English' ? 'Email is required' : 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'English' ? 'Please enter a valid email' : 'Ingrese un correo válido';
    }
    
    if (!formData.monthlyIncome.trim()) {
      newErrors.monthlyIncome = language === 'English' ? 'Monthly income is required' : 'Los ingresos mensuales son requeridos';
    }
    
    if (!formData.employmentStatus) {
      newErrors.employmentStatus = language === 'English' ? 'Employment status is required' : 'El estado de empleo es requerido';
    }

    if (!formData.landStatus) {
      newErrors.landStatus = language === 'English' ? 'Land status is required' : 'El estado del terreno es requerido';
    }

    if (!formData.repoHistory) {
      newErrors.repoHistory = language === 'English' ? 'Please indicate any repossession history' : 'Por favor indique si tiene historial de embargos';
    }

    if (!formData.bedrooms) {
      newErrors.bedrooms = language === 'English' ? 'Please select number of bedrooms' : 'Por favor seleccione el número de habitaciones';
    }

    if (!formData.utilities) {
      newErrors.utilities = language === 'English' ? 'Please indicate utility status' : 'Por favor indique el estado de los servicios';
    }

    if (!formData.creditEstimate) {
      newErrors.creditEstimate = language === 'English' ? 'Please estimate your credit score' : 'Por favor estime su puntaje de crédito';
    }
    
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = language === 'English' ? 'Please select an appointment date' : 'Por favor seleccione una fecha de cita';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData });
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <i className="fa-solid fa-calendar-check text-2xl"></i>
            <h1 className="text-2xl font-black">
              {language === 'English' ? 'Schedule an Appointment' : 'Programar una Cita'}
            </h1>
          </div>
          <p className="text-emerald-100">
            {language === 'English' 
              ? 'Skip the full application and schedule a visit to see our homes in person.' 
              : 'Omita la solicitud completa y programe una visita para ver nuestras casas en persona.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Contact Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-l-4 border-emerald-600 pl-4">
              {language === 'English' ? 'Contact Information' : 'Información de Contacto'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Full Name' : 'Nombre Completo'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder={language === 'English' ? 'John Smith' : 'Juan Pérez'}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Phone Number' : 'Número de Teléfono'} *
                </label>
                <input
                  type="tel"
                  value={formatPhone(formData.phone)}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.phone ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {language === 'English' ? 'Email Address' : 'Correo Electrónico'} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </section>

          {/* Financial Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-l-4 border-emerald-600 pl-4">
              {language === 'English' ? 'Financial Information' : 'Información Financiera'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Monthly Income (before taxes)' : 'Ingresos Mensuales (antes de impuestos)'} *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="text"
                    value={formData.monthlyIncome}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, monthlyIncome: value ? parseInt(value).toLocaleString() : '' });
                    }}
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.monthlyIncome ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="3,500"
                  />
                </div>
                {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Employment Status' : 'Estado de Empleo'} *
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={e => setFormData({ ...formData, employmentStatus: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white ${errors.employmentStatus ? 'border-red-500' : 'border-slate-200'}`}
                >
                  <option value="">{language === 'English' ? 'Select...' : 'Seleccionar...'}</option>
                  {employmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.employmentStatus && <p className="text-red-500 text-xs mt-1">{errors.employmentStatus}</p>}
              </div>
            </div>
          </section>

          {/* Home Requirements */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-l-4 border-emerald-600 pl-4">
              {language === 'English' ? 'Home Requirements' : 'Requisitos de la Casa'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Bedrooms Needed' : 'Habitaciones Necesarias'} *
                </label>
                <select
                  value={formData.bedrooms}
                  onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white ${errors.bedrooms ? 'border-red-500' : 'border-slate-200'}`}
                >
                  <option value="">{language === 'English' ? 'Select...' : 'Seleccionar...'}</option>
                  {bedroomOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Utilities at Site' : 'Servicios en el Sitio'} *
                </label>
                <select
                  value={formData.utilities}
                  onChange={e => setFormData({ ...formData, utilities: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white ${errors.utilities ? 'border-red-500' : 'border-slate-200'}`}
                >
                  <option value="">{language === 'English' ? 'Select...' : 'Seleccionar...'}</option>
                  {utilityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.utilities && <p className="text-red-500 text-xs mt-1">{errors.utilities}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Credit Score Estimate' : 'Estimación de Crédito'} *
                </label>
                <select
                  value={formData.creditEstimate}
                  onChange={e => setFormData({ ...formData, creditEstimate: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white ${errors.creditEstimate ? 'border-red-500' : 'border-slate-200'}`}
                >
                  <option value="">{language === 'English' ? 'Select...' : 'Seleccionar...'}</option>
                  {creditOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.creditEstimate && <p className="text-red-500 text-xs mt-1">{errors.creditEstimate}</p>}
              </div>
            </div>
          </section>

          {/* Land Status */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-l-4 border-emerald-600 pl-4">
              {language === 'English' ? 'Land Information' : 'Información del Terreno'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Do you have land for the home?' : '¿Tiene terreno para la casa?'} *
                </label>
                <select
                  value={formData.landStatus}
                  onChange={e => setFormData({ ...formData, landStatus: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white ${errors.landStatus ? 'border-red-500' : 'border-slate-200'}`}
                >
                  <option value="">{language === 'English' ? 'Select...' : 'Seleccionar...'}</option>
                  {landStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.landStatus && <p className="text-red-500 text-xs mt-1">{errors.landStatus}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {language === 'English' ? 'Land Location (City/Area)' : 'Ubicación del Terreno (Ciudad/Zona)'}
                </label>
                <input
                  type="text"
                  value={formData.landLocation}
                  onChange={e => setFormData({ ...formData, landLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder={language === 'English' ? 'e.g., Oklahoma City, Tulsa...' : 'ej., Oklahoma City, Tulsa...'}
                />
              </div>
            </div>
          </section>

          {/* Repossession History */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-l-4 border-emerald-600 pl-4">
              {language === 'English' ? 'Credit History' : 'Historial de Crédito'}
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {language === 'English' ? 'Any repossessions in the last 7 years?' : '¿Algún embargo en los últimos 7 años?'} *
              </label>
              <select
                value={formData.repoHistory}
                onChange={e => setFormData({ ...formData, repoHistory: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white ${errors.repoHistory ? 'border-red-500' : 'border-slate-200'}`}
              >
                <option value="">{language === 'English' ? 'Select...' : 'Seleccionar...'}</option>
                {repoOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.repoHistory && <p className="text-red-500 text-xs mt-1">{errors.repoHistory}</p>}
            </div>
          </section>

          {/* Appointment Date */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-l-4 border-emerald-600 pl-4">
              {language === 'English' ? 'Preferred Appointment Date' : 'Fecha de Cita Preferida'}
            </h3>
            
            <div>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })}
                min={new Date().toISOString().slice(0, 10)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${errors.appointmentDate ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.appointmentDate && <p className="text-red-500 text-xs mt-1">{errors.appointmentDate}</p>}
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-l-4 border-emerald-600 pl-4">
              {language === 'English' ? 'Additional Notes (Optional)' : 'Notas Adicionales (Opcional)'}
            </h3>
            
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
              placeholder={language === 'English' ? 'Any specific requirements or questions...' : 'Requisitos específicos o preguntas...'}
            />
          </section>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all"
            >
              {language === 'English' ? 'Back' : 'Atrás'}
            </button>
            
            <button
              type="submit"
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              {language === 'English' ? 'Schedule Appointment' : 'Programar Cita'}
              <i className="fa-solid fa-calendar-check"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentOnlyForm;
