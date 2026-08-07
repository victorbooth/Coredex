import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { loadDb } from '../../data/dataProvider'
import {
  computeTotals, computePredictedIncome, getDueSoon, fmtMoney, fmtMoney2,
} from '../../utils/finance'

function Kpi({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ?? 'text-slate-900'}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const db = useMemo(() => loadDb(), [])
  const totals = useMemo(() => computeTotals(db), [db])
  const income = useMemo(() => computePredictedIncome(db), [db])
  const dueSoon = useMemo(() => getDueSoon(db), [db])

  const chartData = [
    { name: 'Cash', value: totals.cash },
    { name: 'Invest', value: totals.investments },
    { name: 'Other', value: totals.otherAssets },
    { name: 'CC Debt', value: -totals.creditCardDebt },
    { name: 'Loan', value: -totals.loanDebt },
  ]

  return (
    <div className="space-y-6">
      {dueSoon.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span className="font-semibold">Payments due soon: </span>
          {dueSoon.map((d) => `${d.account.nickname} in ${d.days}d`).join(' · ')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Net Worth" value={fmtMoney(totals.netWorth)} accent="text-blue-700" />
        <Kpi label="Total Cash" value={fmtMoney(totals.cash)} />
        <Kpi label="Total Debt" value={fmtMoney(totals.totalDebt)} accent="text-red-600" />
        <Kpi
          label="Predicted Annual Income"
          value={fmtMoney2(income.totalAnnual)}
          sub={`${fmtMoney2(income.hourly)} / work hour`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Assets vs Debt</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => fmtMoney(Number(v))} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Savings Goals</h2>
            <div className="space-y-3">
              {db.goals.filter((g) => g.status === 'active').map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
                return (
                  <div key={g.id}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600">
                      <span>{g.name}</span><span>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Upcoming Payments</h2>
            {dueSoon.length === 0 ? (
              <p className="text-xs text-slate-500">No payments due in the next 7 days.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {dueSoon.map((d) => (
                  <li key={d.account.id} className="flex justify-between">
                    <span className="text-slate-700">{d.account.nickname}</span>
                    <span className={d.days <= 1 ? 'text-red-600' : 'text-amber-600'}>{d.days}d</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
