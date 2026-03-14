import React from 'react';
import { Language } from '../types';
import { Icons, t } from '../constants';

interface Props {
  onContinue: () => void;
  onBack: () => void;
  language: Language;
}

const ProcessExplanation: React.FC<Props> = ({ onContinue, onBack, language }) => {
  const strings = t(language);

  const steps = [
    {
      icon: <Icons.File className="w-8 h-8" />,
      title: language === 'English' ? '1. Secure Application' : '1. Solicitud Segura',
      desc: language === 'English' 
        ? 'Complete our encrypted 5-minute application. Your data is protected by bank-level security.' 
        : 'Complete nuestra solicitud cifrada de 5 minutos. Sus datos están protegidos por seguridad de nivel bancario.'
    },
    {
      icon: <Icons.Check className="w-8 h-8" />,
      title: language === 'English' ? '2. Instant Review' : '2. Revisión Instantánea',
      desc: language === 'English'
        ? 'Our team performs a quick internal assessment to determine your eligibility and potential budget.'
        : 'Nuestro equipo realiza una evaluación interna rápida para determinar su elegibilidad y presupuesto potencial.'
    },
    {
      icon: <Icons.Upload className="w-8 h-8" />,
      title: language === 'English' ? '3. Document Verification' : '3. Verificación de Documentos',
      desc: language === 'English'
        ? 'Upload your ID and income proof directly through our secure portal to speed up the process.'
        : 'Suba su identificación y comprobante de ingresos directamente a través de nuestro portal seguro para acelerar el proceso.'
    },
    {
      icon: <Icons.Home className="w-8 h-8" />,
      title: language === 'English' ? '4. Home Selection' : '4. Selección de Vivienda',
      desc: language === 'English'
        ? 'Meet with a specialist to pick your dream home and customize it to your land or park location.'
        : 'Reúnase con un especialista para elegir la casa de sus sueños y personalizarla para su terreno o ubicación en el parque.'
    }
  ];

  return (
    <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in max-w-4xl mx-auto">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 text-center">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
          {language === 'English' ? 'How It Works' : 'Cómo Funciona'}
        </h2>
        <p className="text-slate-500">
          {language === 'English' 
            ? 'Your journey to homeownership in 4 simple steps.' 
            : 'Su camino hacia la propiedad de una vivienda en 4 sencillos pasos.'}
        </p>
      </div>

      <div className="p-5 md:p-12 space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 md:gap-6 items-start p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                {React.cloneElement(step.icon as React.ReactElement, { className: 'w-6 h-6 md:w-8 md:h-8' })}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2">{step.title}</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-5 md:p-8 rounded-2xl md:rounded-3xl border-2 border-blue-100 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl md:text-2xl shrink-0">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div className="text-center md:text-left">
            <h4 className="font-black text-blue-900 mb-1 text-sm md:text-base">
              {language === 'English' ? 'Privacy & Security First' : 'Privacidad y Seguridad Primero'}
            </h4>
            <p className="text-blue-700 text-xs md:text-sm">
              {language === 'English'
                ? 'We use 256-bit encryption to ensure your personal information remains confidential and safe.'
                : 'Utilizamos cifrado de 256 bits para garantizar que su información personal permanezca confidencial y segura.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
          <button onClick={onBack} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 md:py-5 px-6 md:px-8 rounded-xl md:rounded-2xl transition-all text-sm md:text-base">
            {strings.back}
          </button>
          <button onClick={onContinue} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 md:py-5 px-6 md:px-8 rounded-xl md:rounded-2xl shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 md:gap-3 text-lg md:text-xl">
            {language === 'English' ? 'Start Application' : 'Iniciar Solicitud'} <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessExplanation;
