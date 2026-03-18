
import React from 'react';
import { Icons, t } from '../constants';
import { Language } from '../types';

interface Props {
  onStart: () => void;
  onCustomizer: () => void;
  onAppointment: () => void;
  onCreditBuilding: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LandingPage: React.FC<Props> = ({ onStart, onCustomizer, onAppointment, onCreditBuilding, language, setLanguage }) => {
  const strings = t(language);

  const [activeTab, setActiveTab] = React.useState<'apply' | 'customize' | 'appointment' | 'credit'>('apply');

  const steps = [
    {
      icon: <i className="fa-solid fa-file-lines text-blue-600"></i>,
      title: strings.step1Title,
      desc: strings.step1Desc
    },
    {
      icon: <i className="fa-solid fa-house-chimney text-green-600"></i>,
      title: strings.step2Title,
      desc: strings.step2Desc
    },
    {
      icon: <i className="fa-solid fa-clock text-amber-600"></i>,
      title: strings.step3Title,
      desc: strings.step3Desc
    },
    {
      icon: <i className="fa-solid fa-truck-fast text-purple-600"></i>,
      title: strings.step4Title,
      desc: strings.step4Desc
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      {/* Translation Button - Highly Visible */}
      <div className="flex justify-center pt-2">
        <button 
          onClick={() => setLanguage(language === 'English' ? 'Español' : 'English')}
          className="bg-white border-4 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-black text-lg shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <i className="fa-solid fa-language text-2xl"></i>
          {language === 'English' ? 'VER EN ESPAÑOL' : 'VIEW IN ENGLISH'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-8 pt-2">
        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
          {strings.welcome}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          {strings.heroTitle1}<span className="text-blue-600">{strings.heroTitle2}</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {strings.heroSubtitle}
        </p>
        
        {/* Interactive Tabs */}
        <div className="max-w-2xl mx-auto bg-slate-100 p-2 rounded-[2rem] flex flex-col sm:flex-row gap-2 shadow-inner">
          <button 
            onClick={() => setActiveTab('apply')}
            className={`flex-1 py-4 px-6 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'apply' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fa-solid fa-file-signature"></i>
            {language === 'English' ? 'APPLY NOW' : 'APLICAR AHORA'}
          </button>
          <button 
            onClick={() => setActiveTab('customize')}
            className={`flex-1 py-4 px-6 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'customize' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            {language === 'English' ? 'CUSTOMIZER' : 'PERSONALIZADOR'}
          </button>
          <button 
            onClick={() => setActiveTab('appointment')}
            className={`flex-1 py-4 px-6 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'appointment' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fa-solid fa-calendar-check"></i>
            {language === 'English' ? 'APPOINTMENT' : 'CITA'}
          </button>
          <button 
            onClick={() => setActiveTab('credit')}
            className={`flex-1 py-4 px-6 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'credit' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fa-solid fa-chart-line"></i>
            {language === 'English' ? 'BUILD CREDIT' : 'CONSTRUIR CRÉDITO'}
          </button>
        </div>

        <div className="pt-4">
          {activeTab === 'apply' && (
            <button 
              onClick={onStart}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-6 px-12 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto animate-fade-in"
            >
              {strings.startApp} <i className="fa-solid fa-arrow-right"></i>
            </button>
          )}
          {activeTab === 'customize' && (
            <button 
              onClick={onCustomizer}
              className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-6 px-12 rounded-[2rem] shadow-2xl shadow-green-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto animate-fade-in"
            >
              {language === 'English' ? 'Estimate My Home' : 'Estimar Mi Casa'} <i className="fa-solid fa-calculator"></i>
            </button>
          )}
          {activeTab === 'appointment' && (
            <button 
              onClick={onAppointment}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold py-6 px-12 rounded-[2rem] shadow-2xl shadow-amber-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto animate-fade-in"
            >
              {language === 'English' ? 'Book a Viewing' : 'Reservar una Visita'} <i className="fa-solid fa-calendar-day"></i>
            </button>
          )}
          {activeTab === 'credit' && (
            <button 
              onClick={onCreditBuilding}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-6 px-12 rounded-[2rem] shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto animate-fade-in"
            >
              {language === 'English' ? 'Credit Building Resources' : 'Recursos para Construir Crédito'} <i className="fa-solid fa-graduation-cap"></i>
            </button>
          )}
        </div>
      </section>

      {/* Process Steps */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
              {step.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mt-1">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Trust Banner */}
      <section className="bg-slate-900 text-white p-8 rounded-[40px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{strings.whyChoose}</h2>
            <p className="text-slate-400 max-w-md">
              {strings.whyDesc}
            </p>
          </div>
          <div className="flex gap-10">
            <div className="text-center">
              <p className="text-3xl font-black text-blue-400">24h</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{strings.responseLabel}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-400">2wk</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{strings.deliveryLabel}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-purple-400">0$</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{strings.feesLabel}</p>
            </div>
          </div>
        </div>
        {/* Abstract Background Detail */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
      </section>
    </div>
  );
};

export default LandingPage;
