/**
 * Build full HTML documents for printing in a new window (works in Safari).
 * Used by Dashboard for "Print Application" and "Print Deposit Forms".
 */

import type { LeadApplication, EarnestDepositData } from './types';

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const HERITAGE_NAME = 'Heritage Housing';
const HERITAGE_ADDRESS = '6220 S. Shields Blvd. · Oklahoma City, OK 73149';
const HERITAGE_PHONE = '405-601-5650';

export function buildApplicationPrintHtml(app: LeadApplication): string {
  const a = app.applicant;
  const c = app.cosigner;
  const sigA = a.signature ? `<img src="${esc(a.signature)}" alt="" style="height:2.5rem;max-width:100%;object-fit:contain;" />` : '';
  const sigC = c?.signature ? `<img src="${esc(c.signature)}" alt="" style="height:2.5rem;max-width:100%;object-fit:contain;" />` : '';
  const docsHtml = app.documents.length > 0 
    ? app.documents.map(d => `<span style="border:1px solid #333;padding:4px 10px;font-size:10px;font-weight:600;text-transform:uppercase;margin:3px;display:inline-block;background:#f9f9f9;">${esc(d.name)}</span>`).join('')
    : '<span style="font-style:italic;color:#666;">No documents uploaded</span>';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Credit Application - ${esc(app.id)}</title>
<style>
@page { size: letter; margin: 0.5in; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; background: #fff; line-height: 1.4; }
body { width: 7.5in; min-height: 10in; padding: 0; }
.header { text-align: center; border: 3px double #1e40af; padding: 15px; margin-bottom: 20px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
.header h1 { font-size: 24pt; font-weight: bold; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; color: #1e3a8a; }
.header .subtitle { font-size: 12pt; font-weight: bold; margin: 0; color: #1e40af; }
.header .contact { font-size: 10pt; margin-top: 5px; color: #374151; }
.app-id { text-align: right; margin-bottom: 15px; font-size: 10pt; padding: 8px; background: #f3f4f6; border-left: 4px solid #1e40af; }
.app-id strong { font-size: 14pt; color: #1e40af; }
.section { margin-bottom: 20px; border: 2px solid #1e40af; padding: 12px; background: #fafafa; }
.section-title { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #fff; font-size: 11pt; font-weight: bold; padding: 8px 12px; text-transform: uppercase; margin: -12px -12px 12px -12px; letter-spacing: 1px; border-bottom: 2px solid #1e3a8a; }
.field-row { display: flex; margin-bottom: 10px; align-items: baseline; background: #fff; padding: 4px; border-radius: 3px; }
.field-label { font-weight: bold; min-width: 140px; font-size: 10pt; text-transform: uppercase; color: #1e40af; }
.field-value { border-bottom: 2px solid #1e40af; flex: 1; min-height: 20px; padding-left: 5px; font-size: 11pt; background: #fff; }
.field-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field-row-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.score-box { display: flex; border: 3px solid #1e40af; margin-bottom: 20px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; overflow: hidden; }
.score-item { flex: 1; text-align: center; padding: 15px; border-right: 2px solid #1e40af; }
.score-item:last-child { border-right: none; }
.score-label { font-size: 9pt; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: #1e40af; }
.score-value { font-size: 20pt; font-weight: bold; color: #1e3a8a; }
.signature-section { margin-top: 30px; border-top: 3px solid #1e40af; padding-top: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 20px; border-radius: 8px; }
.signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 25px; }
.signature-box { text-align: center; background: #fff; padding: 15px; border: 2px solid #1e40af; border-radius: 8px; }
.signature-line { border-bottom: 2px solid #1e40af; min-height: 50px; margin-bottom: 10px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px; background: #f8fafc; }
.signature-label { font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #1e40af; }
.official-use { border: 3px solid #1e40af; padding: 20px; margin-top: 20px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; }
.official-use-title { font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1e40af; margin-bottom: 15px; padding-bottom: 10px; color: #1e40af; font-size: 12pt; }
.checkbox-row { display: flex; align-items: center; margin-bottom: 10px; background: #fff; padding: 8px; border-radius: 4px; }
.checkbox { width: 18px; height: 18px; border: 2px solid #1e40af; margin-right: 10px; display: inline-block; background: #fff; }
.footer { margin-top: 30px; text-align: center; font-size: 9pt; font-style: italic; border-top: 3px solid #1e40af; padding-top: 15px; color: #1e40af; background: #f8fafc; padding: 15px; border-radius: 8px; }
</style>
</head>
<body>

<div class="header">
  <h1>${HERITAGE_NAME}</h1>
  <div class="subtitle">Official Credit Application</div>
  <div class="contact">${HERITAGE_ADDRESS} · Phone: ${HERITAGE_PHONE}</div>
</div>

<div class="app-id">
  <strong>Application ID: ${esc(app.id)}</strong><br>
  Date: ${esc(new Date(app.submittedAt).toLocaleDateString())} · Time: ${esc(new Date(app.submittedAt).toLocaleTimeString())}
</div>

<div class="score-box">
  <div class="score-item">
    <div class="score-label">Internal Score</div>
    <div class="score-value">${esc(String(a.internalScore))}/100</div>
  </div>
  <div class="score-item">
    <div class="score-label">Monthly Income</div>
    <div class="score-value">$${esc(String(a.monthlyIncome))}</div>
  </div>
  <div class="score-item">
    <div class="score-label">Down Payment</div>
    <div class="score-value">$${esc(String(a.downPayment))}</div>
  </div>
  <div class="score-item">
    <div class="score-label">Status</div>
    <div class="score-value" style="font-size: 12pt;">${esc(app.status)}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">I. Applicant Information</div>
  <div class="field-row-2">
    <div class="field-row">
      <span class="field-label">Full Name:</span>
      <span class="field-value">${esc(a.name)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">SSN:</span>
      <span class="field-value">${esc(a.ssn)}</span>
    </div>
  </div>
  <div class="field-row-2">
    <div class="field-row">
      <span class="field-label">Phone:</span>
      <span class="field-value">${esc(a.phone)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Date of Birth:</span>
      <span class="field-value">${esc(a.dob)}</span>
    </div>
  </div>
  <div class="field-row">
    <span class="field-label">Email Address:</span>
    <span class="field-value">${esc(a.email)}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Current Address:</span>
    <span class="field-value">${esc(a.currentAddress)}</span>
  </div>
  <div class="field-row-4">
    <div class="field-row">
      <span class="field-label">Years at Address:</span>
      <span class="field-value">${esc(a.yearsAtAddress)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Employment:</span>
      <span class="field-value">${esc(a.employmentStatus)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Years Employed:</span>
      <span class="field-value">${esc(a.yearsEmployed)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Repo History:</span>
      <span class="field-value">${esc(a.repoHistory)}</span>
    </div>
  </div>
  <div class="field-row-2">
    <div class="field-row">
      <span class="field-label">Employer:</span>
      <span class="field-value">${esc(a.employerName)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Job Title:</span>
      <span class="field-value">${esc(a.jobTitle)}</span>
    </div>
  </div>
</div>

${c ? `
<div class="section">
  <div class="section-title">II. Co-Signer Information (${esc(c.relationship)})</div>
  <div class="field-row-2">
    <div class="field-row">
      <span class="field-label">Full Name:</span>
      <span class="field-value">${esc(c.name)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">SSN:</span>
      <span class="field-value">${esc(c.ssn)}</span>
    </div>
  </div>
  <div class="field-row-2">
    <div class="field-row">
      <span class="field-label">Phone:</span>
      <span class="field-value">${esc(c.phone)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Monthly Income:</span>
      <span class="field-value">$${esc(String(c.monthlyIncome))}</span>
    </div>
  </div>
  <div class="field-row">
    <span class="field-label">Email:</span>
    <span class="field-value">${esc(c.email)}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Employer:</span>
    <span class="field-value">${esc(c.employerName)}</span>
  </div>
</div>
` : ''}

<div class="section">
  <div class="section-title">III. Property Requirements</div>
  <div class="field-row-4">
    <div class="field-row">
      <span class="field-label">Bedrooms:</span>
      <span class="field-value">${esc(a.bedrooms)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Land Status:</span>
      <span class="field-value">${esc(a.landStatus)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Utilities:</span>
      <span class="field-value">${esc(a.utilities)}</span>
    </div>
    <div class="field-row">
      <span class="field-label">Credit Estimate:</span>
      <span class="field-value">${esc(a.creditEstimate)}</span>
    </div>
  </div>
  <div class="field-row">
    <span class="field-label">Land Location:</span>
    <span class="field-value">${esc(a.landLocation)}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Target Payment:</span>
    <span class="field-value">$${esc(String(a.targetPayment))}</span>
  </div>
</div>

<div class="section">
  <div class="section-title">IV. Uploaded Documents</div>
  <div>${docsHtml}</div>
</div>

<div class="signature-section">
  <div class="signature-row">
    <div class="signature-box">
      <div class="signature-line">${sigA}</div>
      <div class="signature-label">Applicant Signature: ${esc(a.name)}</div>
      <div style="font-size: 9pt; margin-top: 5px;">Date: _______________</div>
    </div>
    ${c ? `
    <div class="signature-box">
      <div class="signature-line">${sigC}</div>
      <div class="signature-label">Co-Signer Signature: ${esc(c.name)}</div>
      <div style="font-size: 9pt; margin-top: 5px;">Date: _______________</div>
    </div>
    ` : '<div></div>'}
  </div>
</div>

<div class="official-use">
  <div class="official-use-title">For Office Use Only</div>
  <div class="field-row-2">
    <div class="field-row">
      <span class="field-label">Salesperson:</span>
      <span class="field-value"></span>
    </div>
    <div class="field-row">
      <span class="field-label">Manager Approval:</span>
      <span class="field-value"></span>
    </div>
  </div>
  <div class="checkbox-row">
    <span class="checkbox"></span>
    <span>Application Verified</span>
  </div>
  <div class="checkbox-row">
    <span class="checkbox"></span>
    <span>Credit Check Completed</span>
  </div>
  <div class="checkbox-row">
    <span class="checkbox"></span>
    <span>Documents Received</span>
  </div>
  <div class="checkbox-row">
    <span class="checkbox"></span>
    <span>Approved / Denied / Pending</span>
  </div>
</div>

<div class="footer">
  This is an official credit application document. All information provided is confidential and subject to verification.<br>
  ${HERITAGE_NAME} · ${HERITAGE_ADDRESS} · ${HERITAGE_PHONE}
</div>

</body>
</html>`;
}

/** Shared full-page wrapper: one form per page, uses full 8.5x11 letter. */
const PDF_PAGE_STYLE = `
*{box-sizing:border-box;}
html,body{margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#000;background:#fff;}
body{width:8.5in;height:11in;min-height:11in;padding:0.5in;display:flex;flex-direction:column;overflow:hidden;}
@media print{html,body{background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
.pdf-page-header{text-align:center;border-bottom:2px solid #000;padding:18px 24px;flex-shrink:0;}
.pdf-page-header h1{font-size:1.35rem;font-weight:700;margin:0;}
.pdf-page-header p{font-size:11px;margin:6px 0 0;}
.pdf-page-body{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:28px 24px 0;min-height:0;}
.pdf-title{font-size:1.05rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:24px;}
.pdf-notice{border-left:4px solid #64748b;padding-left:16px;margin-bottom:28px;font-size:12px;line-height:1.6;}
.pdf-notice-box{border:1px solid #475569;background:#f8fafc;padding:14px 18px;margin-bottom:28px;font-size:11px;line-height:1.5;font-style:italic;}
.pdf-table{width:100%;border-collapse:collapse;font-size:14px;}
.pdf-table td{padding:14px 0;vertical-align:top;}
.pdf-table td:first-child{padding-right:28px;}
.pdf-f-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;}
.pdf-f-value{border-bottom:1px solid #000;min-height:1.5rem;padding-bottom:4px;font-size:14px;}
.pdf-sig-line{border-bottom:1px solid #000;min-height:3rem;}
.pdf-spacer{flex:1;min-height:24px;}
`;

/** Credit Card Payment Authorization — single full page for PDF. */
export function buildCreditCardAuthPrintHtml(data: EarnestDepositData): string {
  const cc = data.creditCardAuth;
  const cardDisplay = cc.cardNumber ? `**** **** **** ${cc.cardNumber.slice(-4)}` : (cc as { cardLast4?: string }).cardLast4 ? `**** ${(cc as { cardLast4: string }).cardLast4}` : '—';
  const ccSig = cc.signature ? `<img src="${esc(cc.signature)}" alt="" style="max-height:2.25rem;object-fit:contain;" />` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Credit Card Authorization</title><style>${PDF_PAGE_STYLE}</style></head><body>
<div class="pdf-page-header"><h1>${HERITAGE_NAME}</h1><p>${HERITAGE_ADDRESS}</p><p><strong>Tel: ${HERITAGE_PHONE}</strong></p></div>
<div class="pdf-page-body">
<div>
<h2 class="pdf-title">Credit Card Payment Authorization</h2>
<div class="pdf-notice"><p>I authorize Heritage Housing to charge the amount indicated below to the card provided. This authorization is for an earnest deposit and will be processed per our agreement. Nothing will be charged without further authorization for the actual transaction.</p></div>
<table class="pdf-table"><tbody>
<tr><td style="width:50%;"><div class="pdf-f-label">Name on card</div><div class="pdf-f-value">${esc(cc.nameOnCard)}</div></td><td><div class="pdf-f-label">Card number (last 4)</div><div class="pdf-f-value">${esc(cardDisplay)}</div></td></tr>
<tr><td><div class="pdf-f-label">Expiration (MM/YY)</div><div class="pdf-f-value">${esc(cc.expDate)}</div></td><td><div class="pdf-f-label">Amount authorized ($)</div><div class="pdf-f-value">${esc(cc.amountAuthorized)}</div></td></tr>
<tr><td colspan="2"><div class="pdf-f-label">Billing address</div><div class="pdf-f-value">${esc(cc.billingAddress)}</div></td></tr>
<tr><td><div class="pdf-f-label">Date</div><div class="pdf-f-value">${esc(cc.date)}</div></td><td><div class="pdf-f-label">Customer signature</div><div class="pdf-sig-line">${ccSig || '&nbsp;'}</div></td></tr>
</tbody></table>
</div>
<div class="pdf-spacer"></div>
</div>
</body></html>`;
}

/** Deposit Receipt — single full page for PDF. */
export function buildDepositReceiptPrintHtml(data: EarnestDepositData): string {
  const dr = data.depositReceipt;
  const drSig = dr.customerSignature ? `<img src="${esc(dr.customerSignature)}" alt="" style="max-height:2.25rem;object-fit:contain;" />` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Deposit Receipt</title><style>${PDF_PAGE_STYLE}</style></head><body>
<div class="pdf-page-header"><h1>${HERITAGE_NAME}</h1><p>${HERITAGE_ADDRESS}</p><p><strong>Tel: ${HERITAGE_PHONE}</strong></p></div>
<div class="pdf-page-body">
<div>
<h2 class="pdf-title">Deposit Receipt</h2>
<div class="pdf-notice-box"><p>You have the right to demand a refund of the deposit or down payment, and receive that refund within 15 days thereafter, if you timely and properly rescind the sales purchase contract. A retailer may keep up to 5% of the estimated cash price under certain conditions.</p></div>
<table class="pdf-table"><tbody>
<tr><td style="width:50%;"><div class="pdf-f-label">Date</div><div class="pdf-f-value">${esc(dr.date)}</div></td><td><div class="pdf-f-label">Customer name</div><div class="pdf-f-value">${esc(dr.customer)}</div></td></tr>
<tr><td colspan="2"><div class="pdf-f-label">Address</div><div class="pdf-f-value">${esc(dr.address)}</div></td></tr>
<tr><td><div class="pdf-f-label">Phone</div><div class="pdf-f-value">${esc(dr.phone)}</div></td><td><div class="pdf-f-label">Model #</div><div class="pdf-f-value">${esc(dr.modelNumber)}</div></td></tr>
<tr><td><div class="pdf-f-label">Serial #</div><div class="pdf-f-value">${esc(dr.serialNumber)}</div></td><td><div class="pdf-f-label">Amount ($)</div><div class="pdf-f-value">${esc(dr.amount)}</div></td></tr>
<tr><td><div class="pdf-f-label">Customer signature</div><div class="pdf-sig-line">${drSig || '&nbsp;'}</div></td><td><div class="pdf-f-label">Heritage Housing (in person)</div><div class="pdf-sig-line">&nbsp;</div></td></tr>
</tbody></table>
</div>
<div class="pdf-spacer"></div>
</div>
</body></html>`;
}

export function buildDepositFormsPrintHtml(data: EarnestDepositData): string {
  const cc = data.creditCardAuth;
  const dr = data.depositReceipt;
  const cardDisplay = cc.cardNumber ? `**** **** **** ${cc.cardNumber.slice(-4)}` : (cc as { cardLast4?: string }).cardLast4 ? `**** ${(cc as { cardLast4: string }).cardLast4}` : '—';
  const ccSig = cc.signature ? `<img src="${esc(cc.signature)}" alt="" style="max-height:2rem;object-fit:contain;" />` : '';
  const drSig = dr.customerSignature ? `<img src="${esc(dr.customerSignature)}" alt="" style="max-height:2rem;object-fit:contain;" />` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Deposit Forms</title><style>
*{box-sizing:border-box;}
html,body{margin:0;padding:0.35in;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#000;background:#fff;}
body{width:8.5in;min-height:11in;}
@media print{html,body{background:#fff!important;color:#000!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
article{border:2px solid #000;margin-bottom:2rem;overflow:hidden;break-inside:avoid;page-break-after:always;}
article:last-child{margin-bottom:0;page-break-after:auto;}
.header{text-align:center;border-bottom:2px solid #000;padding:12px 24px;}
.header h1{font-size:1.125rem;font-weight:700;margin:0;}
.header p{font-size:11px;margin:4px 0 0;}
.body{padding:16px 24px;}
.title{font-size:1rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;text-align:center;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:12px;}
.notice{border-left:3px solid #64748b;padding-left:12px;margin-bottom:16px;font-size:11px;line-height:1.5;}
.notice-box{border:1px solid #475569;background:#f8fafc;padding:8px 12px;margin-bottom:16px;font-size:10px;line-height:1.4;font-style:italic;}
table{width:100%;border-collapse:collapse;font-size:13px;}
td{padding:6px 0;vertical-align:top;}
td:first-child{padding-right:24px;}
.f-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;}
.f-value{border-bottom:1px solid #000;min-height:1.1rem;padding-bottom:2px;}
.sig-line{border-bottom:1px solid #000;min-height:2.25rem;}
</style></head><body>
<div style="max-width:8.5in;margin:0 auto;">
<article>
<div class="header"><h1>${HERITAGE_NAME}</h1><p>${HERITAGE_ADDRESS}</p><p><strong>Tel: ${HERITAGE_PHONE}</strong></p></div>
<div class="body">
<h2 class="title">Credit Card Payment Authorization</h2>
<div class="notice"><p>I authorize Heritage Housing to charge the amount indicated below to the card provided. This authorization is for an earnest deposit and will be processed per our agreement. Nothing will be charged without further authorization for the actual transaction.</p></div>
<table><tbody>
<tr><td style="width:50%;"><div class="f-label">Name on card</div><div class="f-value">${esc(cc.nameOnCard)}</div></td><td><div class="f-label">Card number (last 4)</div><div class="f-value">${esc(cardDisplay)}</div></td></tr>
<tr><td><div class="f-label">Expiration (MM/YY)</div><div class="f-value">${esc(cc.expDate)}</div></td><td><div class="f-label">Amount authorized ($)</div><div class="f-value">${esc(cc.amountAuthorized)}</div></td></tr>
<tr><td colspan="2"><div class="f-label">Billing address</div><div class="f-value">${esc(cc.billingAddress)}</div></td></tr>
<tr><td><div class="f-label">Date</div><div class="f-value">${esc(cc.date)}</div></td><td><div class="f-label">Customer signature</div><div class="sig-line">${ccSig || '&nbsp;'}</div></td></tr>
</tbody></table>
</div>
</article>
<article style="margin-top:2rem;">
<div class="header"><h1>${HERITAGE_NAME}</h1><p>${HERITAGE_ADDRESS}</p><p><strong>Tel: ${HERITAGE_PHONE}</strong></p></div>
<div class="body">
<h2 class="title">Deposit Receipt</h2>
<div class="notice-box"><p>You have the right to demand a refund of the deposit or down payment, and receive that refund within 15 days thereafter, if you timely and properly rescind the sales purchase contract. A retailer may keep up to 5% of the estimated cash price under certain conditions.</p></div>
<table><tbody>
<tr><td style="width:50%;"><div class="f-label">Date</div><div class="f-value">${esc(dr.date)}</div></td><td><div class="f-label">Customer name</div><div class="f-value">${esc(dr.customer)}</div></td></tr>
<tr><td colspan="2"><div class="f-label">Address</div><div class="f-value">${esc(dr.address)}</div></td></tr>
<tr><td><div class="f-label">Phone</div><div class="f-value">${esc(dr.phone)}</div></td><td><div class="f-label">Model #</div><div class="f-value">${esc(dr.modelNumber)}</div></td></tr>
<tr><td><div class="f-label">Serial #</div><div class="f-value">${esc(dr.serialNumber)}</div></td><td><div class="f-label">Amount ($)</div><div class="f-value">${esc(dr.amount)}</div></td></tr>
<tr><td><div class="f-label">Customer signature</div><div class="sig-line">${drSig || '&nbsp;'}</div></td><td><div class="f-label">Heritage Housing (in person)</div><div class="sig-line">&nbsp;</div></td></tr>
</tbody></table>
</div>
</article>
</div>
</body></html>`;
}
