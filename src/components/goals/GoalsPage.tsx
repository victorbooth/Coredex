import { useState } from 'react'
import { loadDb, saveDb } from '../../data/dataProvider'
import type { Database } from '../../data/sampleData'
import type { SavingsGoal } from '../../types'
import Modal from '../ui/Modal'
import { fmtMoney } from '../../utils/finance'

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
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

export default function GoalsPage() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Goals & Cash Flow</h1>
        <button onClick={() => setShowAdd(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          + New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {db.goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
          return (
            <div key={g.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-slate-800">{g.name}</div>
                <span className="text-xs text-slate-500">by {g.targetDate}</span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{fmtMoney(g.currentAmount)} <span className="text-sm font-normal text-slate-500">/ {fmtMoney(g.targetAmount)}</span></div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{pct}% · {fmtMoney(g.monthlyContribution)}/mo</span>
                <button className="text-blue-600" onClick={() => setContributeFor(g)}>+ Contribution</button>
              </div>
            </div>
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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Monthly Cash Flow — {month}</h2>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <label className="text-xs text-slate-500">Income
          <input className={inputCls} type="number" value={flow.income} onChange={(e) => update({ income: num(e.target.value) })} />
        </label>
        <label className="text-xs text-slate-500">Investments
          <input className={inputCls} type="number" value={flow.investmentFunding} onChange={(e) => update({ investmentFunding: num(e.target.value) })} />
        </label>
        <label className="text-xs text-slate-500">Mortgage
          <input className={inputCls} type="number" value={flow.mortgagePaid} onChange={(e) => update({ mortgagePaid: num(e.target.value) })} />
        </label>
        <label className="text-xs text-slate-500">Loans
          <input className={inputCls} type="number" value={flow.loansPaid} onChange={(e) => update({ loansPaid: num(e.target.value) })} />
        </label>
        <label className="text-xs text-slate-500">Bills
          <input className={inputCls} type="number" value={flow.billsPaid} onChange={(e) => update({ billsPaid: num(e.target.value) })} />
        </label>
        <label className="text-xs text-slate-500">Other known
          <input className={inputCls} type="number" value={flow.otherKnown} onChange={(e) => update({ otherKnown: num(e.target.value) })} />
        </label>
      </div>

      <h3 className="mb-2 mt-4 text-xs font-semibold text-slate-600">Assign leftover to categories</h3>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {db.cashFlowCategories.filter((c) => !c.isArchived).map((c) => (
          <label key={c.id} className="text-xs text-slate-500">{c.name}
            <input className={inputCls} type="number" value={flow.allocations[c.id] ?? 0} onChange={(e) => setAlloc(c.id, num(e.target.value))} />
          </label>
        ))}
      </div>

      <div className={`mt-4 rounded-lg p-3 text-sm font-medium ${unassigned >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
        Unassigned remaining: {fmtMoney(unassigned)}
      </div>
    </div>
  )
}

function AddGoalModal({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void; onAdd: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void
}) {
  const [f, setF] = useState({ name: '', targetAmount: 0, targetDate: '', currentAmount: 0, monthlyContribution: 0 })
  return (
    <Modal open={open} onClose={onClose} title="New Savings Goal">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <input className={inputCls} placeholder="Goal name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={inputCls} type="date" value={f.targetDate} onChange={(e) => setF({ ...f, targetDate: e.target.value })} />
        <input className={inputCls} type="number" placeholder="Target amount" value={f.targetAmount} onChange={(e) => setF({ ...f, targetAmount: Number(e.target.value) })} />
        <input className={inputCls} type="number" placeholder="Current saved" value={f.currentAmount} onChange={(e) => setF({ ...f, currentAmount: Number(e.target.value) })} />
        <input className={inputCls} type="number" placeholder="Monthly contribution" value={f.monthlyContribution} onChange={(e) => setF({ ...f, monthlyContribution: Number(e.target.value) })} />
      </div>
      <button onClick={() => onAdd({ ...f, status: 'active' })} className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
        Add Goal
      </button>
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
      <input className={inputCls} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button onClick={() => onContribute(goal.id, Number(amount))} className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
        Add Contribution
      </button>
    </Modal>
  )
}
