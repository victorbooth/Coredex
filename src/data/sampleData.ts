import type {
  Person, Account, CreditCardDetails, LoanDetails, Position, RsuGrant,
  EsppProgram, EsppContribution, EsppPurchase, SavingsGoal, PayoffPlan,
  CashFlowCategory, CollectibleItem, AppSettings,
} from '../types'

export type Database = {
  people: Person[]
  accounts: Account[]
  creditCards: CreditCardDetails[]
  loans: LoanDetails[]
  positions: Position[]
  rsuGrants: RsuGrant[]
  esppPrograms: EsppProgram[]
  esppContributions: EsppContribution[]
  esppPurchases: EsppPurchase[]
  goals: SavingsGoal[]
  payoffPlans: PayoffPlan[]
  cashFlowCategories: CashFlowCategory[]
  collectibles: CollectibleItem[]
  settings: AppSettings
}

export const sampleDb: Database = {
  people: [
    { id: 'p1', name: 'Alex', employer: 'Acme Corp', isEsppParticipant: true, annualWorkHours: 2080 },
    { id: 'p2', name: 'Jordan', employer: 'Globex Inc', isEsppParticipant: true, annualWorkHours: 2080 },
  ],
  accounts: [
    { id: 'a1', personId: 'p1', institutionName: 'Chase', accountType: 'checking', nickname: 'Everyday Checking', last4: '1001', currentBalance: 4500, asOfDate: '2025-06-01', autopayEnabled: false, createdAt: '2025-01-01', updatedAt: '2025-06-01' },
    { id: 'a2', personId: 'p2', institutionName: 'Ally', accountType: 'hysa', nickname: 'High Yield Savings', last4: '2002', currentBalance: 25000, asOfDate: '2025-06-01', apy: 4.3, autopayEnabled: false, createdAt: '2025-01-01', updatedAt: '2025-06-01' },
    { id: 'a3', personId: 'p1', institutionName: 'Chase', accountType: 'creditCard', nickname: 'Sapphire', last4: '3003', currentBalance: 2400, asOfDate: '2025-06-01', apr: 21.99, creditLimit: 12000, minimumPayment: 48, dueDay: 15, statementDay: 20, autopayEnabled: true, onlineBankingUrl: 'https://chase.com', createdAt: '2025-01-01', updatedAt: '2025-06-01' },
    { id: 'a4', personId: 'p2', institutionName: 'Amex', accountType: 'creditCard', nickname: 'Blue Cash', last4: '4004', currentBalance: 1200, asOfDate: '2025-06-01', apr: 18.99, creditLimit: 8000, minimumPayment: 35, dueDay: 22, statementDay: 1, autopayEnabled: false, onlineBankingUrl: 'https://amex.com', createdAt: '2025-01-01', updatedAt: '2025-06-01' },
    { id: 'a5', personId: null, institutionName: 'Rocket', accountType: 'mortgage', nickname: 'Home Mortgage', last4: '5005', currentBalance: 320000, asOfDate: '2025-06-01', apr: 3.5, autopayEnabled: true, createdAt: '2025-01-01', updatedAt: '2025-06-01' },
    { id: 'a6', personId: 'p1', institutionName: 'Wells Fargo', accountType: 'lineOfCredit', nickname: 'Personal LOC', last4: '6006', currentBalance: 3000, asOfDate: '2025-06-01', apr: 9.0, creditLimit: 20000, minimumPayment: 90, dueDay: 5, autopayEnabled: false, createdAt: '2025-01-01', updatedAt: '2025-06-01' },
    { id: 'a7', personId: 'p1', institutionName: 'Fidelity', accountType: 'investment', nickname: 'Brokerage', last4: '7007', currentBalance: 85000, asOfDate: '2025-06-01', autopayEnabled: false, createdAt: '2025-01-01', updatedAt: '2025-06-01' },
    { id: 'a8', personId: 'p2', institutionName: 'Vanguard', accountType: 'retirement', nickname: '401k', last4: '8008', currentBalance: 150000, asOfDate: '2025-06-01', autopayEnabled: false, createdAt: '2025-01-01', updatedAt: '2025-06-01' },
  ],
  creditCards: [
    { accountId: 'a3', rewardsType: 'points', rewardsRate: '2x travel', bonusCategories: 'Travel & dining', annualFee: 95, lastPaymentDate: '2025-05-15', lastPaymentAmount: 500 },
    { accountId: 'a4', rewardsType: 'cashBack', rewardsRate: '3% groceries', bonusCategories: 'Groceries, gas', annualFee: 0, lastPaymentDate: '2025-05-22', lastPaymentAmount: 300 },
  ],
  loans: [
    { accountId: 'a5', loanType: 'mortgage', originalAmount: 350000, interestRate: 3.5, regularPayment: 1900, termMonths: 360, escrowAmount: 450 },
    { accountId: 'a6', loanType: 'lineOfCredit', originalAmount: 20000, interestRate: 9.0, regularPayment: 90 },
  ],
  positions: [
    { id: 'pos1', accountId: 'a7', personId: 'p1', symbol: 'AAPL', name: 'Apple Inc', assetClass: 'stock', shares: 50, costBasisPerShare: 150, dividendPerShare: 1.0, dividendFrequency: 'quarterly', currentPrice: 190, priceSource: 'googleFinance' },
    { id: 'pos2', accountId: 'a7', personId: 'p1', symbol: 'VTI', name: 'Total Market ETF', assetClass: 'etf', shares: 100, costBasisPerShare: 220, dividendPerShare: 3.2, dividendFrequency: 'quarterly', currentPrice: 260, priceSource: 'googleFinance' },
    { id: 'pos3', accountId: 'a7', personId: 'p2', symbol: 'BTC', name: 'Bitcoin', assetClass: 'crypto', shares: 0.5, costBasisPerShare: 40000, currentPrice: 65000, priceSource: 'googleFinance' },
  ],
  rsuGrants: [
    { id: 'r1', personId: 'p1', employer: 'Acme Corp', grantDate: '2024-01-15', grantId: 'RSU-2024-001', totalShares: 400, vestingSchedule: 'quarterly', sharesVested: 200, sharesUnvested: 200, currentPrice: 190 },
  ],
  esppPrograms: [
    { id: 'e1', personId: 'p1', employer: 'Acme Corp', planName: 'ESPP 2025', discountPercent: 15, lookbackEnabled: true, contributionType: 'percent', contributionValue: 10, payFrequency: 'biweekly', offeringStartDate: '2025-01-01', purchaseDate: '2025-06-30', accumulatedContribution: 3000, status: 'active', linkedLocAccountId: 'a6' },
    { id: 'e2', personId: 'p2', employer: 'Globex Inc', planName: 'ESPP 2025', discountPercent: 5, lookbackEnabled: false, contributionType: 'fixed', contributionValue: 200, payFrequency: 'biweekly', offeringStartDate: '2025-01-01', purchaseDate: '2025-06-30', accumulatedContribution: 1800, status: 'active', linkedLocAccountId: 'a6' },
  ],
  esppContributions: [
    { id: 'ec1', esppProgramId: 'e1', personId: 'p1', paycheckDate: '2025-05-16', amount: 500, fundedByLoc: true, locDrawAmount: 500, locDrawDate: '2025-05-16' },
    { id: 'ec2', esppProgramId: 'e1', personId: 'p1', paycheckDate: '2025-05-30', amount: 500, fundedByLoc: false },
    { id: 'ec3', esppProgramId: 'e2', personId: 'p2', paycheckDate: '2025-05-16', amount: 200, fundedByLoc: true, locDrawAmount: 200, locDrawDate: '2025-05-16' },
  ],
  esppPurchases: [
    { id: 'ep1', esppProgramId: 'e1', personId: 'p1', purchaseDate: '2024-12-31', contributionUsed: 2800, fairMarketValue: 100, purchasePrice: 85, sharesPurchased: 32.94, status: 'sold', salePricePerShare: 100, saleProceeds: 3294, locPayoffAmount: 2800, netProceeds: 494, estimatedRoi: 17.6 },
  ],
  goals: [
    { id: 'g1', name: 'Emergency Fund', targetAmount: 20000, targetDate: '2026-01-01', currentAmount: 12000, monthlyContribution: 500, status: 'active', createdAt: '2025-01-01' },
    { id: 'g2', name: 'Vacation', targetAmount: 5000, targetDate: '2025-12-01', currentAmount: 2000, monthlyContribution: 300, status: 'active', createdAt: '2025-01-01' },
  ],
  payoffPlans: [
    { id: 'pp1', name: 'Snowball Plan', method: 'snowball', extraMonthlyPayment: 200, startDate: '2025-06-01', includedAccountIds: ['a3', 'a4'], rolloverPayments: true },
  ],
  cashFlowCategories: [
    { id: 'c1', name: 'Entertainment', isArchived: false, sortOrder: 1 },
    { id: 'c2', name: 'Dining', isArchived: false, sortOrder: 2 },
    { id: 'c3', name: 'Groceries', isArchived: false, sortOrder: 3 },
  ],
  collectibles: [
    { id: 'col1', assetType: 'coin', itemName: '2021 Silver Eagle', quantity: 5, estimatedValue: 175, valueAsOfDate: '2025-06-01', storageLocation: 'Home safe' },
    { id: 'col2', assetType: 'coin', itemName: '1921 Morgan Dollar', quantity: 1, estimatedValue: 65, valueAsOfDate: '2025-06-01', storageLocation: 'Home safe' },
  ],
  settings: {
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '24h',
    annualWorkHours: 2080,
    passwordManagerUrl: 'https://bitwarden.com',
    defaultAlertLeadDays: [7, 3, 1],
    dataSource: 'demo',
  },
}
