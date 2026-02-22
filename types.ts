
export type AppStep = 'LANDING' | 'FINANCING_INFO' | 'APPLICATION' | 'EARNEST_DEPOSIT' | 'CO_SIGNER' | 'DOCUMENTS' | 'SUCCESS' | 'ADMIN_DASHBOARD' | 'APPOINTMENT_ONLY';

/** Optional earnest deposit / payment authorization data when customer completes the step */
export interface EarnestDepositData {
  creditCardAuth: {
    nameOnCard: string;
    cardNumber: string;  // full card number (digits only), for your records; display as **** last 4
    expDate: string;
    billingAddress: string;
    amountAuthorized: string;
    signature?: string;
    date: string;
  };
  depositReceipt: {
    date: string;
    customer: string;
    address: string;
    phone: string;
    modelNumber: string;
    serialNumber: string;
    amount: string;
    customerSignature?: string;
  };
}

export type Language = 'English' | 'Español';

export interface BasePersonalData {
  name: string;
  phone: string;
  email: string;
  ssn: string;
  dob: string;
  currentAddress: string;
  yearsAtAddress: string;
  employmentStatus: string;
  employerName: string;
  jobTitle: string;
  employerPhone: string;
  yearsEmployed: string;
  monthlyIncome: number | '';
  signature?: string; // Base64 signature image
}

export interface ApplicationData extends BasePersonalData {
  language: Language;
  wantAppointment: boolean;
  appointmentDetails: string;
  landStatus: string;
  landLocation: string;
  utilities: string;
  bedrooms: string;
  targetPayment: number | '';
  creditEstimate: string;
  downPayment: number | '';
  downPaymentSource: string;
  repoHistory: string;
  hasCoSigner: boolean;
  internalScore: number;
  date: string;
  consentGiven?: boolean;
}

export interface CoSignerData extends BasePersonalData {
  relationship: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
  category: 'bank_statement' | 'pay_stub' | 'license' | 'ss_card';
  owner: 'applicant' | 'cosigner';
}

export type ApplicationStatus = 'Pending' | 'Pending Documents' | 'Reviewing' | 'Approved' | 'Denied' | 'Appointment Only';

export interface AppointmentOnlyData {
  id: string;
  name: string;
  phone: string;
  email: string;
  monthlyIncome: string;
  employmentStatus: string;
  bedrooms: string;
  utilities: string;
  creditEstimate: string;
  landStatus: string;
  landLocation?: string;
  repoHistory: string;
  appointmentDate: string;
  notes?: string;
  submittedAt: string;
  status: 'Scheduled' | 'Completed' | 'No Show' | 'Converted';
}

export interface LeadApplication {
  id: string;
  status: ApplicationStatus;
  applicant: ApplicationData;
  cosigner?: CoSignerData;
  documents: DocumentFile[];
  earnestDeposit?: EarnestDepositData;
  appointmentDate?: string | null;
  submittedAt: string;
  isAppointmentOnly?: boolean;
  appointmentData?: AppointmentOnlyData;
}
