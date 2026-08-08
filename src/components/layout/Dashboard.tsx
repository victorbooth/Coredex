import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { CalendarClock } from 'lucide-react'
import { loadDb } from '../../data/dataProvider'
import {
  computeTotals, computePredictedIncome, getDueSoon, fmtMoney, fmtMoney2,
} from '../../utils/finance'
import { Badge, Card, CHART, Progress, Stat } from '../ui/kit'

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
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-800 ring-1 ring-amber-200">
          <CalendarClock size={18} className="shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Payments due soon: </span>
            {dueSoon.map((d) => `${d.account.nickname} in ${d.days}d`).join(' · ')}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net Worth" value={fmtMoney(totals.netWorth)} accent="text-sapphire-700" />
        <Stat label="Total Cash" value={fmtMoney(totals.cash)} />
        <Stat label="Total Debt" value={fmtMoney(totals.totalDebt)} accent="text-rose-600" />
        <Stat
          label="Predicted Income"
          value={`${fmtMoney2(income.totalAnnual)}/yr`}
          sub={`${fmtMoney2(income.hourly)} / work hour`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Assets vs Debt" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" tick={CHART.tick} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                  tick={CHART.tick} axisLine={false} tickLine={false} width={44}
                />
                <Tooltip formatter={(v) => fmtMoney(Number(v))} contentStyle={CHART.tooltip} cursor={{ fill: '#f0f6ff' }} />
                <Bar dataKey="value" fill={CHART.primary} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Savings Goals">
            <div className="space-y-3">
              {db.goals.filter((g) => g.status === 'active').map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
                return (
                  <div key={g.id}>
                    <div className="mb-1 flex justify-between text-xs text-ink-600">
                      <span>{g.name}</span><span className="font-semibold text-ink-900">{pct}%</span>
                    </div>
                    <Progress pct={pct} tone="emerald" />
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="Upcoming Payments">
            {dueSoon.length === 0 ? (
              <p className="text-xs text-ink-400">No payments due in the next 7 days.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {dueSoon.map((d) => (
                  <li key={d.account.id} className="flex items-center justify-between">
                    <span className="text-ink-600">{d.account.nickname}</span>
                    <Badge tone={d.days <= 1 ? 'negative' : 'warn'}>{d.days}d</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
