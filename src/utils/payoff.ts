export type DebtInput = {
  id: string; name: string; balance: number; apr: number; minPayment: number
}

export type PayoffResult = { months: number; totalInterest: number; order: string[] }

function pickTarget(debts: DebtInput[], method: string): DebtInput {
  const s = [...debts]
  switch (method) {
    case 'snowball': s.sort((a, b) => a.balance - b.balance); break
    case 'highestMinPayment': s.sort((a, b) => b.minPayment - a.minPayment); break
    case 'lowestMinPayment': s.sort((a, b) => a.minPayment - b.minPayment); break
    default: s.sort((a, b) => b.apr - a.apr)
  }
  return s[0]
}

export function simulatePayoff(
  debts: DebtInput[], method: string, extra: number, rollover: boolean,
): PayoffResult {
  const bal = debts.map((d) => ({ ...d }))
  let months = 0
  let totalInterest = 0
  let freed = 0
  const order: string[] = []

  while (bal.some((d) => d.balance > 0.01) && months < 600) {
    months++
    for (const d of bal) {
      if (d.balance > 0) {
        const int = d.balance * (d.apr / 100 / 12)
        d.balance += int
        totalInterest += int
      }
    }
    for (const d of bal) {
      if (d.balance > 0) d.balance -= Math.min(d.minPayment, d.balance)
    }
    const remaining = bal.filter((d) => d.balance > 0.01)
    if (remaining.length) {
      const target = pickTarget(remaining, method)
      target.balance = Math.max(0, target.balance - (extra + freed))
    }
    for (const d of bal) {
      if (d.balance <= 0.01 && !order.includes(d.name)) {
        order.push(d.name)
        if (rollover) freed += d.minPayment
      }
    }
  }
  return { months, totalInterest, order }
}
