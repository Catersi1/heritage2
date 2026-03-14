
import React from 'react';
import { Language } from './types';

export const ADMIN_PASSWORD = "heritage";

export const CONTACT_INFO = [
  { name: "Miza", phone: "701-441-1388" },
  { name: "Eva", phone: "405-268-2502" }
];

export const MOBILE_HOME_PARKS = [
  { name: "Highland Park", address: "3200 S Highland Park Dr, Oklahoma City, OK 73129", phone: "(405) 724-7593", photoUrl: "https://picsum.photos/seed/highland-park/800/600" },
  { name: "Westlake", address: "9717 NW 10th St, Oklahoma City, OK 73127", phone: "(405) 495-1463", photoUrl: "https://picsum.photos/seed/westlake-okc/800/600" },
  { name: "Overholser Village", address: "9355 Sundown Rd, Oklahoma City, OK 73127", phone: "(405) 787-0136", photoUrl: "https://picsum.photos/seed/overholser/800/600" },
  { name: "Bills MHC", address: "2145 SE 59th St, Oklahoma City, OK 73129", phone: "(405) 672-0270", photoUrl: "https://picsum.photos/seed/bills-mhc/800/600" },
  { name: "Welcome Home Community", address: "1112 Lifestyle Dr, Oklahoma City, OK 73127", phone: "(405) 789-4499", photoUrl: "https://picsum.photos/seed/welcome-home/800/600" },
  { name: "Granada Village", address: "2400 S MacArthur Blvd, Oklahoma City, OK 73128", phone: "(405) 682-4401", photoUrl: "https://picsum.photos/seed/granada/800/600" },
  { name: "Santa Fe Station", address: "501 SE 44th St, Oklahoma City, OK 73129", phone: "(405) 634-6464", photoUrl: "https://picsum.photos/seed/santa-fe/800/600" },
  { name: "Apollo MHC", address: "1617 SE 44th St, Oklahoma City, OK 73129", phone: "(405) 672-0270", photoUrl: "https://picsum.photos/seed/apollo/800/600" },
  { name: "Westmoor", address: "7901 S Council Rd, Oklahoma City, OK 73169", phone: "(405) 745-3492", photoUrl: "https://picsum.photos/seed/westmoor/800/600" },
  { name: "Burntwood", address: "3308 SE 89th St, Oklahoma City, OK 73135", phone: "(405) 670-3315", photoUrl: "https://picsum.photos/seed/burntwood/800/600" },
  { name: "Golden Rule", address: "2001 S Macarthur, Oklahoma City, OK 73128", phone: "(405) 686-1492", photoUrl: "https://picsum.photos/seed/golden-rule/800/600" },
  { name: "Arrowwood MFG Home Community", address: "5720 Foster Rd, Oklahoma City, OK 73129", phone: "(405) 724-7257", photoUrl: "https://picsum.photos/seed/arrowwood/800/600" },
  { name: "Boomer MFG Home Community", address: "2401 SE 44th St, Oklahoma City, OK 73129", phone: "(405) 400-6929", photoUrl: "https://picsum.photos/seed/boomer/800/600" },
  { name: "El Cerrito Place", address: "4544 NW 9th St, Oklahoma City, OK 73127", phone: "(405) 614-8391", photoUrl: "https://picsum.photos/seed/el-cerrito/800/600" },
  { name: "Skyline", address: "3200 E Reno Ave, Oklahoma City, OK 73115", phone: "(844) 653-4742", photoUrl: "https://picsum.photos/seed/skyline/800/600" },
  { name: "Lakeview Terrace Mobile Home Community", address: "1200 N Lakeview Dr, Oklahoma City, OK 73127", phone: "(405) 787-5303", photoUrl: "https://picsum.photos/seed/lakeview/800/600" },
  { name: "Sherwood Forest Mobile Home Community", address: "5008 S Anderson Rd, Oklahoma City, OK 73150", phone: "(405) 256-3524", photoUrl: "https://picsum.photos/seed/sherwood/800/600" },
  { name: "Forest Park Estates MHC", address: "4800 Foster Rd, Oklahoma City, OK 73129", phone: "(405) 672-3974", photoUrl: "https://picsum.photos/seed/forest-park/800/600" },
  { name: "OKC Residential", address: "502 Helm Pkwy, Oklahoma City, OK 73149", phone: "(405) 634-1000", photoUrl: "https://picsum.photos/seed/okc-res/800/600" },
  { name: "Meridian Sooner", address: "Oklahoma City, OK 73135", phone: "(405) 737-3483", photoUrl: "https://picsum.photos/seed/meridian/800/600" },
  { name: "Anchor Inn Mobile Home Park", address: "800 N Tulsa Ave, Oklahoma City, OK 73107", phone: "(405) 464-2864", photoUrl: "https://picsum.photos/seed/anchor-inn/800/600" },
  { name: "Stonebrook Village", address: "3815 B SW 23rd St, Oklahoma City, OK 73108", phone: "(405) 681-2211", photoUrl: "https://picsum.photos/seed/stonebrook/800/600" },
  { name: "Airway Mobile Home Estates", address: "809 N Tulsa Ave, Oklahoma City, OK 73107", phone: "(405) 943-5447", photoUrl: "https://picsum.photos/seed/airway/800/600" },
  { name: "Lake Forest Manufactured Home Community", address: "9009 NW 10th St, Oklahoma City, OK 73127", phone: "(405) 787-7417", photoUrl: "https://picsum.photos/seed/lake-forest/800/600" },
  { name: "OKC Mobile Home Park", address: "6709 NW 10th St, Oklahoma City, OK 73127", phone: "N/A", photoUrl: "https://picsum.photos/seed/okc-mhp/800/600" },
  { name: "Red Cap Mobile Home Park", address: "3908 NW 10th St, Oklahoma City, OK 73107", phone: "N/A", photoUrl: "https://picsum.photos/seed/red-cap/800/600" },
  { name: "Holiday Out", address: "604 Mustang Plant Rd, Oklahoma City, OK 73127", phone: "(405) 470-1614", photoUrl: "https://picsum.photos/seed/holiday-out/800/600" },
  { name: "Parker Mobile Home Park", address: "4680 Penny Ln, Oklahoma City, OK 73127", phone: "(405) 614-8391", photoUrl: "https://picsum.photos/seed/parker-mhp/800/600" },
  { name: "Suburban Estates", address: "1100 S Rockwell Ave, Oklahoma City, OK 73128", phone: "(405) 789-4327", photoUrl: "https://picsum.photos/seed/suburban/800/600" },
  { name: "Ann Arbor Mobile Hm Ests", address: "900 N Andrews Dr, Oklahoma City, OK 73127", phone: "(405) 942-5200", photoUrl: "https://picsum.photos/seed/ann-arbor/800/600" },
  { name: "West Oaks Mobile Home Park", address: "7200 NW 10th St, Oklahoma City, OK 73127", phone: "(405) 787-1030", photoUrl: "https://picsum.photos/seed/west-oaks/800/600" },
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

export const calculateMortgage = (principal: number, annualRate: number, years: number): number => {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return Math.round(payment);
};

export const getEstimatedDownPayment = (homeCost: number, creditEstimate: string, landStatus: string): number => {
  // Logic: 
  // 1. If land is "Paid Off", potentially 0% down
  // 2. If credit score is 660+ (Excellent or Good), 5% down
  // 3. Otherwise 10% down
  
  if (landStatus.includes("Paid Off") || landStatus.includes("Pagado")) {
    return 0;
  }
  
  const isGoodCredit = creditEstimate.includes("720+") || creditEstimate.includes("640-719");
  if (isGoodCredit) {
    return Math.round(homeCost * 0.05);
  }
  
  return Math.round(homeCost * 0.10);
};

export const getHomeBasePrice = (bedrooms: string, isIdeal: boolean): number => {
  switch (bedrooms) {
    case '1': return 64000;
    case '2': return 89000;
    case '3': return isIdeal ? 135000 : 98000;
    case '4': return isIdeal ? 165000 : 145000;
    case '5+': return isIdeal ? 195000 : 175000;
    default: return 98000;
  }
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
  next: lang === 'English' ? 'Next' : 'Siguiente',
  continueDocs: lang === 'English' ? 'Continue to Document Upload' : 'Continuar al Cargar Documentos',
  nextCosigner: lang === 'English' ? 'Next: Co-signer Details' : 'Siguiente: Detalles del Co-fiador',
  requiredFields: lang === 'English' ? 'Please complete all required fields.' : 'Por favor complete todos los campos requeridos.',
  revealPII: lang === 'English' ? 'Reveal SSN/DOB' : 'Revelar SSN/Fecha de Nac.',
  docsNeededTitle: lang === 'English' ? 'Documents You\'ll Need' : 'Documentos que Necesitará',
  docsNeededDesc: lang === 'English' ? 'To complete your application, please have the following ready:' : 'Para completar su solicitud, tenga listo lo siguiente:',
  docsNeededList: lang === 'English' ? [
    'Last 3 Bank Statements (Month 1, 2 & 3)',
    'Last Pay Stub / Proof of Income',
    'Driver\'s License or Government ID',
    'Social Security Card or ITIN'
  ] : [
    'Últimos 3 Estados de Cuenta (Mes 1, 2 y 3)',
    'Último Talón de Pago / Prueba de Ingresos',
    'Licencia de Conducir o ID del Gobierno',
    'Tarjeta de Seguro Social o ITIN'
  ],
  
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
  
  // Co-signer Form
  cosignerRelationship: lang === 'English' ? 'Co-signer Relationship' : 'Parentesco del Co-fiador',
  cosignerEmp: lang === 'English' ? 'Co-signer Employment' : 'Empleo del Co-fiador',
  
  // Document Upload
  docTitle: lang === 'English' ? 'Document Upload' : 'Carga de Documentos',
  docSubtitle: lang === 'English' ? 'Provide verification to complete your application.' : 'Proporcione verificación para completar su solicitud.',
  bankLabel: lang === 'English' ? 'Bank Statements (3 Months)' : 'Estados de Cuenta (3 Meses)',
  bankSub: lang === 'English' ? 'Provide 3 separate months' : 'Proporcione 3 meses separados',
  payLabel: lang === 'English' ? 'Last Pay Check / Proof of Income' : 'Último Cheque / Prueba de Ingresos',
  paySub: lang === 'English' ? 'Most recent pay stub' : 'Talón de pago más reciente',
  licenseLabel: lang === 'English' ? 'Driver\'s License / ID' : 'Licencia de Conducir / ID',
  licenseSub: lang === 'English' ? 'Front photo clearly showing name' : 'Foto frontal que muestre el nombre claramente',
  ssLabel: lang === 'English' ? 'Social Security Card / ITIN' : 'Tarjeta de Seguro Social / ITIN',
  ssSub: lang === 'English' ? 'Clear photo of physical card or ITIN document' : 'Foto clara de la tarjeta física o documento ITIN',
  uploaded: lang === 'English' ? 'Uploaded' : 'Cargado',
  pending: lang === 'English' ? 'Pending' : 'Pendiente',
  docInfoNote: lang === 'English' ? 'Clear photos or PDFs of physical documents are best for fast processing.' : 'Las fotos claras o los PDF de los documentos físicos son mejores para un procesamiento rápido.',
  submitFinal: lang === 'English' ? 'Submit Final Application' : 'Enviar Solicitud Final',
  
  // Success
  submitted: lang === 'English' ? 'Application Submitted!' : '¡Solicitud Enviada!',
  successMsg: lang === 'English' ? 'Great job, {name}! We\'ve received your full application and document package.' : '¡Buen trabajo, {name}! Hemos recibido su solicitud completa y el paquete de documentos.',
  nextSteps: lang === 'English' ? 'Next Steps' : 'Siguientes Pasos',
  step1Verify: lang === 'English' ? 'Verification: Our analysts are reviewing your documents now.' : 'Verificación: Nuestros analistas están revisando sus documentos ahora.',
  step2Contact: lang === 'English' ? 'Contact: We will call or text you at {phone} within 24 hours.' : 'Contacto: Le llamaremos o enviaremos un mensaje de texto al {phone} en un plazo de 24 horas.',
  step3Viewing: lang === 'English' ? 'Viewing: Get ready to pick your floor plan and visit your new home!' : 'Visita: ¡Prepárese para elegir su plano y visitar su nuevo hogar!',
  returnHome: lang === 'English' ? 'Return to home page' : 'Volver a la página de inicio',
  
  // Appointment Only Form
  appointmentTitle: lang === 'English' ? 'Schedule an Appointment' : 'Programar una Cita',
  appointmentSubtitle: lang === 'English' ? 'Skip the full application and schedule a visit to see our homes in person.' : 'Omita la solicitud completa y programe una visita para ver nuestras casas en persona.',
  financialInfo: lang === 'English' ? 'Financial Information' : 'Información Financiera',
  monthlyIncomeBeforeTaxes: lang === 'English' ? 'Monthly Income (before taxes) *' : 'Ingresos Mensuales (antes de impuestos) *',
  homeRequirements: lang === 'English' ? 'Home Requirements' : 'Requisitos de la Casa',
  utilitiesAtSite: lang === 'English' ? 'Utilities at Site *' : 'Servicios en el Sitio *',
  landInformation: lang === 'English' ? 'Land Information' : 'Información del Terreno',
  doYouHaveLand: lang === 'English' ? 'Do you have land for the home? *' : '¿Tiene terreno para la casa? *',
  landLocationArea: lang === 'English' ? 'Land Location (City/Area)' : 'Ubicación del Terreno (Ciudad/Área)',
  creditHistory: lang === 'English' ? 'Credit History' : 'Historial de Crédito',
  anyRepos7Years: lang === 'English' ? 'Any repossessions in the last 7 years? *' : '¿Alguna ejecución hipotecaria en los últimos 7 años? *',
  preferredAppointmentDate: lang === 'English' ? 'Preferred Appointment Date' : 'Fecha de Cita Preferida',
  additionalNotesOptional: lang === 'English' ? 'Additional Notes (Optional)' : 'Notas Adicionales (Opcional)',
  scheduleAppointment: lang === 'English' ? 'Schedule Appointment' : 'Programar Cita',

  // Credit Building
  creditBuildingTab: lang === 'English' ? 'CREDIT BUILDING' : 'CONSTRUIR CRÉDITO',
  creditBuildingIntro: lang === 'English'
    ? 'Building strong credit before you apply can improve your approval odds and help you qualify for better terms. The trusted partners below offer credit-builder products—such as secured credit-builder loans and credit-builder cards—that report to the major bureaus so you can establish or improve your score over time. Many of our customers use these tools to get ready for financing. Remember: buying and paying for your mobile home through Heritage Housing also helps you build credit with on-time monthly payments. When you\'re ready to apply for financing, start with our secure credit application below.'
    : 'Construir un buen crédito antes de solicitar puede mejorar sus posibilidades de aprobación y ayudarle a obtener mejores condiciones. Los socios de confianza a continuación ofrecen productos para construir crédito—como préstamos asegurados y tarjetas que reportan a las principales agencias—para que pueda establecer o mejorar su puntaje con el tiempo. Muchos de nuestros clientes usan estas herramientas para prepararse. Recuerde: comprar y pagar su casa móvil a través de Heritage Housing también le ayuda a construir crédito con sus pagos mensuales a tiempo. Cuando esté listo para solicitar financiamiento, comience con nuestra solicitud de crédito segura a continuación.',
  creditBuildingApplyCta: lang === 'English' ? 'Start our credit application' : 'Iniciar nuestra solicitud de crédito',
  creditBuildingPartnersTitle: lang === 'English' ? 'Recommended credit-building partners' : 'Socios recomendados para construir crédito',
  creditBuildingLearnMore: lang === 'English' ? 'Learn more' : 'Saber más',
  creditBuildingSelfDesc: lang === 'English' ? 'Credit-builder loans and secured cards that report to all three bureaus. Build savings while you build credit.' : 'Préstamos y tarjetas aseguradas que reportan a las tres agencias. Ahorre mientras construye su crédito.',
  creditBuildingCreditStrongDesc: lang === 'English' ? 'Credit Strong helps you build credit history with installment loans that report to Equifax, Experian, and TransUnion.' : 'Credit Strong le ayuda a construir historial crediticio con préstamos a plazos que reportan a Equifax, Experian y TransUnion.',
  creditBuildingKickoffDesc: lang === 'English' ? 'Kikoff offers a low-cost credit-building account and line of credit designed to help establish or improve your score.' : 'Kikoff ofrece una cuenta y línea de crédito de bajo costo para establecer o mejorar su puntaje.',

  // Layaway Program
  layawayTitle: lang === 'English' ? 'Layaway program' : 'Programa de apartado',
  layawayCardDesc: lang === 'English'
    ? 'Save toward your down payment with flexible monthly payments. Sign up and we\'ll set up your plan.'
    : 'Ahorre para su enganche con pagos mensuales flexibles. Regístrese y configuraremos su plan.',
  layawayCardCta: lang === 'English' ? 'Sign up for layaway' : 'Registrarse para apartado',
  layawayIntro: lang === 'English'
    ? 'Save toward your down payment with flexible monthly payments. Sign up below and we\'ll set up your layaway plan. When you\'re ready, start our credit application to begin paying toward your down payment and lock in your path to homeownership.'
    : 'Ahorre para su enganche con pagos mensuales flexibles. Regístrese a continuación y configuraremos su plan de apartado. Cuando esté listo, inicie nuestra solicitud de crédito para comenzar a pagar su enganche y asegurar su camino hacia la vivienda.',
  layawayFormTitle: lang === 'English' ? 'Sign up for layaway' : 'Registrarse para apartado',
  layawayFullName: lang === 'English' ? 'Full name' : 'Nombre completo',
  layawayEmail: lang === 'English' ? 'Email address' : 'Correo electrónico',
  layawayPhone: lang === 'English' ? 'Phone number' : 'Número de teléfono',
  layawayMonthlyPayment: lang === 'English' ? 'Monthly payment I can afford ($)' : 'Pago mensual que puedo hacer ($)',
  layawayTargetDownPayment: lang === 'English' ? 'Target down payment ($, optional)' : 'Enganche objetivo ($, opcional)',
  layawayPreferredContact: lang === 'English' ? 'Preferred contact' : 'Contacto preferido',
  layawayNotes: lang === 'English' ? 'Notes (optional)' : 'Notas (opcional)',
  layawaySubmit: lang === 'English' ? 'Submit layaway sign-up' : 'Enviar registro de apartado',
  layawaySuccessTitle: lang === 'English' ? 'You\'re signed up' : 'Registro exitoso',
  layawaySuccessMessage: lang === 'English'
    ? 'We\'ve received your layaway sign-up. Our team will contact you to confirm your plan. When you\'re ready to start paying toward your down payment, use the button below to begin our credit application.'
    : 'Hemos recibido su registro de apartado. Nuestro equipo se comunicará con usted para confirmar su plan. Cuando esté listo para comenzar a pagar su enganche, use el botón a continuación para iniciar nuestra solicitud de crédito.',
  layawayBeginCta: lang === 'English' ? 'Begin layaway & credit application' : 'Iniciar apartado y solicitud de crédito',
});
