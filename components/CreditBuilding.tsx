import React from 'react';
import { t } from '../constants';
import { Language } from '../types';

const CREDIT_SERVICES = [
  {
    id: 'self',
    name: 'Self',
    descriptionKey: 'creditBuildingSelfDesc' as const,
    url: 'https://www.self.inc/refer/14467611',
    icon: 'fa-solid fa-piggy-bank',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'creditstrong',
    name: 'Credit Strong',
    descriptionKey: 'creditBuildingCreditStrongDesc' as const,
    url: 'https://creditstrong.referralrock.com/l/3MIZAEL20',
    icon: 'fa-solid fa-chart-line',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'kickoff',
    name: 'Kikoff',
    descriptionKey: 'creditBuildingKickoffDesc' as const,
    url: 'https://kikoff.com/refer/V6R5T5FB',
    icon: 'fa-solid fa-rocket',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
] as const;

interface Props {
  language: Language;
  onStartCreditApp: () => void;
  onStartLayaway: () => void;
}

const CreditBuilding: React.FC<Props> = ({ language, onStartCreditApp, onStartLayaway }) => {
  const strings = t(language);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro paragraph */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <p className="text-slate-700 leading-relaxed text-base md:text-lg">
          {strings.creditBuildingIntro}
        </p>
        <div className="mt-6">
          <button
            onClick={onStartCreditApp}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-file-signature"></i>
            {strings.creditBuildingApplyCta}
          </button>
        </div>
      </div>

      {/* Credit building options - partners + layaway as cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider mb-4">
          {strings.creditBuildingPartnersTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREDIT_SERVICES.map((service) => (
            <div
              key={service.id}
              className={`rounded-2xl border-2 ${service.borderColor} ${service.bgLight} p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white text-xl mb-4`}
              >
                <i className={service.icon}></i>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{service.name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5">
                {strings[service.descriptionKey]}
              </p>
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-white border-2 ${service.borderColor} text-slate-800 hover:bg-slate-50 transition-colors`}
              >
                {strings.creditBuildingLearnMore}
                <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
              </a>
            </div>
          ))}
          {/* Layaway program - same style as other options, links to dedicated page */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl mb-4">
              <i className="fa-solid fa-calendar-plus"></i>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">{strings.layawayTitle}</h3>
            <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5">
              {strings.layawayCardDesc}
            </p>
            <button
              type="button"
              onClick={onStartLayaway}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-white border-2 border-amber-200 text-slate-800 hover:bg-amber-100 transition-colors"
            >
              {strings.layawayCardCta}
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditBuilding;
