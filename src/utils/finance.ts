import type { Database } from '../data/sampleData'
import type { Account } from '../types'

export const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const fmtMoney2 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function accountsByType(db: Database, types: string[]) {
  return db.accounts.filter((a) => types.includes(a.accountType))
}

export function sumBalances(accounts: Account[]) {
  return accounts.reduce((s, a) => s + a.currentBalance, 0)
}

export function computeTotals(db: Database) {
  const cash = sumBalances(accountsByType(db, ['checking', 'savings', 'hysa']))
  const investments = sumBalances(accountsByType(db, ['investment', 'retirement']))
  const otherAssets = db.collectibles.reduce((s, c) => s + c.estimatedValue * c.quantity, 0)
  const totalAssets = cash + investments + otherAssets
  const creditCardDebt = sumBalances(accountsByType(db, ['creditCard']))
  const loanDebt = sumBalances(accountsByType(db, ['loan', 'mortgage', 'lineOfCredit']))
  const totalDebt = creditCardDebt + loanDebt
  const netWorth = totalAssets - totalDebt
  return { cash, investments, otherAssets, totalAssets, creditCardDebt, loanDebt, totalDebt, netWorth }
}

const freqMultiplier = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1 } as const

export function computePredictedIncome(db: Database) {
  let dividendIncome = 0
  for (const p of db.positions) {
    if (p.dividendPerShare && p.dividendFrequency) {
      dividendIncome += p.shares * p.dividendPerShare * freqMultiplier[p.dividendFrequency]
    }
  }
  let interestIncome = 0
  for (const a of accountsByType(db, ['hysa', 'savings'])) {
    if (a.apy) interestIncome += a.currentBalance * (a.apy / 100)
  }
  const totalAnnual = dividendIncome + interestIncome
  const hourly = totalAnnual / (db.settings.annualWorkHours || 2080)
  return { dividendIncome, interestIncome, totalAnnual, hourly }
}

export function daysUntilDue(dueDay: number): number {
  const now = new Date()
  const today = now.getDate()
  const daysLeft = dueDay - today
  if (daysLeft >= 0) return daysLeft
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return daysLeft + lastDay
}

export function getDueSoon(db: Database, windowDays = 7) {
  const items: { account: Account; days: number }[] = []
  for (const a of db.accounts) {
    const isDebt = ['creditCard', 'loan', 'lineOfCredit', 'mortgage'].includes(a.accountType)
    if (a.dueDay != null && isDebt) {
      const days = daysUntilDue(a.dueDay)
      if (days <= windowDays) items.push({ account: a, days })
    }
  }
  return items.sort((x, y) => x.days - y.days)
}
