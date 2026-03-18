
import React from 'react';
import { Language } from '../types';
import { Icons, t } from '../constants';

interface Props {
  language: Language;
  onBack: () => void;
  onStartApp: () => void;
}

const CreditBuilding: React.FC<Props> = ({ language, onBack, onStartApp }) => {
  const strings = t(language);

  const services = [
    {
      name: 'Self',
      url: 'https://www.self.inc/refer/14467611',
      description: language === 'English' 
        ? 'Build credit and save money at the same time with a Credit Builder Account.' 
        : 'Construya crédito y ahorre dinero al mismo tiempo con una cuenta de creación de crédito.',
      color: 'bg-indigo-600',
      icon: <i className="fa-solid fa-shield-halved text-white text-2xl"></i>
    },
    {
      name: 'Credit Strong',
      url: 'https://creditstrong.referralrock.com/l/3MIZAEL20',
      description: language === 'English'
        ? 'A division of Austin Capital Bank, providing credit building loans that report to all three bureaus.'
        : 'Una división de Austin Capital Bank, que ofrece préstamos para la creación de crédito que informan a las tres agencias.',
      color: 'bg-blue-700',
      icon: <i className="fa-solid fa-check-double text-white text-2xl"></i>
    },
    {
      name: 'Kikoff',
      url: 'https://kikoff.com/refer/V6R5T5FB',
      description: language === 'English'
        ? 'The easiest way to build credit. No interest, no fees, and instant approval.'
        : 'La forma más fácil de generar crédito. Sin intereses, sin cargos y aprobación instantánea.',
      color: 'bg-emerald-600',
      icon: <i className="fa-solid fa-star text-white text-2xl"></i>
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                {language === 'English' ? 'Build Your Credit' : 'Construya su Crédito'}
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
                {language === 'English' ? 'Prepare for Homeownership' : 'Prepárese para ser Propietario'}
              </p>
            </div>
            <button 
              onClick={onBack}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 border border-white/10"
            >
              <i className="fa-solid fa-arrow-left"></i> {strings.back}
            </button>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Educational Paragraph */}
          <section className="prose prose-slate max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-3xl shadow-sm">
              <h3 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap"></i>
                {language === 'English' ? 'Why Credit Matters' : 'Por qué es importante el crédito'}
              </h3>
              <p className="text-blue-800 text-lg leading-relaxed font-medium">
                {language === 'English' 
                  ? "Building a strong credit profile is one of the most important steps in preparing for the home buying process. These services work by reporting your positive payment history to the major credit bureaus, helping to raise your score over time. A higher credit score can unlock better interest rates and lower monthly payments, saving you thousands of dollars. Interestingly, buying a house itself can also help you build credit as you make consistent mortgage payments. If you're ready to see where you stand, you can start our credit application today!"
                  : "Construir un perfil crediticio sólido es uno de los pasos más importantes en la preparación para el proceso de compra de una vivienda. Estos servicios funcionan al informar su historial de pagos positivos a las principales agencias de crédito, lo que ayuda a aumentar su puntaje con el tiempo. Un puntaje de crédito más alto puede desbloquear mejores tasas de interés y pagos mensuales más bajos, ahorrándole miles de dólares. Curiosamente, comprar una casa en sí también puede ayudarlo a generar crédito a medida que realiza pagos hipotecarios constantes. Si está listo para ver cuál es su situación, ¡puede comenzar nuestra solicitud de crédito hoy mismo!"}
              </p>
              <button 
                onClick={onStartApp}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-200 transform hover:-translate-y-1 flex items-center gap-3"
              >
                {language === 'English' ? 'Start Credit Application' : 'Iniciar Solicitud de Crédito'}
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </section>

          {/* Service Cards */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
              {language === 'English' ? 'Recommended Credit Building Services' : 'Servicios Recomendados para Construir Crédito'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.name} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-lg hover:shadow-xl transition-all group flex flex-col h-full">
                  <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-3">{service.name}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                    {service.description}
                  </p>
                  <a 
                    href={service.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-full py-4 rounded-xl font-black text-center transition-all ${service.color} text-white shadow-lg hover:brightness-110 flex items-center justify-center gap-2`}
                  >
                    {language === 'English' ? 'Get Started' : 'Empezar'}
                    <i className="fa-solid fa-external-link text-xs"></i>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Note */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
            <p className="text-slate-500 text-xs font-medium">
              {language === 'English' 
                ? 'Note: These are third-party services. Heritage Housing provides these links as resources to help our customers prepare for homeownership.' 
                : 'Nota: Estos son servicios de terceros. Heritage Housing proporciona estos enlaces como recursos para ayudar a nuestros clientes a prepararse para ser propietarios.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditBuilding;
