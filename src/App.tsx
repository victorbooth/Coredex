import { useMemo, useState } from 'react'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  LayoutDashboard, CreditCard, HandCoins, TrendingUp, Coins, Gem, Target,
  Settings, CalendarClock,
} from 'lucide-react'
import { loadDb, saveDb, resetDb } from './data/dataProvider'
import type { Database } from './data/sampleData'
import type { Account, Position, SavingsGoal, CollectibleItem, AssetType } from './types'
import { computeTotals, computePredictedIncome, getDueSoon, fmtMoney, fmtMoney2 } from './utils/finance'
import { simulatePayoff, type DebtInput } from './utils/payoff'

/* ============ UI KIT ============ */
export const inputCls =
  'w-full rounded-lg border border-alice-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-sapphire-400 focus:outline-none focus:ring-2 focus:ring-sapphire-100'

export const thCls = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400'
export const tdCls = 'px-4 py-3 text-sm text-ink-600'

export const CHART = {
  grid: '#e3effb',
  tick: { fontSize: 12, fill: '#8091a7' },
  primary: '#3a72e8',
  positive: '#10b981',
  negative: '#f43f5e',
}

export const CHART_TOOLTIP: CSSProperties = {
  borderRadius: 12,
  border: '1px solid #e3effb',
  background: '#ffffff',
  fontSize: 12,
  boxShadow: '0 12px 32px -16px rgb(18 32 58 / 0.25)',
}

export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ title, action, children, className = '' }: {
  title?: string; action?: ReactNode; children: ReactNode; className?: string
}) {
  return (
    <section className={`rounded-2xl border border-alice-200 bg-white shadow-card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-alice-100 px-5 py-4">
          {title && <h2 className="text-sm font-semibold text-ink-900">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: BtnProps) {
  const variants = {
    primary: 'bg-sapphire-600 text-white hover:bg-sapphire-700 shadow-card',
    secondary: 'bg-white text-ink-600 ring-1 ring-alice-300 hover:bg-alice-50 hover:text-ink-900',
    ghost: 'text-sapphire-600 hover:bg-sapphire-50',
    danger: 'bg-white text-rose-600 ring-1 ring-rose-300 hover:bg-rose-50',
  } as const
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' } as const
  return (
    <button
      className={`rounded-full font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export function Badge({ tone = 'neutral', children }: {
  tone?: 'positive' | 'negative' | 'warn' | 'info' | 'neutral'; children: ReactNode
}) {
  const tones = {
    positive: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    negative: 'bg-rose-50 text-rose-700 ring-rose-200',
    warn: 'bg-amber-50 text-amber-700 ring-amber-200',
    info: 'bg-sapphire-50 text-sapphire-700 ring-sapphire-200',
    neutral: 'bg-alice-100 text-ink-600 ring-alice-300',
  } as const
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Stat({ label, value, sub, badge, accent }: {
  label: string; value: string; sub?: string; badge?: ReactNode; accent?: string
}) {
  return (
    <div className="rounded-2xl border border-alice-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</span>
        {badge}
      </div>
      <div className={`mt-2 text-2xl font-bold tracking-tight ${accent ?? 'text-ink-900'}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-600">{sub}</div>}
    </div>
  )
}

export function Progress({ pct, tone = 'sapphire' }: {
  pct: number; tone?: 'sapphire' | 'emerald' | 'amber'
}) {
  const bar = { sapphire: 'bg-sapphire-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500' }[tone]
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-alice-200">
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-ink-600">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  )
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-alice-200 bg-white shadow-card">
      <table className="w-full">
        <thead className="border-b border-alice-200 bg-alice-50">
          <tr>{headers.map((h, i) => <th key={i} className={thCls}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-alice-100">{children}</tbody>
      </table>
    </div>
  )
}

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-alice-200 bg-white p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-ink-400 transition-colors hover:bg-alice-100 hover:text-ink-900">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const DEMO_PIN = '1234'

export function PinDialog({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const submit = () => {
    if (pin === DEMO_PIN) { setPin(''); setError(false); onSuccess() } else { setError(true) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Enter PIN">
      <input
        type="password"
        value={pin}
        onChange={(e) => { setPin(e.target.value); setError(false) }}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className={inputCls}
        placeholder="PIN"
        autoFocus
      />
      {error && <p className="mt-2 text-sm text-rose-600">Incorrect PIN</p>}
      <p className="mt-2 text-xs text-ink-400">Demo PIN: 1234</p>
      <Button onClick={submit} className="mt-4 w-full">Reveal</Button>
    </Modal>
  )
}

/* ============ DASHBOARD ============ */
function Dashboard() {
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
          <p>
            <span className="font-semibold">Payments due soon:</span>{' '}
            {dueSoon.map((d) => `${d.account.nickname} in ${d.days}d`).join(' · ')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net Worth" value={fmtMoney(totals.netWorth)} accent="text-sapphire-700" />
        <Stat label="Total Cash" value={fmtMoney(totals.cash)} />
        <Stat label="Total Debt" value={fmtMoney(totals.totalDebt)} accent="text-rose-600" />
        <Stat
          label="Predicted Income"
          value={`${fmtMoney2(income.totalAnnual)}/yr`}
          sub={`${fmtMoney2(income.hourly)} passive hourly wage`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Assets vs Debt" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" tick={CHART.tick} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} tick={CHART.tick} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v) => fmtMoney(Number(v))} contentStyle={CHART_TOOLTIP} cursor={{ fill: '#f0f6ff' }} />
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
                      <span className="font-medium">{g.name}</span><span>{pct}%</span>
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

/* ============ ACCOUNTS & CARDS ============ */
function AccountsPage() {
  const [db, setDb] = useState<Database>(() => loadDb())
  const [pinFor, setPinFor] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [payFor, setPayFor] = useState<Account | null>(null)

  const commit = (next: Database) => { saveDb(next); setDb(next) }
  const cardDetails = (id: string) => db.creditCards.find((c) => c.accountId === id)

  const addCard = (f: { institution: string; nickname: string; last4: string; balance: number; limit: number; apr: number; minPay: number; dueDay: number }) => {
    const id = 'a' + Date.now()
    const acc: Account = {
      id, personId: null, institutionName: f.institution, accountType: 'creditCard',
      nickname: f.nickname, last4: f.last4, currentBalance: f.balance,
      asOfDate: new Date().toISOString().slice(0, 10), apr: f.apr, creditLimit: f.limit,
      minimumPayment: f.minPay, dueDay: f.dueDay, autopayEnabled: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    commit({
      ...db,
      accounts: [...db.accounts, acc],
      creditCards: [...db.creditCards, { accountId: id, rewardsType: 'none', annualFee: 0 }],
    })
    setShowNew(false)
  }

  const logPayment = (accountId: string, amount: number) => {
    commit({
      ...db,
      accounts: db.accounts.map((a) => a.id === accountId
        ? { ...a, currentBalance: Math.max(0, a.currentBalance - amount), updatedAt: new Date().toISOString() }
        : a),
      creditCards: db.creditCards.map((c) => c.accountId === accountId
        ? { ...c, lastPaymentDate: new Date().toISOString().slice(0, 10), lastPaymentAmount: amount }
        : c),
    })
    setPayFor(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts & Cards" action={<Button onClick={() => setShowNew(true)}>+ New Card</Button>} />

      <Table headers={['Account', 'Type', 'Balance', 'Number', 'Actions']}>
        {db.accounts.map((a) => {
          const isCard = a.accountType === 'creditCard'
          const cd = cardDetails(a.id)
          const util = a.creditLimit ? Math.round((a.currentBalance / a.creditLimit) * 100) : 0
          return (
            <tr key={a.id}>
              <td className={tdCls}>
                <div className="font-medium text-ink-900">{a.nickname}</div>
                <div className="text-xs text-ink-400">{a.institutionName}</div>
              </td>
              <td className={`${tdCls} capitalize`}>{a.accountType}</td>
              <td className={`${tdCls} font-medium text-ink-900`}>{fmtMoney(a.currentBalance)}</td>
              <td className={tdCls}>
                {revealed === a.id ? (
                  <div className="text-xs">
                    <div>Acct: {a.fullAccountNumber ?? '123456789012'}</div>
                    <div>Routing: {a.routingNumber ?? '021000021'}</div>
                    <Button variant="ghost" size="sm" className="mt-1 px-2 py-0.5" onClick={() => setRevealed(null)}>hide</Button>
                  </div>
                ) : (
                  <span className="cursor-pointer text-ink-600 hover:text-sapphire-600" onClick={() => setPinFor(a.id)}>
                    •••• {a.last4}
                  </span>
                )}
              </td>
              <td className={tdCls}>
                {isCard && <Button variant="secondary" size="sm" onClick={() => setPayFor(a)}>Pay</Button>}
                {isCard && cd && <div className="mt-1 text-xs text-ink-400">Util {util}% · due day {a.dueDay}</div>}
              </td>
            </tr>
          )
        })}
      </Table>

      <PinDialog
        open={pinFor !== null}
        onClose={() => setPinFor(null)}
        onSuccess={() => { if (pinFor) setRevealed(pinFor); setPinFor(null) }}
      />
      <NewCardModal open={showNew} onClose={() => setShowNew(false)} onAdd={addCard} />
      <PaymentModal account={payFor} onClose={() => setPayFor(null)} onPay={logPayment} />
    </div>
  )
}

function NewCardModal({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void
  onAdd: (f: { institution: string; nickname: string; last4: string; balance: number; limit: number; apr: number; minPay: number; dueDay: number }) => void
}) {
  const [f, setF] = useState({ institution: '', nickname: '', last4: '', balance: 0, limit: 0, apr: 0, minPay: 0, dueDay: 1 })
  const set = (k: keyof typeof f, v: string | number) => setF({ ...f, [k]: v })
  return (
    <Modal open={open} onClose={onClose} title="New Credit Card">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Institution"><input className={inputCls} value={f.institution} onChange={(e) => set('institution', e.target.value)} /></Field>
        <Field label="Nickname"><input className={inputCls} value={f.nickname} onChange={(e) => set('nickname', e.target.value)} /></Field>
        <Field label="Last 4"><input className={inputCls} value={f.last4} onChange={(e) => set('last4', e.target.value)} /></Field>
        <Field label="Balance"><input className={inputCls} type="number" value={f.balance} onChange={(e) => set('balance', Number(e.target.value))} /></Field>
        <Field label="Credit limit"><input className={inputCls} type="number" value={f.limit} onChange={(e) => set('limit', Number(e.target.value))} /></Field>
        <Field label="APR %"><input className={inputCls} type="number" value={f.apr} onChange={(e) => set('apr', Number(e.target.value))} /></Field>
        <Field label="Min payment"><input className={inputCls} type="number" value={f.minPay} onChange={(e) => set('minPay', Number(e.target.value))} /></Field>
        <Field label="Due day"><input className={inputCls} type="number" value={f.dueDay} onChange={(e) => set('dueDay', Number(e.target.value))} /></Field>
      </div>
      <Button onClick={() => onAdd(f)} className="mt-4 w-full">Add Card</Button>
    </Modal>
  )
}

function PaymentModal({ account, onClose, onPay }: {
  account: Account | null; onClose: () => void; onPay: (id: string, amount: number) => void
}) {
  const [amount, setAmount] = useState('')
  if (!account) return null
  return (
    <Modal open={!!account} onClose={onClose} title={`Pay ${account.nickname}`}>
      <Field label="Amount">
        <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Button onClick={() => onPay(account.id, Number(amount))} className="mt-4 w-full">Log Payment</Button>
    </Modal>
  )
}

/* ============ LOANS & DEBT ============ */
function LoansPage() {
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
      <PageHeader title="Loans & Debt" />

      <Table headers={['Loan', 'Type', 'Balance', 'Rate', 'Payment']}>
        {loanAccounts.map((a) => {
          const ld = db.loans.find((l) => l.accountId === a.id)
          return (
            <tr key={a.id}>
              <td className={tdCls}>
                <div className="font-medium text-ink-900">{a.nickname}</div>
                <div className="text-xs text-ink-400">{a.institutionName}</div>
              </td>
              <td className={`${tdCls} capitalize`}>{ld?.loanType ?? a.accountType}</td>
              <td className={`${tdCls} font-medium text-ink-900`}>{fmtMoney(a.currentBalance)}</td>
              <td className={tdCls}>{(ld?.interestRate ?? a.apr ?? 0).toFixed(2)}%</td>
              <td className={tdCls}>{fmtMoney(ld?.regularPayment ?? a.minimumPayment ?? 0)}</td>
            </tr>
          )
        })}
      </Table>

      <Card title="Payoff Simulator">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Method">
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
              <option value="snowball">Snowball (lowest balance)</option>
              <option value="avalanche">Avalanche (highest APR)</option>
              <option value="highestMinPayment">Highest min payment</option>
              <option value="lowestMinPayment">Lowest min payment</option>
            </select>
          </Field>
          <Field label="Extra monthly payment">
            <input type="number" value={extra} onChange={(e) => setExtra(Number(e.target.value))} className={inputCls} />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-ink-600">
            <input type="checkbox" checked={rollover} onChange={(e) => setRollover(e.target.checked)} />
            Roll over payments
          </label>
        </div>

        <div className="mb-4 space-y-1">
          {allDebts.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={included.includes(d.id)} onChange={() => toggle(d.id)} />
              {d.name} — {fmtMoney(d.balance)} @ {d.apr}%
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-xl bg-alice-50 p-4 text-sm sm:grid-cols-3">
          <div><span className="text-ink-400">Debt-free in</span> <span className="font-semibold text-ink-900">{result.months} mo</span></div>
          <div><span className="text-ink-400">Total interest</span> <span className="font-semibold text-ink-900">{fmtMoney(result.totalInterest)}</span></div>
          <div><span className="text-ink-400">Order</span> <span className="font-semibold text-ink-900">{result.order.join(' → ') || '—'}</span></div>
        </div>

        <p className="mt-4 text-sm text-ink-600">
          Comparison — Snowball: {snow.months} mo / {fmtMoney(snow.totalInterest)} · Avalanche: {aval.months} mo / {fmtMoney(aval.totalInterest)}
        </p>
      </Card>
    </div>
  )
}

/* ============ INVESTMENTS ============ */
const MULT = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1 } as const

function InvestmentsPage() {
  const [db, setDb] = useState<Database>(() => loadDb())
  const [showAdd, setShowAdd] = useState(false)

  const commit = (next: Database) => { saveDb(next); setDb(next) }
  const invAccounts = db.accounts.filter((a) => ['investment', 'retirement'].includes(a.accountType))

  const positionAnnual = (p: Position) =>
    p.dividendPerShare && p.dividendFrequency ? p.shares * p.dividendPerShare * MULT[p.dividendFrequency] : 0

  const addPosition = (p: Omit<Position, 'id'>) => {
    commit({ ...db, positions: [...db.positions, { ...p, id: 'pos' + Date.now() }] })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Investments" action={<Button onClick={() => setShowAdd(true)}>+ Add Position</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {invAccounts.map((a) => (
          <Stat key={a.id} label={a.nickname} value={fmtMoney(a.currentBalance)} sub={`${a.institutionName} · ${a.accountType}`} />
        ))}
      </div>

      <Table headers={['Symbol', 'Shares', 'Price', 'Value', 'Gain/Loss', 'Div/yr']}>
        {db.positions.map((p) => {
          const value = p.shares * (p.currentPrice ?? 0)
          const gain = (p.currentPrice ?? 0) - (p.costBasisPerShare ?? 0)
          return (
            <tr key={p.id}>
              <td className={tdCls}>
                <div className="font-medium text-ink-900">{p.symbol}</div>
                <div className="text-xs text-ink-400">{p.name}</div>
              </td>
              <td className={tdCls}>{p.shares}</td>
              <td className={tdCls}>{fmtMoney2(p.currentPrice ?? 0)}</td>
              <td className={`${tdCls} font-medium text-ink-900`}>{fmtMoney(value)}</td>
              <td className={`${tdCls} ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmtMoney(gain * p.shares)}</td>
              <td className={tdCls}>{fmtMoney2(positionAnnual(p))}</td>
            </tr>
          )
        })}
      </Table>

      <Card title="RSU Grants">
        <div className="space-y-4">
          {db.rsuGrants.map((r) => {
            const pct = Math.round((r.sharesVested / r.totalShares) * 100)
            return (
              <div key={r.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-ink-900">{r.employer} · {r.grantId}</span>
                  <span className="text-ink-600">{r.sharesVested}/{r.totalShares} vested</span>
                </div>
                <Progress pct={pct} tone="sapphire" />
                <div className="mt-1 text-xs text-ink-400">
                  Unvested value: {fmtMoney(r.sharesUnvested * (r.currentPrice ?? 0))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <AddPositionModal
        open={showAdd} onClose={() => setShowAdd(false)} onAdd={addPosition}
        accounts={invAccounts.map((a) => ({ id: a.id, name: a.nickname }))}
      />
    </div>
  )
}

function AddPositionModal({ open, onClose, onAdd, accounts }: {
  open: boolean; onClose: () => void
  onAdd: (p: Omit<Position, 'id'>) => void
  accounts: { id: string; name: string }[]
}) {
  const [f, setF] = useState({ accountId: accounts[0]?.id ?? '', symbol: '', name: '', shares: 0, price: 0, costBasis: 0, dividend: 0 })
  const set = (k: keyof typeof f, v: string | number) => setF({ ...f, [k]: v })
  return (
    <Modal open={open} onClose={onClose} title="Add Position">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Account">
          <select className={inputCls} value={f.accountId} onChange={(e) => set('accountId', e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Symbol"><input className={inputCls} value={f.symbol} onChange={(e) => set('symbol', e.target.value)} /></Field>
        <Field label="Name"><input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Shares"><input className={inputCls} type="number" value={f.shares} onChange={(e) => set('shares', Number(e.target.value))} /></Field>
        <Field label="Price"><input className={inputCls} type="number" value={f.price} onChange={(e) => set('price', Number(e.target.value))} /></Field>
        <Field label="Cost basis"><input className={inputCls} type="number" value={f.costBasis} onChange={(e) => set('costBasis', Number(e.target.value))} /></Field>
        <Field label="Div/share/period"><input className={inputCls} type="number" value={f.dividend} onChange={(e) => set('dividend', Number(e.target.value))} /></Field>
      </div>
      <Button
        onClick={() => onAdd({
          accountId: f.accountId, personId: null, symbol: f.symbol, name: f.name,
          assetClass: 'stock', shares: f.shares, costBasisPerShare: f.costBasis,
          dividendPerShare: f.dividend || undefined, dividendFrequency: f.dividend ? 'quarterly' : undefined,
          currentPrice: f.price, priceSource: 'manual',
        })}
        className="mt-4 w-full"
      >
        Add Position
      </Button>
    </Modal>
  )
}

/* ============ ESPP & LINE OF CREDIT ============ */
function EsppPage() {
  const [db, setDb] = useState<Database>(() => loadDb())
  const [showAdd, setShowAdd] = useState(false)

  const commit = (next: Database) => { saveDb(next); setDb(next) }
  const personName = (id: string) => db.people.find((p) => p.id === id)?.name ?? '—'
  const loc = db.accounts.find((a) => a.accountType === 'lineOfCredit')
  const locDraws = db.esppContributions.filter((c) => c.fundedByLoc)

  const addContribution = (c: { esppProgramId: string; amount: number; date: string; fundedByLoc: boolean }) => {
    const prog = db.esppPrograms.find((p) => p.id === c.esppProgramId)
    commit({
      ...db,
      esppContributions: [...db.esppContributions, {
        id: 'ec' + Date.now(), esppProgramId: c.esppProgramId, personId: prog?.personId ?? '',
        paycheckDate: c.date, amount: c.amount, fundedByLoc: c.fundedByLoc,
        locDrawAmount: c.fundedByLoc ? c.amount : undefined,
        locDrawDate: c.fundedByLoc ? c.date : undefined,
      }],
    })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ESPP & Line of Credit" action={<Button onClick={() => setShowAdd(true)}>+ Add Contribution</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {db.esppPrograms.map((e) => (
          <Card key={e.id}>
            <div className="text-sm font-medium text-ink-900">{e.planName} · {personName(e.personId)}</div>
            <div className="text-xs text-ink-400">{e.employer} · {e.discountPercent}% discount</div>
            <div className="mt-2 text-2xl font-bold text-ink-900">{fmtMoney(e.accumulatedContribution)}</div>
            <div className="mt-1 text-xs text-ink-400">Purchase {e.purchaseDate} · {e.status}</div>
          </Card>
        ))}
      </div>

      <Table headers={['Date', 'Person', 'Amount', 'Funding']}>
        {db.esppContributions.map((c) => (
          <tr key={c.id}>
            <td className={tdCls}>{c.paycheckDate}</td>
            <td className={tdCls}>{personName(c.personId)}</td>
            <td className={`${tdCls} font-medium text-ink-900`}>{fmtMoney(c.amount)}</td>
            <td className={tdCls}>
              {c.fundedByLoc
                ? <Badge tone="warn">LOC draw</Badge>
                : <Badge tone="positive">Paycheck</Badge>}
            </td>
          </tr>
        ))}
      </Table>

      <Table headers={['Purchase', 'Shares', 'Status', 'Net', 'ROI']}>
        {db.esppPurchases.map((p) => (
          <tr key={p.id}>
            <td className={tdCls}>{p.purchaseDate}</td>
            <td className={tdCls}>{p.sharesPurchased.toFixed(2)}</td>
            <td className={`${tdCls} capitalize`}>{p.status}</td>
            <td className={`${tdCls} font-medium text-ink-900`}>{fmtMoney(p.netProceeds ?? 0)}</td>
            <td className={`${tdCls} text-emerald-600`}>{(p.estimatedRoi ?? 0).toFixed(1)}%</td>
          </tr>
        ))}
      </Table>

      {loc && (
        <Card title={`Line of Credit — ${loc.nickname}`}>
          <div className="mb-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div><span className="text-ink-400">Balance</span> <span className="font-semibold text-ink-900">{fmtMoney(loc.currentBalance)}</span></div>
            <div><span className="text-ink-400">Limit</span> <span className="font-semibold text-ink-900">{fmtMoney(loc.creditLimit ?? 0)}</span></div>
            <div><span className="text-ink-400">APR</span> <span className="font-semibold text-ink-900">{(loc.apr ?? 0).toFixed(2)}%</span></div>
          </div>
          <div className="space-y-1 text-sm">
            {locDraws.map((d) => (
              <div key={d.id} className="flex justify-between text-ink-600">
                <span>Draw {d.locDrawDate}</span>
                <span className="font-medium text-amber-700">{fmtMoney(d.locDrawAmount ?? 0)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <AddContributionModal
        open={showAdd} onClose={() => setShowAdd(false)} onAdd={addContribution}
        programs={db.esppPrograms.map((e) => ({ id: e.id, name: `${e.planName} (${personName(e.personId)})` }))}
      />
    </div>
  )
}

function AddContributionModal({ open, onClose, onAdd, programs }: {
  open: boolean; onClose: () => void
  onAdd: (c: { esppProgramId: string; amount: number; date: string; fundedByLoc: boolean }) => void
  programs: { id: string; name: string }[]
}) {
  const [f, setF] = useState({ esppProgramId: programs[0]?.id ?? '', amount: 0, date: new Date().toISOString().slice(0, 10), fundedByLoc: false })
  return (
    <Modal open={open} onClose={onClose} title="Add ESPP Contribution">
      <div className="space-y-3 text-sm">
        <Field label="Program">
          <select className={inputCls} value={f.esppProgramId} onChange={(e) => setF({ ...f, esppProgramId: e.target.value })}>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Amount">
          <input className={inputCls} type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
        </Field>
        <Field label="Date">
          <input className={inputCls} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 text-ink-600">
          <input type="checkbox" checked={f.fundedByLoc} onChange={(e) => setF({ ...f, fundedByLoc: e.target.checked })} />
          Funded by line of credit
        </label>
      </div>
      <Button onClick={() => onAdd(f)} className="mt-4 w-full">Add Contribution</Button>
    </Modal>
  )
}

/* ============ OTHER ASSETS ============ */
const ASSET_TYPES: AssetType[] = ['coin', 'tradingCard', 'book', 'electronics', 'jewelry', 'art', 'vehicle', 'realEstate', 'other']

function AssetsPage() {
  const [db, setDb] = useState<Database>(() => loadDb())
  const [showAdd, setShowAdd] = useState(false)

  const commit = (next: Database) => { saveDb(next); setDb(next) }
  const total = db.collectibles.reduce((s, c) => s + c.estimatedValue * c.quantity, 0)

  const addItem = (item: Omit<CollectibleItem, 'id'>) => {
    commit({ ...db, collectibles: [...db.collectibles, { ...item, id: 'col' + Date.now() }] })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Other Assets"
        subtitle={`Total estimated value: ${fmtMoney(total)}`}
        action={<Button onClick={() => setShowAdd(true)}>+ Add Item</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {db.collectibles.map((c) => (
          <Card key={c.id}>
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-ink-900">{c.itemName}</div>
                <div className="mt-1"><Badge>{c.assetType}</Badge></div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-ink-900">{fmtMoney(c.estimatedValue * c.quantity)}</div>
                <div className="text-xs text-ink-400">qty {c.quantity}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {c.frontImageLink
                ? <img src={c.frontImageLink} alt="front" className="h-16 w-16 rounded-lg object-cover" />
                : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-alice-100 text-xs text-ink-400">front</div>}
              {c.backImageLink
                ? <img src={c.backImageLink} alt="back" className="h-16 w-16 rounded-lg object-cover" />
                : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-alice-100 text-xs text-ink-400">back</div>}
            </div>
            {c.storageLocation && <div className="mt-2 text-xs text-ink-400">📍 {c.storageLocation}</div>}
          </Card>
        ))}
      </div>

      <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addItem} />
    </div>
  )
}

function AddItemModal({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void; onAdd: (i: Omit<CollectibleItem, 'id'>) => void
}) {
  const [f, setF] = useState({
    assetType: 'coin' as AssetType, itemName: '', quantity: 1, estimatedValue: 0,
    storageLocation: '', frontImageLink: '', backImageLink: '',
  })
  const set = (k: keyof typeof f, v: string | number) => setF({ ...f, [k]: v })
  return (
    <Modal open={open} onClose={onClose} title="Add Asset Item">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Type">
          <select className={inputCls} value={f.assetType} onChange={(e) => set('assetType', e.target.value)}>
            {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Item name"><input className={inputCls} value={f.itemName} onChange={(e) => set('itemName', e.target.value)} /></Field>
        <Field label="Quantity"><input className={inputCls} type="number" value={f.quantity} onChange={(e) => set('quantity', Number(e.target.value))} /></Field>
        <Field label="Est. value each"><input className={inputCls} type="number" value={f.estimatedValue} onChange={(e) => set('estimatedValue', Number(e.target.value))} /></Field>
        <Field label="Storage location"><input className={inputCls} value={f.storageLocation} onChange={(e) => set('storageLocation', e.target.value)} /></Field>
        <Field label="Front image link"><input className={inputCls} value={f.frontImageLink} onChange={(e) => set('frontImageLink', e.target.value)} /></Field>
        <Field label="Back image link"><input className={inputCls} value={f.backImageLink} onChange={(e) => set('backImageLink', e.target.value)} /></Field>
      </div>
      <Button
        onClick={() => onAdd({
          assetType: f.assetType, itemName: f.itemName, quantity: f.quantity,
          estimatedValue: f.estimatedValue, valueAsOfDate: new Date().toISOString().slice(0, 10),
          storageLocation: f.storageLocation || undefined,
          frontImageLink: f.frontImageLink || undefined, backImageLink: f.backImageLink || undefined,
        })}
        className="mt-4 w-full"
      >
        Add Item
      </Button>
    </Modal>
  )
}

/* ============ GOALS & CASH FLOW ============ */
const FLOW_KEY = 'household-finance-cashflow-v1'

type MonthFlow = {
  month: string; income: number; investmentFunding: number; mortgagePaid: number
  loansPaid: number; billsPaid: number; otherKnown: number; allocations: Record<string, number>
}

const defaultFlow = (month: string): MonthFlow => ({
  month, income: 0, investmentFunding: 0, mortgagePaid: 0, loansPaid: 0, billsPaid: 0, otherKnown: 0, allocations: {},
})

function loadFlows(): Record<string, MonthFlow> {
  try { return JSON.parse(localStorage.getItem(FLOW_KEY) ?? '{}') } catch { return {} }
}

function GoalsPage() {
  const [db, setDb] = useState<Database>(() => loadDb())
  const [showAdd, setShowAdd] = useState(false)
  const [contributeFor, setContributeFor] = useState<SavingsGoal | null>(null)

  const commit = (next: Database) => { saveDb(next); setDb(next) }

  const addGoal = (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    commit({ ...db, goals: [...db.goals, { ...g, id: 'g' + Date.now(), createdAt: new Date().toISOString() }] })
    setShowAdd(false)
  }

  const contribute = (goalId: string, amount: number) => {
    commit({ ...db, goals: db.goals.map((g) => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g) })
    setContributeFor(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Goals & Cash Flow" action={<Button onClick={() => setShowAdd(true)}>+ New Goal</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {db.goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
          return (
            <Card key={g.id}>
              <div className="flex justify-between">
                <div className="text-sm font-medium text-ink-900">{g.name}</div>
                <span className="text-xs text-ink-400">by {g.targetDate}</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-ink-900">
                {fmtMoney(g.currentAmount)} <span className="text-sm font-normal text-ink-400">/ {fmtMoney(g.targetAmount)}</span>
              </div>
              <div className="mt-2"><Progress pct={pct} tone="emerald" /></div>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
                <span>{pct}% · {fmtMoney(g.monthlyContribution)}/mo</span>
                <Button variant="ghost" size="sm" onClick={() => setContributeFor(g)}>+ Contribution</Button>
              </div>
            </Card>
          )
        })}
      </div>

      <CashFlowSection db={db} />

      <AddGoalModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addGoal} />
      <ContributeModal goal={contributeFor} onClose={() => setContributeFor(null)} onContribute={contribute} />
    </div>
  )
}

function CashFlowSection({ db }: { db: Database }) {
  const month = new Date().toISOString().slice(0, 7)
  const [flows, setFlows] = useState<Record<string, MonthFlow>>(loadFlows)
  const flow = flows[month] ?? defaultFlow(month)

  const update = (patch: Partial<MonthFlow>) => {
    const next = { ...flows, [month]: { ...flow, ...patch } }
    setFlows(next)
    localStorage.setItem(FLOW_KEY, JSON.stringify(next))
  }

  const setAlloc = (id: string, amount: number) => update({ allocations: { ...flow.allocations, [id]: amount } })

  const known = flow.investmentFunding + flow.mortgagePaid + flow.loansPaid + flow.billsPaid + flow.otherKnown
  const allocated = Object.values(flow.allocations).reduce((s, v) => s + v, 0)
  const unassigned = flow.income - known - allocated

  const num = (v: string) => Number(v) || 0

  return (
    <Card title={`Monthly Cash Flow — ${month}`}>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Field label="Income"><input className={inputCls} type="number" value={flow.income} onChange={(e) => update({ income: num(e.target.value) })} /></Field>
        <Field label="Investments"><input className={inputCls} type="number" value={flow.investmentFunding} onChange={(e) => update({ investmentFunding: num(e.target.value) })} /></Field>
        <Field label="Mortgage"><input className={inputCls} type="number" value={flow.mortgagePaid} onChange={(e) => update({ mortgagePaid: num(e.target.value) })} /></Field>
        <Field label="Loans"><input className={inputCls} type="number" value={flow.loansPaid} onChange={(e) => update({ loansPaid: num(e.target.value) })} /></Field>
        <Field label="Bills"><input className={inputCls} type="number" value={flow.billsPaid} onChange={(e) => update({ billsPaid: num(e.target.value) })} /></Field>
        <Field label="Other known"><input className={inputCls} type="number" value={flow.otherKnown} onChange={(e) => update({ otherKnown: num(e.target.value) })} /></Field>
      </div>

      <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-ink-400">Assign leftover to categories</h3>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {db.cashFlowCategories.filter((c) => !c.isArchived).map((c) => (
          <Field key={c.id} label={c.name}>
            <input className={inputCls} type="number" value={flow.allocations[c.id] ?? 0} onChange={(e) => setAlloc(c.id, num(e.target.value))} />
          </Field>
        ))}
      </div>

      <div className={`mt-4 rounded-xl p-3 text-sm font-medium ring-1 ${
        unassigned >= 0 ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'
      }`}>
        Unassigned remaining: {fmtMoney(unassigned)}
      </div>
    </Card>
  )
}

function AddGoalModal({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void; onAdd: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void
}) {
  const [f, setF] = useState({ name: '', targetAmount: 0, targetDate: '', currentAmount: 0, monthlyContribution: 0 })
  return (
    <Modal open={open} onClose={onClose} title="New Savings Goal">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Goal name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Target date"><input className={inputCls} type="date" value={f.targetDate} onChange={(e) => setF({ ...f, targetDate: e.target.value })} /></Field>
        <Field label="Target amount"><input className={inputCls} type="number" value={f.targetAmount} onChange={(e) => setF({ ...f, targetAmount: Number(e.target.value) })} /></Field>
        <Field label="Current saved"><input className={inputCls} type="number" value={f.currentAmount} onChange={(e) => setF({ ...f, currentAmount: Number(e.target.value) })} /></Field>
        <Field label="Monthly contribution"><input className={inputCls} type="number" value={f.monthlyContribution} onChange={(e) => setF({ ...f, monthlyContribution: Number(e.target.value) })} /></Field>
      </div>
      <Button onClick={() => onAdd({ ...f, status: 'active' })} className="mt-4 w-full">Add Goal</Button>
    </Modal>
  )
}

function ContributeModal({ goal, onClose, onContribute }: {
  goal: SavingsGoal | null; onClose: () => void; onContribute: (id: string, amount: number) => void
}) {
  const [amount, setAmount] = useState('')
  if (!goal) return null
  return (
    <Modal open={!!goal} onClose={onClose} title={`Contribute to ${goal.name}`}>
      <Field label="Amount">
        <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Button onClick={() => onContribute(goal.id, Number(amount))} className="mt-4 w-full">Add Contribution</Button>
    </Modal>
  )
}

/* ============ SETTINGS ============ */
function SettingsPage() {
  const [db, setDb] = useState<Database>(() => loadDb())
  const [newCat, setNewCat] = useState('')

  const commit = (next: Database) => { saveDb(next); setDb(next) }
  const set = (patch: Partial<Database['settings']>) =>
    commit({ ...db, settings: { ...db.settings, ...patch } })

  const addCategory = () => {
    if (!newCat.trim()) return
    commit({
      ...db,
      cashFlowCategories: [...db.cashFlowCategories, {
        id: 'c' + Date.now(), name: newCat.trim(), isArchived: false,
        sortOrder: db.cashFlowCategories.length + 1,
      }],
    })
    setNewCat('')
  }

  const reset = () => setDb(resetDb())

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      <Card title="Profile & Locale">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Field label="Timezone"><input className={inputCls} value={db.settings.timezone} onChange={(e) => set({ timezone: e.target.value })} /></Field>
          <Field label="Currency"><input className={inputCls} value={db.settings.currency} onChange={(e) => set({ currency: e.target.value })} /></Field>
          <Field label="Date format"><input className={inputCls} value={db.settings.dateFormat} onChange={(e) => set({ dateFormat: e.target.value })} /></Field>
          <Field label="Time format">
            <select className={inputCls} value={db.settings.timeFormat} onChange={(e) => set({ timeFormat: e.target.value as '12h' | '24h' })}>
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </Field>
          <Field label="Annual work hours"><input className={inputCls} type="number" value={db.settings.annualWorkHours} onChange={(e) => set({ annualWorkHours: Number(e.target.value) })} /></Field>
        </div>
      </Card>

      <Card title="Security & Access">
        <Field label="Password manager link">
          <input className={inputCls} value={db.settings.passwordManagerUrl} onChange={(e) => set({ passwordManagerUrl: e.target.value })} />
        </Field>
        <p className="mt-3 text-xs text-ink-400">
          Account numbers are hidden behind a PIN. In the demo the PIN is 1234.
        </p>
      </Card>

      <Card title="Cash Flow Categories">
        <div className="mb-3 flex flex-wrap gap-2">
          {db.cashFlowCategories.filter((c) => !c.isArchived).map((c) => (
            <Badge key={c.id}>{c.name}</Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <Button onClick={addCategory}>Add</Button>
        </div>
      </Card>

      <Card title="Data">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-ink-600">Mode:</span>
          <Badge tone="info">Demo (local)</Badge>
          <Button variant="danger" onClick={reset}>Reset demo data</Button>
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Google Sheets connection will be added in the production phase.
        </p>
      </Card>
    </div>
  )
}

/* ============ APP SHELL ============ */
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accounts', label: 'Accounts & Cards', icon: CreditCard },
  { id: 'loans', label: 'Loans & Debt', icon: HandCoins },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'espp', label: 'ESPP', icon: Coins },
  { id: 'assets', label: 'Other Assets', icon: Gem },
  { id: 'goals', label: 'Goals & Cash Flow', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function App() {
  const [active, setActive] = useState('dashboard')

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-alice-200 bg-white">
        <div className="flex items-center gap-3 px-6 pb-6 pt-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sapphire-600 text-sm font-extrabold text-white shadow-card">
            C
          </div>
          <span className="text-lg font-bold tracking-tight">Coredex</span>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sapphire-50 text-sapphire-700 ring-1 ring-sapphire-300'
                    : 'text-ink-600 hover:bg-alice-100 hover:text-ink-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-sapphire-600' : 'text-ink-400'} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-6 py-5 text-xs text-ink-400">Demo mode · local data only</div>
      </aside>

      <main className="ml-64 flex-1 px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {active === 'dashboard' && <Dashboard />}
          {active === 'accounts' && <AccountsPage />}
          {active === 'loans' && <LoansPage />}
          {active === 'investments' && <InvestmentsPage />}
          {active === 'espp' && <EsppPage />}
          {active === 'assets' && <AssetsPage />}
          {active === 'goals' && <GoalsPage />}
          {active === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  )
}
