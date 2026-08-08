import { useMemo, useState } from 'react'
import { loadDb } from '../../data/dataProvider'
import { simulatePayoff, type DebtInput } from '../../utils/payoff'
import { fmtMoney } from '../../utils/finance'

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

export default function LoansPage() {
  const db = useMemo(() => loadDb(), [])

  const loanAccounts = db.accounts.filter((a) =>
    ['mortgage', 'loan', 'lineOfCredit'].includes(a.accountType))

  const allDebts: DebtInput[] = useMemo(() => {
    const cards = db.accounts.filter((a) => a.accountType === 'creditCard')
      .map((a) => ({ id: a.id, name: a.nickname, balance: a.currentBalance, apr: a.apr ?? 0, minPayment: a.minimumPayment ?? 25 }))
    const loans = db.accounts.filter((a) => ['loan', 'lineOfCredit'].includes(a.accountType))
      .map((a) => {
        const ld = db.loans.find((l) => l.accountId === a.id)
        return { id: a.id, name: a.nickname, balance: a.currentBalance, apr: ld?.interestRate ?? a.apr ?? 0, minPayment: ld?.regularPayment ?? a.minimumPayment ?? 50 }
      })
    return [...cards, ...loans]
  }, [db])

  const [included, setIncluded] = useState<string[]>(allDebts.map((d) => d.id))
  const [method, setMethod] = useState('avalanche')
  const [extra, setExtra] = useState(200)
  const [rollover, setRollover] = useState(true)

  const toggle = (id: string) =>
    setIncluded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const debts = allDebts.filter((d) => included.includes(d.id))
  const result = simulatePayoff(debts, method, extra, rollover)
  const snow = simulatePayoff(debts, 'snowball', extra, rollover)
  const aval = simulatePayoff(debts, 'avalanche', extra, rollover)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Loans & Debt</h1>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Loan</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {loanAccounts.map((a) => {
              const ld = db.loans.find((l) => l.accountId === a.id)
              return (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{a.nickname}</div>
                    <div className="text-xs text-slate-500">{a.institutionName}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{ld?.loanType ?? a.accountType}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{fmtMoney(a.currentBalance)}</td>
                  <td className="px-4 py-3 text-slate-600">{(ld?.interestRate ?? a.apr ?? 0).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-slate-600">{fmtMoney(ld?.regularPayment ?? a.minimumPayment ?? 0)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Payoff Simulator</h2>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
            <option value="snowball">Snowball (lowest balance)</option>
            <option value="avalanche">Avalanche (highest APR)</option>
            <option value="highestMinPayment">Highest min payment</option>
            <option value="lowestMinPayment">Lowest min payment</option>
          </select>
          <input type="number" value={extra} onChange={(e) => setExtra(Number(e.target.value))} className={inputCls} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={rollover} onChange={(e) => setRollover(e.target.checked)} />
            Roll over payments
          </label>
        </div>

        <div className="mb-4 space-y-1">
          {allDebts.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={included.includes(d.id)} onChange={() => toggle(d.id)} />
              {d.name} — {fmtMoney(d.balance)} @ {d.apr}%
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
          <div><span className="text-slate-500">Debt-free in</span> <span className="font-semibold">{result.months} mo</span></div>
          <div><span className="text-slate-500">Total interest</span> <span className="font-semibold">{fmtMoney(result.totalInterest)}</span></div>
          <div><span className="text-slate-500">Order</span> <span className="font-semibold">{result.order.join(' → ') || '—'}</span></div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Comparison — Snowball: {snow.months} mo / {fmtMoney(snow.totalInterest)} · Avalanche: {aval.months} mo / {fmtMoney(aval.totalInterest)}
        </p>
      </div>
    </div>
  )
}
