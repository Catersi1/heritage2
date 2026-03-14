
import React, { useState } from 'react';
import { ApplicationData, DepositReceiptData, Language } from '../types';
import { t } from '../constants';

interface Props {
  applicant: ApplicationData;
  language: Language;
  onSubmit: (data: DepositReceiptData) => void;
  onBack: () => void;
}

const DepositReceiptForm: React.FC<Props> = ({ applicant, language, onSubmit, onBack }) => {
  const strings = t(language);
  const [formData, setFormData] = useState<DepositReceiptData>({
    date: new Date().toLocaleDateString(),
    customerName: applicant?.name || '',
    address: applicant?.currentAddress || '',
    phone: applicant?.phone || '',
    modelNum: applicant?.customization?.homeType || '',
    serialNum: '',
    amount: Number(applicant?.downPayment) || 0,
    paymentMethod: 'Check',
    signature: applicant?.signature || ''
  });

  const handlePrint = () => {
    window.print();
  };

  const renderSignature = (sig?: string) => {
    if (!sig) return <span className="text-slate-400 italic">No signature</span>;
    if (sig.includes('|')) {
      const [name, fontClass] = sig.split('|');
      return <span className={`text-2xl ${fontClass} text-blue-900`}>{name}</span>;
    }
    return <img src={sig} alt="Signature" className="h-12 inline-block" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        {/* Header with Logos */}
        <div className="p-8 border-b border-slate-100 bg-white flex flex-col items-center space-y-6">
          <div className="flex justify-center items-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="bg-yellow-400 text-black font-black px-2 py-1 text-xs uppercase italic">Tiny House</div>
              <div className="bg-black text-white font-black px-2 py-1 text-xs uppercase tracking-widest">Outlet</div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-0.5 bg-yellow-500 mb-1"></div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">HERITAGE</h1>
                <p className="text-[8px] font-black tracking-[0.4em] text-slate-500 ml-1">HOUSING</p>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-serif italic text-blue-700 leading-none">Legacy</h1>
              <p className="text-[8px] font-black tracking-widest text-blue-900">HOUSING</p>
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight border-t border-slate-200 pt-4 w-full text-center">Deposit Receipt</h2>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          {/* Earnest Deposit Note */}
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-center gap-4 text-amber-800 print:hidden">
            <i className="fa-solid fa-circle-info text-2xl text-amber-500"></i>
            <p className="text-sm font-bold">
              {language === 'English' 
                ? "Note: You will NOT be charged today. This form prioritizes your application." 
                : "Nota: NO se le cobrará hoy. Este formulario prioriza su solicitud."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                <div className="border-b-2 border-slate-200 py-2 font-bold text-slate-800">{formData.date}</div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</label>
                <div className="border-b-2 border-slate-200 py-2 font-bold text-slate-800">{formData.customerName}</div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                <div className="border-b-2 border-slate-200 py-2 font-bold text-slate-800">{formData.address}</div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                <div className="border-b-2 border-slate-200 py-2 font-bold text-slate-800">{formData.phone}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model #</label>
                  <input 
                    type="text" 
                    value={formData.modelNum}
                    onChange={(e) => setFormData({...formData, modelNum: e.target.value})}
                    className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-slate-50 px-2 rounded-t-md"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial #</label>
                  <input 
                    type="text" 
                    value={formData.serialNum}
                    onChange={(e) => setFormData({...formData, serialNum: e.target.value})}
                    className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-slate-50 px-2 rounded-t-md"
                    placeholder="TBD"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount $</label>
                <div className="border-b-2 border-slate-200 py-2 font-black text-2xl text-green-700">${formData.amount.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
                <select 
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full border-b-2 border-slate-200 py-2 font-bold text-slate-800 focus:border-blue-500 outline-none bg-slate-50 px-2 rounded-t-md"
                >
                  <option>Check</option>
                  <option>Cash</option>
                  <option>Credit Card</option>
                  <option>Money Order</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Signature</label>
                <div className="border-b-2 border-slate-900 pb-2 min-h-[60px] flex items-end">
                  {renderSignature(formData.signature)}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heritage Housing Signature</label>
                <div className="border-b-2 border-slate-300 pb-2 min-h-[60px] flex items-end italic text-slate-300">
                  Authorized Representative
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-[11px] leading-relaxed text-slate-600 space-y-4">
            <p>
              You have the right to demand a refund of the deposit or down payment, and receive that refund within 15 days thereafter, if you timely and properly rescind the sales purchase contract. A retailer may keep up to 5% of the estimated cash price if the consumer specially orders from the manufacturer a manufactured home that is not in the retailer’s inventory, the home conforms to the specifications of the special order and any representations made to the consumer, the consumer fails or refuses to accept delivery and installation of the home by the retailer, and the consumer was given conspicuous written notice of the requirements for retaining the deposit.
            </p>
            <p>
              A retailer may deduct from your deposit or down payment for any expenses incurred by the retailer if you contract with the retailer to arrange for services that are performed by an appraiser of real property or a title company in connection with real property that will be included in the purchase or when real property is pledged by you as collateral for the purchase of the manufactured home. The retailer must provide notice of laws relating to rescission and real property appraisal and title work expenses before signing the contract for real property appraisal and title work services. The retailer must also provide an itemized list of the specific real property appraisal and title work expenses incurred by the retailer.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col items-center text-center space-y-1">
            <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Heritage Housing of OKC</p>
            <p className="text-xs text-slate-500">6220 S. Shields Blvd. Oklahoma City, OK 73149</p>
            <p className="text-xs font-bold text-blue-600">405-601-5650</p>
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
            className="flex-[2] sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-200 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            NEXT: PAYMENT AUTH <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositReceiptForm;
