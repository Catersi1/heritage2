
import React, { useRef, useState } from 'react';
import { ApplicationData, EarnestDepositData, Language } from '../types';
import { Icons, t } from '../constants';
import SignatureFontPicker from './SignatureFontPicker';

const InputLabel = ({ text }: { text: string }) => (
  <label className="text-sm font-semibold text-slate-700 block mb-1">{text}</label>
);

interface Props {
  onSubmit: (data: EarnestDepositData | null) => void;
  onBack: () => void;
  language: Language;
  applicantData?: ApplicationData;
  initialData?: EarnestDepositData | null;
}

const EarnestDepositForm: React.FC<Props> = ({ onSubmit, onBack, language, applicantData, initialData }) => {
  const strings = t(language);
  const creditCardSignatureRef = useRef('');
  const depositSignatureRef = useRef('');
  const [creditCard, setCreditCard] = useState(() => {
    const cc = initialData?.creditCardAuth;
    return {
      nameOnCard: cc?.nameOnCard ?? '',
      cardNumber: cc?.cardNumber ?? '',
      expDate: cc?.expDate ?? '',
      billingAddress: cc?.billingAddress ?? applicantData?.currentAddress ?? '',
      amountAuthorized: cc?.amountAuthorized ?? '1000',
      signature: cc?.signature ?? '',
      date: cc?.date ?? new Date().toISOString().slice(0, 10)
    };
  });
  const [depositReceipt, setDepositReceipt] = useState(() => {
    const dr = initialData?.depositReceipt;
    return {
      date: dr?.date ?? new Date().toISOString().slice(0, 10),
      customer: dr?.customer ?? applicantData?.name ?? '',
      address: dr?.address ?? applicantData?.currentAddress ?? '',
      phone: dr?.phone ?? applicantData?.phone ?? '',
      modelNumber: dr?.modelNumber ?? '',
      serialNumber: dr?.serialNumber ?? '',
      amount: dr?.amount ?? '1000',
      customerSignature: dr?.customerSignature ?? ''
    };
  });

  const handleSkip = () => {
    onSubmit(null);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const trim = (s: string) => (s || '').trim();
    const cardDigits = (creditCard.cardNumber || '').replace(/\D/g, '');
    const cc = {
      nameOnCard: trim(creditCard.nameOnCard),
      cardNumber: cardDigits,
      expDate: trim(creditCard.expDate),
      billingAddress: trim(creditCard.billingAddress),
      amountAuthorized: trim(creditCard.amountAuthorized),
      signature: creditCard.signature || creditCardSignatureRef.current
    };
    const missingCc: string[] = [];
    if (!cc.nameOnCard) missingCc.push(language === 'English' ? 'Name on card' : 'Nombre en la tarjeta');
    if (cc.cardNumber.length < 15) missingCc.push(language === 'English' ? 'Card number (full number, 15–19 digits)' : 'Número de tarjeta (número completo, 15–19 dígitos)');
    if (!cc.expDate) missingCc.push(language === 'English' ? 'Expiration date' : 'Fecha de vencimiento');
    if (!cc.billingAddress) missingCc.push(language === 'English' ? 'Billing address' : 'Dirección de facturación');
    if (!cc.amountAuthorized) missingCc.push(language === 'English' ? 'Amount authorized' : 'Monto autorizado');
    if (!cc.signature) missingCc.push(language === 'English' ? 'Credit card signature' : 'Firma de autorización de tarjeta');
    if (missingCc.length > 0) {
      alert((language === 'English' ? 'Please complete: ' : 'Por favor complete: ') + missingCc.join(', '));
      return;
    }
    const dr = {
      customer: trim(depositReceipt.customer),
      address: trim(depositReceipt.address),
      phone: trim(depositReceipt.phone),
      amount: trim(depositReceipt.amount),
      customerSignature: depositReceipt.customerSignature || depositSignatureRef.current
    };
    const missingDr: string[] = [];
    if (!dr.customer) missingDr.push(language === 'English' ? 'Customer name' : 'Cliente');
    if (!dr.address) missingDr.push(language === 'English' ? 'Address' : 'Dirección');
    if (!dr.phone) missingDr.push(language === 'English' ? 'Phone' : 'Teléfono');
    if (!dr.amount) missingDr.push(language === 'English' ? 'Deposit amount' : 'Monto del depósito');
    if (!dr.customerSignature) missingDr.push(language === 'English' ? 'Deposit receipt signature' : 'Firma del recibo');
    if (missingDr.length > 0) {
      alert((language === 'English' ? 'Please complete: ' : 'Por favor complete: ') + missingDr.join(', '));
      return;
    }
    const data: EarnestDepositData = {
      creditCardAuth: {
        nameOnCard: creditCard.nameOnCard,
        cardNumber: (creditCard.cardNumber || '').replace(/\D/g, ''),
        expDate: creditCard.expDate,
        billingAddress: creditCard.billingAddress,
        amountAuthorized: creditCard.amountAuthorized,
        signature: creditCard.signature || creditCardSignatureRef.current,
        date: creditCard.date
      },
      depositReceipt: {
        date: depositReceipt.date,
        customer: depositReceipt.customer,
        address: depositReceipt.address,
        phone: depositReceipt.phone,
        modelNumber: depositReceipt.modelNumber,
        serialNumber: depositReceipt.serialNumber,
        amount: depositReceipt.amount,
        customerSignature: depositReceipt.customerSignature || depositSignatureRef.current
      }
    };
    onSubmit(data);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in pb-20">
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-3 px-4 flex justify-center safe-area-pb">
        <button
          type="button"
          onClick={handleSkip}
          className="border-2 border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-colors"
        >
          {strings.nextStep} <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Icons.File /> {strings.earnestTitle}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{strings.earnestSubtitle}</p>
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 p-2 transition-colors">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
      </div>

      <div className="p-8 space-y-10 pb-12">
        {/* Notice */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
            <Icons.Warning /> {strings.earnestNoticeTitle}
          </h3>
          <p className="text-amber-800 text-sm leading-relaxed">{strings.earnestNoticeP1}</p>
          <p className="text-amber-800 text-sm leading-relaxed">{strings.earnestNoticeP2}</p>
        </section>

        {/* Credit Card Payment Authorization */}
        <section className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-800 text-white px-6 py-4">
            <h3 className="text-lg font-bold">{strings.creditCardAuthTitle}</h3>
            <p className="text-slate-300 text-xs mt-1">Heritage Housing of OKC · 6220 S. Shields Blvd. Oklahoma City, OK 73149 · 405-601-5650</p>
          </div>
          <form id="earnest-form" onSubmit={handleSubmitDeposit} className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'English'
                ? 'I authorize Heritage Housing to charge the amount indicated below to the card provided. This authorization is for an earnest deposit and will be processed per our agreement. Nothing will be charged without further authorization for the actual transaction.'
                : 'Autorizo a Heritage Housing a cobrar el monto indicado abajo a la tarjeta proporcionada. Esta autorización es para un depósito de seriedad y se procesará según nuestro acuerdo. No se cobrará nada sin autorización adicional para la transacción real.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputLabel text={strings.nameOnCard} />
                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={creditCard.nameOnCard} onChange={e => setCreditCard({ ...creditCard, nameOnCard: e.target.value })} />
              </div>
              <div>
                <InputLabel text={strings.cardNumber} />
                <input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" maxLength={19} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={creditCard.cardNumber}
                  onChange={e => setCreditCard({ ...creditCard, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 19) })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputLabel text={strings.expDate} />
                <input type="text" placeholder="MM/YY" maxLength={5} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={creditCard.expDate} onChange={e => setCreditCard({ ...creditCard, expDate: e.target.value })} />
              </div>
              <div>
                <InputLabel text={strings.amountAuthorized} />
                <input type="text" inputMode="numeric" readOnly className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 cursor-not-allowed"
                  value={creditCard.amountAuthorized} />
              </div>
            </div>
            <div>
              <InputLabel text={strings.billingAddress} />
              <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={creditCard.billingAddress} onChange={e => setCreditCard({ ...creditCard, billingAddress: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputLabel text={language === 'English' ? 'Date' : 'Fecha'} />
                <input type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={creditCard.date} onChange={e => setCreditCard({ ...creditCard, date: e.target.value })} />
              </div>
            </div>
            <SignatureFontPicker
              initialName={applicantData?.name ?? creditCard.nameOnCard}
              initialSignature={creditCard.signature}
              label={strings.customerSignature}
              clearLabel={language === 'English' ? 'Clear' : 'Borrar'}
              hintText={strings.signatureHint}
              useButtonText={strings.useSignatureButton}
              signatureHeading={strings.signatureHeading}
              onSave={(dataUrl) => {
                creditCardSignatureRef.current = dataUrl;
                setCreditCard(prev => ({ ...prev, signature: dataUrl }));
              }}
              onClear={() => {
                creditCardSignatureRef.current = '';
                setCreditCard(prev => ({ ...prev, signature: '' }));
              }}
            />
          </form>
        </section>

        {/* Deposit Receipt */}
        <section className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-800 text-white px-6 py-4">
            <h3 className="text-lg font-bold">{strings.depositReceiptTitle}</h3>
            <p className="text-slate-300 text-xs mt-1">Heritage Housing of OKC · 6220 S. Shields Blvd. Oklahoma City, OK 73149 · 405-601-5650</p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'English'
                ? 'You have the right to demand a refund of the deposit within 15 days if you timely and properly rescind the sales purchase contract. A retailer may keep up to 5% of the estimated cash price under certain conditions per state law.'
                : 'Tiene derecho a solicitar el reembolso del depósito en un plazo de 15 días si rescinde el contrato de compraventa a tiempo y correctamente.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputLabel text={strings.depositDate} />
                <input type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={depositReceipt.date} onChange={e => setDepositReceipt({ ...depositReceipt, date: e.target.value })} />
              </div>
              <div>
                <InputLabel text={strings.depositCustomer} />
                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={depositReceipt.customer} onChange={e => setDepositReceipt({ ...depositReceipt, customer: e.target.value })} />
              </div>
            </div>
            <div>
              <InputLabel text={strings.depositAddress} />
              <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={depositReceipt.address} onChange={e => setDepositReceipt({ ...depositReceipt, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputLabel text={strings.depositPhone} />
                <input type="tel" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={depositReceipt.phone} onChange={e => setDepositReceipt({ ...depositReceipt, phone: e.target.value })} />
              </div>
              <div>
                <InputLabel text={strings.modelNumber} />
                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={depositReceipt.modelNumber} onChange={e => setDepositReceipt({ ...depositReceipt, modelNumber: e.target.value })} />
              </div>
              <div>
                <InputLabel text={strings.serialNumber} />
                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={depositReceipt.serialNumber} onChange={e => setDepositReceipt({ ...depositReceipt, serialNumber: e.target.value })} />
              </div>
            </div>
            <div>
              <InputLabel text={strings.depositAmount} />
              <input type="text" inputMode="numeric" readOnly className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 cursor-not-allowed"
                value={depositReceipt.amount} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">{strings.heritageHousingSig}</p>
              <div className="h-12 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm bg-slate-50">
                —
              </div>
            </div>
            <SignatureFontPicker
              initialName={depositReceipt.customer || applicantData?.name}
              initialSignature={depositReceipt.customerSignature}
              label={strings.customerSignature}
              clearLabel={language === 'English' ? 'Clear' : 'Borrar'}
              hintText={strings.signatureHint}
              useButtonText={strings.useSignatureButton}
              signatureHeading={strings.signatureHeading}
              onSave={(dataUrl) => {
                depositSignatureRef.current = dataUrl;
                setDepositReceipt(prev => ({ ...prev, customerSignature: dataUrl }));
              }}
              onClear={() => {
                depositSignatureRef.current = '';
                setDepositReceipt(prev => ({ ...prev, customerSignature: '' }));
              }}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button type="button" onClick={handleSkip}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all">
            {strings.skipForNow}
          </button>
          <button type="submit" form="earnest-form"
            className="flex-[2] font-black py-4 px-6 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-xl transition-all flex items-center justify-center gap-2">
            {strings.submitDeposit} <i className="fa-solid fa-check"></i>
          </button>
        </div>

        </div>
    </div>
  );
};

export default EarnestDepositForm;
