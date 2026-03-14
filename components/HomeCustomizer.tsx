import React, { useState, useEffect } from 'react';
import { Language, CustomizationData, ApplicationData } from '../types';
import { Icons, t, MOBILE_HOME_PARKS, getHomeBasePrice, getEstimatedDownPayment, calculateMortgage } from '../constants';

interface Props {
  onSubmit: (data: CustomizationData) => void;
  onBack: () => void;
  language: Language;
  applicantData?: ApplicationData;
  initialData?: CustomizationData;
  onGoToAppointment?: () => void;
}

const HomeCustomizer: React.FC<Props> = ({ onSubmit, onBack, language, applicantData, initialData, onGoToAppointment }) => {
  const strings = t(language);
  const [data, setData] = useState<CustomizationData>(initialData || {
    homeType: 'Single Wide',
    bedrooms: applicantData?.bedrooms || '3',
    bathrooms: '2',
    isIdeal: true,
    hasWell: false,
    hasSeptic: false,
    hasElectric: false,
    wantsPark: false,
    estimatedTotal: 0
  });

  const [mortgageEstimates, setMortgageEstimates] = useState({
    sixYear: 0,
    tenYear: 0,
    fifteenYear: 0
  });

  const [downPaymentInfo, setDownPaymentInfo] = useState({
    amount: 0,
    source: 'Calculated'
  });

  const [hoveredPark, setHoveredPark] = useState<any>(null);

  const costs = {
    well: 8500,
    septic: 6500,
    electric: 3500,
    parkSetup: 5000,
  };

  useEffect(() => {
    const basePrice = getHomeBasePrice(data.bedrooms, data.isIdeal);
    let total = basePrice;
    
    if (!data.wantsPark) {
      if (!data.hasWell) total += costs.well;
      if (!data.hasSeptic) total += costs.septic;
      if (!data.hasElectric) total += costs.electric;
    } else {
      total += costs.parkSetup;
    }

    setData(prev => ({ ...prev, estimatedTotal: Math.round(total) }));

    // Calculate Down Payment
    const dp = getEstimatedDownPayment(
      total, 
      applicantData?.creditEstimate || 'Unknown', 
      applicantData?.landStatus || 'Unknown'
    );
    setDownPaymentInfo({
      amount: dp,
      source: applicantData ? 'Based on your profile' : 'Standard Estimate'
    });

    // Calculate Mortgage
    const principal = total - dp;
    const rate = 8.3;
    setMortgageEstimates({
      sixYear: calculateMortgage(principal, rate, 6),
      tenYear: calculateMortgage(principal, rate, 10),
      fifteenYear: calculateMortgage(principal, rate, 15)
    });

  }, [data.homeType, data.bedrooms, data.isIdeal, data.hasWell, data.hasSeptic, data.hasElectric, data.wantsPark, applicantData]);

  const openInGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const OptionCard = ({ active, onClick, icon, title, desc }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-6 border-2 rounded-3xl text-left transition-all group relative overflow-hidden ${
        active 
          ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-600/10' 
          : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500'
      }`}>
        {icon}
      </div>
      <h4 className={`font-black text-lg ${active ? 'text-blue-900' : 'text-slate-900'}`}>{title}</h4>
      <p className={`text-xs mt-1 ${active ? 'text-blue-700' : 'text-slate-500'}`}>{desc}</p>
      {active && (
        <div className="absolute top-4 right-4 text-blue-600 text-xl">
          <i className="fa-solid fa-circle-check"></i>
        </div>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in max-w-6xl mx-auto">
      <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Icons.Home /> {language === 'English' ? 'Home Customizer' : 'Personalizador de Vivienda'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {language === 'English' 
              ? 'Visualize your home and get a realistic cost estimate.' 
              : 'Visualice su hogar y obtenga una estimación de costos realista.'}
          </p>
        </div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i> {strings.back}
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          
          {/* Step 1: Bedrooms */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">1</span>
              {language === 'English' ? 'How many bedrooms?' : '¿Cuántas recámaras?'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {['1', '2', '3', '4', '5+'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setData({...data, bedrooms: num})}
                  className={`py-4 rounded-2xl border-2 font-black transition-all ${
                    data.bedrooms === num 
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' 
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {num} {language === 'English' ? 'Bed' : 'Hab'}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Quality Level */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">2</span>
              {language === 'English' ? 'Quality Level' : 'Nivel de Calidad'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OptionCard 
                active={data.isIdeal}
                onClick={() => setData({...data, isIdeal: true})}
                icon={<i className="fa-solid fa-star"></i>}
                title={language === 'English' ? 'Ideal (Premium)' : 'Ideal (Premium)'}
                desc={language === 'English' ? 'Upgraded appliances, flooring, and finishes' : 'Electrodomésticos, pisos y acabados mejorados'}
              />
              <OptionCard 
                active={!data.isIdeal}
                onClick={() => setData({...data, isIdeal: false})}
                icon={<i className="fa-solid fa-leaf"></i>}
                title={language === 'English' ? 'Bare Minimum (Value)' : 'Mínimo Indispensable (Valor)'}
                desc={language === 'English' ? 'Standard features for maximum affordability' : 'Características estándar para máxima asequibilidad'}
              />
            </div>
          </section>

          {/* Step 3: Location & Utilities */}
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">3</span>
              {language === 'English' ? 'Location & Utilities' : 'Ubicación y Servicios'}
            </h3>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">{language === 'English' ? 'Placing in a Mobile Home Park?' : '¿Colocar en un parque de casas móviles?'}</label>
                <button 
                  type="button"
                  onClick={() => setData({...data, wantsPark: !data.wantsPark})}
                  className={`w-14 h-8 rounded-full transition-all relative ${data.wantsPark ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${data.wantsPark ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {data.wantsPark ? (
                <div className="space-y-6 pt-4 border-t border-slate-200 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <i className="fa-solid fa-map-location-dot text-blue-600"></i>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                          {language === 'English' ? 'Available Parks in Oklahoma City Area' : 'Parques Disponibles en el Área de Oklahoma City'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {MOBILE_HOME_PARKS.map((park, i) => (
                          <div 
                            key={i} 
                            onMouseEnter={() => setHoveredPark(park)}
                            onMouseLeave={() => setHoveredPark(null)}
                            onClick={() => openInGoogleMaps(park.address)}
                            className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center gap-4 group ${
                              hoveredPark?.name === park.name ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10' : 'border-slate-100 shadow-sm'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{park.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{park.address}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[10px] font-black text-blue-600">{park.phone}</p>
                              <p className="text-[8px] text-slate-300 mt-1 uppercase font-bold group-hover:text-blue-400">View Map <i className="fa-solid fa-external-link text-[6px]"></i></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                        {language === 'English' ? 'Park Photo Preview' : 'Vista Previa de la Foto del Parque'}
                      </p>
                      <div className="aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl">
                        {/* Dynamic Photo Placeholder */}
                        <div className="absolute inset-0 transition-all duration-500 transform scale-105">
                          <img 
                            src={hoveredPark 
                              ? hoveredPark.photoUrl
                              : "https://picsum.photos/seed/okc-neighborhood/600/600"
                            } 
                            alt="Park Preview" 
                            className="w-full h-full object-cover opacity-60"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
                          {hoveredPark ? (
                            <div className="animate-fade-in space-y-3 w-full">
                              <div className="bg-slate-800/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700 shadow-xl">
                                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Park Photo</p>
                                <p className="text-xl font-black text-white leading-tight">{hoveredPark.name}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{hoveredPark.address}</p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInGoogleMaps(hoveredPark.address);
                                  }}
                                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2 mx-auto"
                                >
                                  <i className="fa-solid fa-map-location-dot"></i> View on Google Maps
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 mb-12">
                              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-700 mx-auto">
                                <i className="fa-solid fa-image text-xl"></i>
                              </div>
                              <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hover over a park to see photos</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Photo Badge */}
                        <div className="absolute top-4 right-4 bg-blue-600/80 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border border-blue-400/30 backdrop-blur-sm">Verified Photo</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 italic">
                    {language === 'English' 
                      ? '*Contact parks directly for lot availability and monthly lot rent pricing.' 
                      : '*Contacte a los parques directamente para disponibilidad de lotes y precios de alquiler mensual.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-200 animate-fade-in">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'English' ? 'Do you have these on your land?' : '¿Tiene estos en su terreno?'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'hasWell', label: language === 'English' ? 'Well' : 'Pozo', icon: 'fa-faucet' },
                      { key: 'hasSeptic', label: language === 'English' ? 'Septic' : 'Séptico', icon: 'fa-toilet' },
                      { key: 'hasElectric', label: language === 'English' ? 'Electric' : 'Eléctrico', icon: 'fa-bolt' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setData({...data, [item.key]: !data[item.key as keyof CustomizationData]})}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                          data[item.key as keyof CustomizationData] 
                            ? 'border-green-600 bg-green-50 text-green-700' 
                            : 'border-slate-200 bg-white text-slate-500'
                        }`}
                      >
                        <i className={`fa-solid ${item.icon}`}></i>
                        <span className="font-bold text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Appointment CTA */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-3xl shrink-0">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black mb-2">{language === 'English' ? 'Want to see our homes in person?' : '¿Quiere ver nuestras casas en persona?'}</h3>
                <p className="text-blue-100 text-sm mb-6">{language === 'English' ? 'Schedule a visit to our Oklahoma City lot and walk through our latest models.' : 'Programe una visita a nuestro lote de Oklahoma City y recorra nuestros últimos modelos.'}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button 
                    onClick={onGoToAppointment}
                    className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg"
                  >
                    {language === 'English' ? 'Schedule Visit' : 'Programar Visita'}
                  </button>
                  <a 
                    href={`tel:${MOBILE_HOME_PARKS[0].phone}`}
                    className="bg-blue-500/30 border border-white/30 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-500/40 transition-all"
                  >
                    {language === 'English' ? 'Call Sales' : 'Llamar a Ventas'}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Cost Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-8 shadow-2xl shadow-slate-900/50">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <i className="fa-solid fa-calculator text-blue-400"></i>
              {language === 'English' ? 'Cost Estimate' : 'Estimación de Costos'}
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{data.bedrooms} {language === 'English' ? 'Bedroom' : 'Recámara'} Base</span>
                <span className="font-bold">${getHomeBasePrice(data.bedrooms, data.isIdeal).toLocaleString()}</span>
              </div>
              
              {!data.wantsPark ? (
                <>
                  {!data.hasWell && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Well Installation</span>
                      <span className="font-bold text-blue-400">+${costs.well.toLocaleString()}</span>
                    </div>
                  )}
                  {!data.hasSeptic && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Septic System</span>
                      <span className="font-bold text-blue-400">+${costs.septic.toLocaleString()}</span>
                    </div>
                  )}
                  {!data.hasElectric && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Electric Hookup</span>
                      <span className="font-bold text-blue-400">+${costs.electric.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Park Setup</span>
                  <span className="font-bold text-blue-400">+${costs.parkSetup.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-6 mb-8">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{language === 'English' ? 'Estimated Total' : 'Total Estimado'}</p>
              <p className="text-5xl font-black text-white">${data.estimatedTotal.toLocaleString()}</p>
            </div>

            {/* Down Payment Info */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{language === 'English' ? 'Estimated Down Payment' : 'Enganche Estimado'}</span>
                <span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">{downPaymentInfo.source}</span>
              </div>
              <p className="text-3xl font-black text-blue-400">${downPaymentInfo.amount.toLocaleString()}</p>
              {!applicantData && (
                <p className="text-[10px] text-yellow-400/80 mt-2 italic">
                  {language === 'English' 
                    ? '*Fill out the credit application for a more accurate down payment estimate.' 
                    : '*Complete la solicitud de crédito para una estimación de enganche más precisa.'}
                </p>
              )}
            </div>

            {/* Mortgage Calculator */}
            <div className="space-y-4 mb-8">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-clock"></i>
                {language === 'English' ? 'Monthly Payment Options (8.3% APR)' : 'Opciones de Pago Mensual (8.3% APR)'}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: '6 Years', val: mortgageEstimates.sixYear },
                  { label: '10 Years', val: mortgageEstimates.tenYear },
                  { label: '15 Years', val: mortgageEstimates.fifteenYear }
                ].map((term) => (
                  <div key={term.label} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-300">{term.label}</span>
                    <span className="text-xl font-black text-white">${term.val.toLocaleString()}<span className="text-[10px] text-slate-500 ml-1">/mo</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => onSubmit(data)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                {language === 'English' ? 'Save & Continue' : 'Guardar y Continuar'} <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button 
                onClick={onBack}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <i className="fa-solid fa-arrow-left"></i> {strings.back}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCustomizer;
