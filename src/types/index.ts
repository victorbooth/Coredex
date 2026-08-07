export type Person = {
  id: string;
  name: string;
  employer: string;
  isEsppParticipant: boolean;
  annualWorkHours: number;
};

export type AccountType =
  | 'checking' | 'savings' | 'hysa' | 'creditCard' | 'investment'
  | 'retirement' | 'loan' | 'lineOfCredit' | 'mortgage'
  | 'otherAsset' | 'otherLiability';

export type LoanType =
  | 'mortgage' | 'auto' | 'student' | 'personal' | 'lineOfCredit'
  | 'homeImprovement' | 'debtConsolidation' | 'other';

export type AssetType =
  | 'coin' | 'tradingCard' | 'book' | 'electronics' | 'jewelry'
  | 'art' | 'vehicle' | 'realEstate' | 'other';

export type Account = {
  id: string;
  personId: string | null;
  institutionName: string;
  accountType: AccountType;
  nickname: string;
  last4: string;
  fullAccountNumber?: string;
  routingNumber?: string;
  currentBalance: number;
  asOfDate: string;
  apy?: number;
  apr?: number;
  creditLimit?: number;
  minimumPayment?: number;
  dueDay?: number;
  statementDay?: number;
  autopayEnabled: boolean;
  onlineBankingUrl?: string;
  passwordManagerUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreditCardDetails = {
  accountId: string;
  rewardsType: 'cashBack' | 'points' | 'miles' | 'other' | 'none';
  rewardsRate?: string;
  bonusCategories?: string;
  annualFee: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
};

export type LoanDetails = {
  accountId: string;
  loanType: LoanType;
  originalAmount: number;
  interestRate: number;
  regularPayment: number;
  termMonths?: number;
  startMonth?: string;
  targetPayoffDate?: string;
  escrowAmount?: number;
  insuranceAmount?: number;
  pmiAmount?: number;
};

export type Position = {
  id: string;
  accountId: string;
  personId: string | null;
  symbol: string;
  name: string;
  assetClass: 'stock' | 'etf' | 'crypto' | 'mutualFund' | 'bond' | 'other';
  shares: number;
  costBasisPerShare?: number;
  dividendPerShare?: number;
  dividendFrequency?: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  currentPrice?: number;
  priceSource: 'googleFinance' | 'manual';
  notes?: string;
};

export type RsuGrant = {
  id: string;
  personId: string;
  employer: string;
  grantDate: string;
  grantId: string;
  totalShares: number;
  vestingSchedule: 'single' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  sharesVested: number;
  sharesUnvested: number;
  currentPrice?: number;
};

export type EsppProgram = {
  id: string;
  personId: string;
  employer: string;
  planName: string;
  discountPercent: number;
  lookbackEnabled: boolean;
  contributionType: 'percent' | 'fixed';
  contributionValue: number;
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  offeringStartDate: string;
  purchaseDate: string;
  accumulatedContribution: number;
  status: 'active' | 'paused' | 'completed';
  linkedLocAccountId?: string;
};

export type EsppContribution = {
  id: string;
  esppProgramId: string;
  personId: string;
  paycheckDate: string;
  amount: number;
  fundedByLoc: boolean;
  locDrawAmount?: number;
  locDrawDate?: string;
};

export type EsppPurchase = {
  id: string;
  esppProgramId: string;
  personId: string;
  purchaseDate: string;
  contributionUsed: number;
  fairMarketValue: number;
  purchasePrice: number;
  sharesPurchased: number;
  status: 'sold' | 'held' | 'partiallySold';
  salePricePerShare?: number;
  saleProceeds?: number;
  locPayoffAmount?: number;
  netProceeds?: number;
  estimatedRoi?: number;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
  monthlyContribution: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
};

export type PayoffPlan = {
  id: string;
  name: string;
  method: 'snowball' | 'avalanche' | 'highestMinPayment' | 'lowestMinPayment'
    | 'custom' | 'dueDateOptimized' | 'cashFlowOptimized';
  extraMonthlyPayment: number;
  startDate: string;
  includedAccountIds: string[];
  rolloverPayments: boolean;
  targetPayoffDate?: string;
};

export type CashFlowCategory = {
  id: string;
  name: string;
  isArchived: boolean;
  sortOrder: number;
};

export type CollectibleItem = {
  id: string;
  assetType: AssetType;
  itemName: string;
  quantity: number;
  estimatedValue: number;
  valueAsOfDate: string;
  storageLocation?: string;
  frontImageLink?: string;
  backImageLink?: string;
};

export type AppSettings = {
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  annualWorkHours: number;
  passwordManagerUrl: string;
  defaultAlertLeadDays: number[];
  dataSource: 'demo' | 'sheets';
};
