
import React, { useState } from 'react';
import { ApplicationData, PaymentAuthData, Language } from '../types';
import { t } from '../constants';

interface Props {
  applicant: ApplicationData;
  language: Language;
  onSubmit: (data: PaymentAuthData) => void;
  onBack: () => void;
}

const PaymentAuthForm: React.FC<Props> = ({ applicant, language, onSubmit, onBack }) => {
  const strings = t(language);
  const [formData, setFormData] = useState<PaymentAuthData>({
    customerName: applicant?.name || '',
    billingAddress: applicant?.currentAddress || '',
    zipCode: '',
    cardType: 'Visa',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    isRecurring: false
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50 text-center">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Payment Authorization Form</h2>
        </div>

        <div className="p-8 md:p-12 space-y-10">
          {/* Earnest Deposit Note */}
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-center gap-4 text-blue-800 print:hidden">
            <i className="fa-solid fa-credit-card text-2xl text-blue-500"></i>
            <p className="text-sm font-bold">
              {language === 'English' 
                ? "Safe & Secure: No charges will be processed today. This authorization confirms your intent to proceed." 
                : "Seguro y Protegido: No se procesarán cargos hoy. Esta autorización confirma su intención de proceder."}
            </p>
          </div>

          {/* Section 1: Merchant Information */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">SECTION 1 - Merchant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant Name</p>
                <p className="font-bold text-slate-900">Heritage Housing</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant Phone</p>
                <p className="font-bold text-slate-900">405-601-5650</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant Address</p>
                <p className="font-bold text-slate-900">6220 S Shields Blvd, Oklahoma City, OK 73149</p>
              </div>
            </div>
          </section>

          {/* Section 2: Authorization Agreement */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">SECTION 2 - Authorization Agreement</h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-slate-800 font-medium">
                <span>I,</span>
                <span className="border-b-2 border-slate-900 px-4 font-black text-blue-900">{formData.customerName}</span>
                <span>authorize Heritage Housing to charge my:</span>
              </div>
              
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isRecurring === false ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                    {formData.isRecurring === false && <div className="w-3 h-3 rounded-full bg-blue-600"></div>}
                  </div>
                  <input type="radio" className="hidden" checked={!formData.isRecurring} onChange={() => setFormData({...formData, isRecurring: false})} />
                  <span className="font-bold text-slate-700 group-hover:text-blue-600">One-time payment</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isRecurring === true ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                    {formData.isRecurring === true && <div className="w-3 h-3 rounded-full bg-blue-600"></div>}
                  </div>
                  <input type="radio" className="hidden" checked={formData.isRecurring} onChange={() => setFormData({...formData, isRecurring: true})} />
                  <span className="font-bold text-slate-700 group-hover:text-blue-600">Recurring basis</span>
                </label>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</label>
                    <input 
                      type="text" 
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-white px-2 rounded-t-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Address</label>
                    <input 
                      type="text" 
                      value={formData.billingAddress}
                      onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                      className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-white px-2 rounded-t-md"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                    <input 
                      type="text" 
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-white px-2 rounded-t-md"
                      placeholder="73149"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Credit Card Information */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] border-b border-blue-50 pb-2">SECTION 3 - Card Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Type</label>
                  <select 
                    value={formData.cardType}
                    onChange={(e) => setFormData({...formData, cardType: e.target.value as any})}
                    className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-slate-50 px-2 rounded-t-md"
                  >
                    <option>Visa</option>
                    <option>MasterCard</option>
                    <option>American Express</option>
                    <option>Discover</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Number</label>
                  <input 
                    type="text" 
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-slate-50 px-2 rounded-t-md"
                    placeholder="**** **** **** ****"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiration (MM/YYYY)</label>
                  <input 
                    type="text" 
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                    className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-slate-50 px-2 rounded-t-md"
                    placeholder="01/2028"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CVV</label>
                  <input 
                    type="password" 
                    value={formData.cvv}
                    onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                    className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-slate-50 px-2 rounded-t-md"
                    placeholder="***"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100">
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs">
              <i className="fa-solid fa-shield-halved mt-1"></i>
              <p>
                By signing below, you authorize Heritage Housing to charge the card indicated in this form according to the terms outlined above. This authorization is for the services described in your application.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 print:hidden">
        <button 
          onClick={onBack}
          className="w-full sm:w-auto text-slate-400 hover:text-slate-600 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <div className="flex gap-4 w-full sm:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none bg-white border-2 border-slate-200 hover:border-slate-900 text-slate-900 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-print"></i> PRINT
          </button>
          <button 
            onClick={() => onSubmit(formData)}
            className="flex-[2] sm:flex-none bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-slate-200 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            SUBMIT FINAL APPLICATION <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentAuthForm;
