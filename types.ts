
export type AppStep = 'LANDING' | 'PROCESS' | 'APPLICATION' | 'CO_SIGNER' | 'CUSTOMIZER' | 'DOCUMENTS' | 'SUMMARY' | 'DEPOSIT_RECEIPT' | 'PAYMENT_AUTH' | 'SUCCESS' | 'ADMIN_DASHBOARD' | 'APPOINTMENT_ONLY' | 'LAYAWAY_SIGNUP';

export type Language = 'English' | 'Español';

export interface DepositReceiptData {
  date: string;
  customerName: string;
  address: string;
  phone: string;
  modelNum: string;
  serialNum: string;
  amount: number;
  paymentMethod: string;
  signature: string;
}

export interface PaymentAuthData {
  customerName: string;
  billingAddress: string;
  zipCode: string;
  cardType: 'MasterCard' | 'Visa' | 'American Express' | 'Discover' | 'Other';
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  isRecurring: boolean;
}

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
  signature?: string; // Text or Base64
}

export interface CustomizationData {
  homeType: 'Single Wide' | 'Double Wide';
  bedrooms: string;
  bathrooms: string;
  isIdeal: boolean;
  hasWell: boolean;
  hasSeptic: boolean;
  hasElectric: boolean;
  wantsPark: boolean;
  estimatedTotal: number;
}

export interface ApplicationData extends BasePersonalData {
  language: Language;
  wantAppointment: boolean;
  appointmentDetails: string;
  preferredContact?: 'Phone' | 'Email' | 'Text';
  bestTimeToCall?: 'Morning' | 'Afternoon' | 'Evening';
  homeTypeInterest?: 'Single Wide' | 'Double Wide' | 'Any';
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
  customization?: CustomizationData;
}

export interface CoSignerData extends BasePersonalData {
  relationship: string;
}

export interface AppointmentOnlyData {
  name: string;
  phone: string;
  email: string;
  monthlyIncome: number | '';
  employmentStatus: string;
  bedroomsNeeded: string;
  utilitiesAtSite: string;
  creditScoreEstimate: string;
  hasLand: string;
  landLocation: string;
  repoHistory7Years: string;
  preferredDate: string;
  notes: string;
  submittedAt: string;
}

export interface LayawayData {
  fullName: string;
  email: string;
  phone: string;
  monthlyPaymentAfford: number | '';
  targetDownPayment: number | '';
  preferredContact: 'Phone' | 'Email' | 'Text';
  notes: string;
  submittedAt: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size?: number;
  data: string; // Base64
  category: 'bank_statement_1' | 'bank_statement_2' | 'bank_statement_3' | 'pay_stub' | 'license' | 'ss_card';
  owner: 'applicant' | 'cosigner';
}

export interface LeadApplication {
  id: string;
  status: 'Pending' | 'Reviewing' | 'Approved' | 'Denied';
  applicant: ApplicationData;
  cosigner?: CoSignerData;
  documents: DocumentFile[];
  depositReceipt?: DepositReceiptData;
  paymentAuth?: PaymentAuthData;
  submittedAt: string;
  type: 'CREDIT_APP' | 'APPOINTMENT_ONLY' | 'LAYAWAY';
  isComplete?: boolean;
  layawayData?: LayawayData; // Present when type === 'LAYAWAY'
}
