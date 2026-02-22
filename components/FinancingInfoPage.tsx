import React from 'react';
import { Language } from '../types';
import { t } from '../constants';

interface Props {
  language: Language;
  onBack: () => void;
  onStartApplication: () => void;
}

const FinancingInfoPage: React.FC<Props> = ({ language, onBack, onStartApplication }) => {
  const s = t(language);

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          {s.financingBackToHome}
        </button>
        <button
          type="button"
          onClick={onStartApplication}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          {s.financingStartApplication}
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {s.financingInfoTitle}
          </h1>
          <p className="text-blue-100 mt-2 text-lg">
            {s.financingInfoIntro}
          </p>
        </div>

        <div className="p-8 md:p-10 space-y-10">
          {/* What we need */}
          <section>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-folder-open"></i>
              </span>
              {s.financingWhatWeNeed}
            </h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="text-green-500 mt-0.5"><i className="fa-solid fa-check"></i></span>
                <span>{s.financingBankStatements}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 mt-0.5"><i className="fa-solid fa-check"></i></span>
                <span>{s.financingLastCheck}</span>
              </li>
            </ul>
          </section>

          {/* Down payment */}
          <section>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-percent"></i>
              </span>
              {s.financingDownPayment}
            </h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="text-emerald-500 mt-0.5"><i className="fa-solid fa-circle-check"></i></span>
                <span><strong className="text-slate-900">{s.financingGoodCredit}</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-400 mt-0.5"><i className="fa-solid fa-circle"></i></span>
                <span>{s.financingUsual}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 mt-0.5"><i className="fa-solid fa-circle-check"></i></span>
                <span><strong className="text-slate-900">{s.financingOwnLand}</strong></span>
              </li>
            </ul>
          </section>

          {/* ITIN */}
          <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-id-card"></i>
              </span>
              {s.financingITIN}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {s.financingITINDesc}
            </p>
          </section>

          {/* Our bank / terms */}
          <section className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-building-columns"></i>
              </span>
              {s.financingOurBank}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {s.financingOurBankDesc}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl">15 {language === 'English' ? 'years' : 'años'}</span>
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl">10 {language === 'English' ? 'years' : 'años'}</span>
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl">6 {language === 'English' ? 'years' : 'años'}</span>
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStartApplication}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center gap-2"
        >
          {s.financingStartApplication}
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default FinancingInfoPage;
