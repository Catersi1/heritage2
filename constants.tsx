
import React from 'react';
import { Language } from './types';

/** SHA-256(salt + password). Default password: Heritage#Secure2025! — change by setting a new hash. */
export const ADMIN_PASSWORD_HASH = "d54f450d076d7155c14bb6f9a61c9d38e80d4b88265c4c9326d38bdb6344af9d";

export const CONTACT_INFO = [
  { name: "Miza", phone: "701-441-1388" },
  { name: "Eva", phone: "405-268-2502" }
];

export const calculateScore = (data: {
  landStatus: string;
  utilities: string;
  employmentStatus: string;
  monthlyIncome: number | '';
  targetPayment: number | '';
  downPayment: number | '';
  creditEstimate: string;
  repoHistory: string;
}): number => {
  let score = 0;

  const monthlyIncome = Number(data.monthlyIncome) || 0;
  const targetPayment = Number(data.targetPayment) || 0;
  const downPayment = Number(data.downPayment) || 0;

  // Land Score
  if (data.landStatus.includes("Paid Off")) score += 30;
  else if (data.landStatus.includes("Financed")) score += 20;
  else if (data.landStatus.toLowerCase().includes("park")) score += 15;

  // Utilities Score
  if (data.utilities === "Yes, all utilities" || data.utilities === "Sí, todos los servicios") score += 10;

  // Employment Score
  if (data.employmentStatus.includes("W2")) score += 15;
  else if (data.employmentStatus.includes("Fixed") || data.employmentStatus.includes("Fijo")) score += 10;

  // Income Score (Affordability)
  if (targetPayment > 0) {
    if (monthlyIncome > (targetPayment * 2.5)) score += 20;
  }

  // Asset Score
  if (downPayment > 2000) score += 10;

  // Credit Score
  if (data.creditEstimate.includes("Excellent") || data.creditEstimate.includes("Excelente") || 
      data.creditEstimate.includes("Good") || data.creditEstimate.includes("Bueno")) score += 20;
  else if (data.creditEstimate.includes("Fair") || data.creditEstimate.includes("Regular")) score += 5;

  // Negative History
  if (data.repoHistory.includes("Within last 2 years") || data.repoHistory.includes("últimos 2 años")) score -= 30;

  return score;
};

export const Icons = {
  Home: () => <i className="fa-solid fa-house"></i>,
  User: () => <i className="fa-solid fa-user"></i>,
  Phone: () => <i className="fa-solid fa-phone"></i>,
  Email: () => <i className="fa-solid fa-envelope"></i>,
  Check: () => <i className="fa-solid fa-check-circle"></i>,
  Upload: () => <i className="fa-solid fa-upload"></i>,
  Download: () => <i className="fa-solid fa-download"></i>,
  File: () => <i className="fa-solid fa-file-invoice"></i>,
  IdCard: () => <i className="fa-solid fa-id-card"></i>,
  Warning: () => <i className="fa-solid fa-triangle-exclamation"></i>,
};

export const t = (lang: Language) => ({
  // Landing
  welcome: lang === 'English' ? 'Welcome to Heritage Housing' : 'Bienvenidos a Heritage Housing',
  heroTitle1: lang === 'English' ? 'Your New Home is ' : 'Su Nueva Casa Está a ',
  heroTitle2: lang === 'English' ? 'Just Weeks Away.' : 'Sólo Semanas de Distancia.',
  heroSubtitle: lang === 'English' ? 'We simplify mobile home buying. Fast approvals, transparent budgeting, and expert delivery to your property.' : 'Simplificamos la compra de casas móviles. Aprobaciones rápidas, presupuestos transparentes y entrega experta en su propiedad.',
  marketingQuote: lang === 'English' ? '"Stop dealing with sales people! Do it all online and you only need to see someone when you come visit to see a house or sign documents."' : '"¡Deje de tratar con vendedores! Haga todo en línea y sólo tendrá que ver a alguien cuando venga a visitar una casa o a firmar documentos."',
  startApp: lang === 'English' ? 'Start My Application' : 'Iniciar mi Solicitud',
  howFinancingWorks: lang === 'English' ? 'How financing works' : 'Cómo funciona el financiamiento',
  financingInfoTitle: lang === 'English' ? 'How Our Financing Works' : 'Cómo Funciona Nuestro Financiamiento',
  financingInfoIntro: lang === 'English' ? 'We want you to understand exactly what we need and how your down payment and terms work. Here’s the simple breakdown.' : 'Queremos que entienda exactamente qué necesitamos y cómo funcionan su enganche y sus plazos. Aquí está el resumen.',
  financingWhatWeNeed: lang === 'English' ? 'What we need from you' : 'Qué necesitamos de usted',
  financingBankStatements: lang === 'English' ? 'Last 3 bank statements' : 'Últimos 3 estados de cuenta bancarios',
  financingLastCheck: lang === 'English' ? 'Last pay check or proof of income (if you work for an employer)' : 'Último cheque de pago o comprobante de ingresos (si trabaja para un empleador)',
  financingDownPayment: lang === 'English' ? 'Down payment (based on credit)' : 'Enganche (según su crédito)',
  financingGoodCredit: lang === 'English' ? 'Good credit (680 or above): only 5% down of the home price' : 'Buen crédito (680 o más): solo 5% de enganche del precio de la casa',
  financingUsual: lang === 'English' ? 'Typical for home purchases: 10% down' : 'Lo habitual en compras de casa: 10% de enganche',
  financingOwnLand: lang === 'English' ? '0% down if you already own your land' : '0% de enganche si ya es dueño de su terreno',
  financingITIN: lang === 'English' ? 'We accept ITINs' : 'Aceptamos ITIN',
  financingITINDesc: lang === 'English' ? 'If you don’t have a Social Security number, you can use an Individual Taxpayer Identification Number (ITIN). We accept ITINs for financing.' : 'Si no tiene número de Seguro Social, puede usar un Número de Identificación Personal del Contribuyente (ITIN). Aceptamos ITIN para financiamiento.',
  financingOurBank: lang === 'English' ? 'Our own bank, better terms' : 'Nuestro propio banco, mejores condiciones',
  financingOurBankDesc: lang === 'English' ? 'We have our own bank and can offer better terms: 15-, 10-, or 6-year loans. That means you pay less in interest and own your home sooner.' : 'Tenemos nuestro propio banco y podemos ofrecer mejores plazos: préstamos a 15, 10 o 6 años. Eso significa que paga menos intereses y es dueño de su casa más pronto.',
  financingBackToHome: lang === 'English' ? 'Back to home' : 'Volver al inicio',
  financingStartApplication: lang === 'English' ? 'Start my application' : 'Iniciar mi solicitud',
  step1Title: lang === 'English' ? '1. Apply Online' : '1. Aplique en Línea',
  step1Desc: lang === 'English' ? 'Fill out our quick eligibility form and credit application in minutes.' : 'Complete nuestro formulario rápido de elegibilidad y solicitud de crédito en minutos.',
  step2Title: lang === 'English' ? '2. Pick Your Home' : '2. Elija su Casa',
  step2Desc: lang === 'English' ? 'Based on your budget, we\'ll show you homes that fit your needs perfectly.' : 'Basándonos en su presupuesto, le mostraremos casas que se adaptan perfectamente a sus necesidades.',
  step3Title: lang === 'English' ? '3. 24h Approval' : '3. Aprobación en 24h',
  step3Desc: lang === 'English' ? 'Get an answer within 24 hours. Once happy, sign and secure your new home.' : 'Obtenga una respuesta en 24 horas. Una vez satisfecho, firme y asegure su nuevo hogar.',
  step4Title: lang === 'English' ? '4. 2-Week Delivery' : '4. Entrega en 2 Semanas',
  step4Desc: lang === 'English' ? 'If approved based on your budget, we can deliver your home within just 2 weeks!' : 'Si se aprueba en función de su presupuesto, ¡podemos entregarle su casa en sólo 2 semanas!',
  whyChoose: lang === 'English' ? 'Why choose Heritage?' : '¿Por qué elegir Heritage?',
  whyDesc: lang === 'English' ? 'We guide you through the entire process from land prep to keys in hand.' : 'Le guiamos a través de todo el proceso, desde la preparación del terreno hasta la entrega de llaves.',
  responseLabel: lang === 'English' ? 'Response' : 'Respuesta',
  deliveryLabel: lang === 'English' ? 'Delivery' : 'Entrega',
  feesLabel: lang === 'English' ? 'Hidden Fees' : 'Cargos Ocultos',
  
  // App Header
  securePortal: lang === 'English' ? 'Secure Portal' : 'Portal Seguro',
  salesPortal: lang === 'English' ? 'SALES PORTAL' : 'PORTAL DE VENTAS',
  
  // Forms Common
  back: lang === 'English' ? 'Back' : 'Atrás',
  nextStep: lang === 'English' ? 'Next step' : 'Siguiente paso',
  lastStepNote: lang === 'English' ? "You're on the last step — submit above to complete." : "Está en el último paso — envíe arriba para completar.",
  appointmentTitle: lang === 'English' ? 'Schedule an appointment' : 'Programar una cita',
  appointmentSub: lang === 'English' ? 'Optional. Pick a date that works for you and we’ll confirm.' : 'Opcional. Elija una fecha y la confirmaremos.',
  appointmentLabel: lang === 'English' ? 'Preferred date' : 'Fecha preferida',
  appointmentSubmitOnly: lang === 'English' ? 'Save appointment date' : 'Guardar fecha de cita',
  toastAppointmentSaved: lang === 'English' ? 'Appointment date saved. You can continue uploading documents and submit when ready.' : 'Fecha de cita guardada. Puede seguir subiendo documentos y enviar cuando esté listo.',
  continueDocs: lang === 'English' ? 'Continue to Document Upload' : 'Continuar al Cargar Documentos',
  nextCosigner: lang === 'English' ? 'Next: Co-signer Details' : 'Siguiente: Detalles del Co-fiador',
  requiredFields: lang === 'English' ? 'Please complete all required fields.' : 'Por favor complete todos los campos requeridos.',
  revealPII: lang === 'English' ? 'Reveal SSN/DOB' : 'Revelar SSN/Fecha de Nac.',
  
  // Unified Form
  personalTitle: lang === 'English' ? 'Contact & Personal' : 'Contacto y Personal',
  fullName: lang === 'English' ? 'Full Name' : 'Nombre Completo',
  phone: lang === 'English' ? 'Phone Number' : 'Número de Teléfono',
  email: lang === 'English' ? 'Email Address' : 'Correo Electrónico',
  dob: lang === 'English' ? 'Date of Birth' : 'Fecha de Nacimiento',
  ssn: lang === 'English' ? 'Social Security Number (SSN)' : 'Número de Seguro Social (SSN)',
  encryptionNote: lang === 'English' ? 'AES-256 Bit Encryption Active' : 'Cifrado AES-256 bits Activo',
  residenceTitle: lang === 'English' ? 'Current Residence' : 'Residencia Actual',
  streetAddress: lang === 'English' ? 'Street Address' : 'Dirección',
  yearsThere: lang === 'English' ? 'Years There' : 'Años Ahí',
  incomeTitle: lang === 'English' ? 'Employment & Income' : 'Empleo e Ingresos',
  empType: lang === 'English' ? 'Employment Type' : 'Tipo de Empleo',
  monthlyIncome: lang === 'English' ? 'Monthly Household Income ($)' : 'Ingreso Mensual del Hogar ($)',
  employerName: lang === 'English' ? 'Employer Name' : 'Nombre del Empleador',
  jobTitle: lang === 'English' ? 'Job Title' : 'Puesto de Trabajo',
  propertyTitle: lang === 'English' ? 'Home & Property Preferences' : 'Preferencias de Casa y Propiedad',
  landStatus: lang === 'English' ? 'Property Status' : 'Estado de la Propiedad',
  bedrooms: lang === 'English' ? 'Bedrooms Needed' : 'Recámaras Necesarias',
  downPayment: lang === 'English' ? 'Available Down Payment ($)' : 'Enganche Disponible ($)',
  targetPay: lang === 'English' ? 'Desired Monthly Payment ($)' : 'Pago Mensual Deseado ($)',
  creditEst: lang === 'English' ? 'Estimated Credit Score' : 'Puntaje de Crédito Estimado',
  needCosigner: lang === 'English' ? 'Need a Co-signer?' : '¿Necesita un Co-fiador?',
  cosignerDesc: lang === 'English' ? 'Having a co-signer can significantly increase your chances of approval.' : 'Tener un co-fiador puede aumentar significativamente sus posibilidades de aprobación.',
  addCosigner: lang === 'English' ? 'Add a Co-signer' : 'Agregar Co-fiador',
  removeCosigner: lang === 'English' ? 'Remove Co-signer' : 'Quitar Co-fiador',
  securityConsent: lang === 'English' ? 'Security Consent:' : 'Consentimiento de Seguridad:',
  consentText: lang === 'English' ? 'I authorize Heritage Housing to perform a credit evaluation and understand that my sensitive data (SSN, DOB, Documents) is encrypted and securely stored for the sole purpose of my mobile home application.' : 'Autorizo a Heritage Housing a realizar una evaluación crediticia y entiendo que mis datos sensibles (SSN, fecha de nacimiento, documentos) están cifrados y almacenados de forma segura con el único fin de mi solicitud de casa móvil.',
  
  // Earnest Deposit
  earnestTitle: lang === 'English' ? 'Earnest Deposit & Payment Authorization' : 'Depósito de Seriedad y Autorización de Pago',
  earnestSubtitle: lang === 'English' ? 'Optional — strengthens your application' : 'Opcional — fortalece su solicitud',
  earnestNoticeTitle: lang === 'English' ? 'Please read' : 'Por favor lea',
  earnestNoticeP1: lang === 'English' ? 'This step is merely a formality. Nothing will be charged today. It is a way for you to show how serious you are about your application—this earnest deposit is looked at very favorably by the bank and our manager, and will put your application at the top of the pile.' : 'Este paso es solo una formalidad. No se le cobrará nada hoy. Es una forma de demostrar qué tan en serio se toma su solicitud; este depósito de seriedad es muy bien visto por el banco y nuestro gerente, y pondrá su solicitud en lo más alto de la lista.',
  earnestNoticeP2: lang === 'English' ? 'You are not required to complete this to move forward. You may skip and continue with your application. However, these forms will need to be filled in eventually—whether in person or online—before closing.' : 'No tiene que completar esto para continuar. Puede omitir y seguir con su solicitud. No obstante, estos formularios deberán completarse en algún momento—ya sea en persona o en línea—antes del cierre.',
  skipForNow: lang === 'English' ? 'Skip for now — continue without deposit' : 'Omitir por ahora — continuar sin depósito',
  submitDeposit: lang === 'English' ? 'Submit deposit forms' : 'Enviar formularios de depósito',
  creditCardAuthTitle: lang === 'English' ? 'Credit Card Payment Authorization' : 'Autorización de Pago con Tarjeta de Crédito',
  nameOnCard: lang === 'English' ? 'Name on card' : 'Nombre en la tarjeta',
  cardNumber: lang === 'English' ? 'Card number' : 'Número de tarjeta',
  expDate: lang === 'English' ? 'Expiration date (MM/YY)' : 'Fecha de vencimiento (MM/AA)',
  billingAddress: lang === 'English' ? 'Billing address' : 'Dirección de facturación',
  amountAuthorized: lang === 'English' ? 'Amount authorized ($)' : 'Monto autorizado ($)',
  depositReceiptTitle: lang === 'English' ? 'Deposit Receipt' : 'Recibo de Depósito',
  depositDate: lang === 'English' ? 'Date' : 'Fecha',
  depositCustomer: lang === 'English' ? 'Customer' : 'Cliente',
  depositAddress: lang === 'English' ? 'Address' : 'Dirección',
  depositPhone: lang === 'English' ? 'Phone' : 'Teléfono',
  modelNumber: lang === 'English' ? 'Model # (optional — sales will complete)' : 'Modelo # (opcional — lo completará ventas)',
  serialNumber: lang === 'English' ? 'Serial # (optional — sales will complete)' : 'Serie # (opcional — lo completará ventas)',
  depositAmount: lang === 'English' ? 'Amount ($)' : 'Monto ($)',
  customerSignature: lang === 'English' ? 'Customer signature' : 'Firma del cliente',
  signatureHint: lang === 'English' ? 'Type your full name below and choose a cursive style. Then click "Use this signature".' : 'Escriba su nombre completo abajo y elija un estilo cursivo. Luego haga clic en "Usar esta firma".',
  useSignatureButton: lang === 'English' ? 'Use this signature' : 'Usar esta firma',
  signatureHeading: lang === 'English' ? 'Type your name and choose a style' : 'Escriba su nombre y elija un estilo',
  heritageHousingSig: lang === 'English' ? 'Heritage Housing signature (completed in person)' : 'Firma Heritage Housing (en persona)',

  // Co-signer Form
  cosignerRelationship: lang === 'English' ? 'Co-signer Relationship' : 'Parentesco del Co-fiador',
  cosignerEmp: lang === 'English' ? 'Co-signer Employment' : 'Empleo del Co-fiador',
  
  // Document Upload
  docTitle: lang === 'English' ? 'Document Upload' : 'Carga de Documentos',
  docSubtitle: lang === 'English' ? 'Provide verification to complete your application.' : 'Proporcione verificación para completar su solicitud.',
  bankLabel: lang === 'English' ? 'Last 3 Bank Statements' : 'Últimos 3 Estados de Cuenta',
  bankSub: lang === 'English' ? 'PDF or Photos' : 'PDF o Fotos',
  payLabel: lang === 'English' ? 'Last Pay Check / Proof of Income' : 'Último Cheque / Prueba de Ingresos',
  paySub: lang === 'English' ? 'Most recent pay stub' : 'Talón de pago más reciente',
  licenseLabel: lang === 'English' ? 'Driver\'s License / ID' : 'Licencia de Conducir / ID',
  licenseSub: lang === 'English' ? 'Front photo clearly showing name' : 'Foto frontal que muestre el nombre claramente',
  ssLabel: lang === 'English' ? 'Social Security Card' : 'Tarjeta de Seguro Social',
  ssSub: lang === 'English' ? 'Clear photo of physical card' : 'Foto clara de la tarjeta física',
  uploaded: lang === 'English' ? 'Uploaded' : 'Cargado',
  pending: lang === 'English' ? 'Pending' : 'Pendiente',
  docInfoNote: lang === 'English' ? 'Clear photos or PDFs of physical documents are best for fast processing.' : 'Las fotos claras o los PDF de los documentos físicos son mejores para un procesamiento rápido.',
  coBorrowerDocTitle: lang === 'English' ? 'Co-borrower Documents' : 'Documentos del Co-prestatario',
  coBorrowerDocSub: lang === 'English' ? 'Same items as above: bank statements, pay stub, ID, and Social Security card.' : 'Los mismos documentos que arriba: estados de cuenta, talón de pago, identificación y tarjeta de Seguro Social.',
  noCoBorrowerNote: lang === 'English' ? 'You did not add a co-borrower. If you need to add one, go back to the application step.' : 'No agregó un co-prestatario. Si necesita agregar uno, regrese al paso de solicitud.',
  fileSizeLimit: lang === 'English' ? 'Max 5 MB per file' : 'Máx. 5 MB por archivo',
  submitFinal: lang === 'English' ? 'Submit Documents' : 'Enviar Documentos',
  docContactNote: lang === 'English' ? 'A salesperson will contact you within 24 hours.' : 'Un vendedor se comunicará con usted en un plazo de 24 horas.',
  
  // Success & save confirmations (toast after each form)
  toastFormSaved: lang === 'English' ? 'Form saved and submitted. Proceeding to next step.' : 'Formulario guardado y enviado. Pasando al siguiente paso.',
  toastApplicationSaved: lang === 'English' ? 'Application saved and submitted. Proceeding to next step.' : 'Solicitud guardada y enviada. Pasando al siguiente paso.',
  toastEarnestSaved: lang === 'English' ? 'Earnest deposit form saved and submitted. Proceeding to next step.' : 'Formulario de depósito guardado y enviado. Pasando al siguiente paso.',
  toastCosignerSaved: lang === 'English' ? 'Co-signer form saved and submitted. Proceeding to document upload.' : 'Formulario de co-fiador guardado y enviado. Pasando a carga de documentos.',
  successSavedLine: lang === 'English' ? 'Your application was saved and submitted successfully.' : 'Su solicitud fue guardada y enviada correctamente.',

  // Success
  submitted: lang === 'English' ? 'Application Submitted!' : '¡Solicitud Enviada!',
  successMsg: lang === 'English' ? 'Great job, {name}! We\'ve received your full application and document package.' : '¡Buen trabajo, {name}! Hemos recibido su solicitud completa y el paquete de documentos.',
  nextSteps: lang === 'English' ? 'Next Steps' : 'Siguientes Pasos',
  step1Verify: lang === 'English' ? 'Verification: Our analysts are reviewing your documents now.' : 'Verificación: Nuestros analistas están revisando sus documentos ahora.',
  step2Contact: lang === 'English' ? 'Contact: We will call or text you at {phone} within 24 hours.' : 'Contacto: Le llamaremos o enviaremos un mensaje de texto al {phone} en un plazo de 24 horas.',
  step3Viewing: lang === 'English' ? 'Viewing: Get ready to pick your floor plan and visit your new home!' : 'Visita: ¡Prepárese para elegir su plano y visitar su nuevo hogar!',
  returnHome: lang === 'English' ? 'Return to home page' : 'Volver a la página de inicio',
});
