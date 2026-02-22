
import React from 'react';
import { ApplicationData, Language } from '../types';
import { CONTACT_INFO, t } from '../constants';

interface Props {
  applicant?: ApplicationData;
  onStartOver: () => void;
  language: Language;
}

const SuccessScreen: React.FC<Props> = ({ applicant, onStartOver, language }) => {
  const strings = t(language);
  
  return (
    <div className="max-w-2xl mx-auto mt-10 animate-fade-in text-center">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500"></div>
        
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100">
          <i className="fa-solid fa-check text-4xl"></i>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{strings.submitted}</h2>
        <p className="text-emerald-700 font-semibold mb-2">{strings.successSavedLine}</p>
        <p className="text-slate-600 text-lg mb-4 leading-relaxed">
          {strings.successMsg.replace('{name}', `<span class="font-black text-blue-600">${applicant?.name || ''}</span>`).split('{name}').map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i === 0 && <span className="font-black text-blue-600">{applicant?.name}</span>}
            </React.Fragment>
          ))}
        </p>
        <p className="text-emerald-700 font-semibold mb-8">{strings.docContactNote}</p>
        
        <div className="bg-slate-50 rounded-[2rem] p-8 text-left border border-slate-100 mb-8 space-y-6">
          <h4 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide text-sm">
            <i className="fa-solid fa-list-check text-blue-600"></i> {strings.nextSteps}
          </h4>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <p className="text-sm text-slate-600 font-medium">{strings.step1Verify}</p>
            </li>
            <li className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <p className="text-sm text-slate-600 font-medium">
                {strings.step2Contact.split('{phone}').map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i === 0 && <span className="font-bold">{applicant?.phone}</span>}
                  </React.Fragment>
                ))}
              </p>
            </li>
            <li className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <p className="text-sm text-slate-600 font-medium">{strings.step3Viewing}</p>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {CONTACT_INFO.map(contact => (
            <div key={contact.name} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">{contact.name}</p>
               <p className="text-lg font-black text-slate-900">{contact.phone}</p>
            </div>
          ))}
        </div>

        <button onClick={onStartOver} className="text-slate-400 hover:text-slate-600 font-bold transition-colors text-sm uppercase tracking-widest">
          {strings.returnHome}
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
