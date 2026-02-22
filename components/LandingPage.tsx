import React from 'react';
import { t } from '../constants';
import { Language } from '../types';

interface Props {
  onStart: () => void;
  onShowFinancingInfo?: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LandingPage: React.FC<Props> = ({ onStart, onShowFinancingInfo, language, setLanguage }) => {
  const strings = t(language);

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
      <section className="text-center space-y-6 pt-2">
        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
          {strings.welcome}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          {strings.heroTitle1}<span className="text-blue-600">{strings.heroTitle2}</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {strings.heroSubtitle}
        </p>
        
        {/* New Marketing Message */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl max-w-xl mx-auto">
          <p className="text-amber-800 text-sm font-medium italic">
            {strings.marketingQuote}
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-5 px-10 rounded-3xl shadow-2xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            {strings.startApp} <i className="fa-solid fa-arrow-right"></i>
          </button>
          {onShowFinancingInfo && (
            <button 
              type="button"
              onClick={onShowFinancingInfo}
              className="text-slate-600 hover:text-blue-600 font-bold py-3 px-6 rounded-2xl border-2 border-slate-200 hover:border-blue-300 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-circle-info"></i>
              {strings.howFinancingWorks}
            </button>
          )}
        </div>
        
        {/* Appointment Only Button */}
        <div className="pt-2">
          <button
            onClick={() => window.location.hash = '#appointment'}
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm underline transition-colors flex items-center gap-2 mx-auto"
          >
            <i className="fa-solid fa-calendar-check"></i>
            {language === 'English' ? 'Just want to schedule a visit? Click here' : '¿Solo quiere programar una visita? Haga clic aquí'}
          </button>
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

      {/* Admin Link - Added */}
      <div className="flex justify-center pt-4 pb-8">
        <a 
          href="#admin" 
          className="text-sm text-slate-400 hover:text-slate-600 underline transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-lock text-xs"></i>
          Admin Dashboard
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
