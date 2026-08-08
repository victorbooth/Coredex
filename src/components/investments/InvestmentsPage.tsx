import { useState } from 'react'
import { loadDb, saveDb } from '../../data/dataProvider'
import type { Database } from '../../data/sampleData'
import type { Position } from '../../types'
import Modal from '../ui/Modal'
import { fmtMoney, fmtMoney2 } from '../../utils/finance'

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
const mult = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1 } as const

export default function InvestmentsPage() {
  const [db, setDb] = useState<Database>(() => loadDb())
  const [showAdd, setShowAdd] = useState(false)

  const commit = (next: Database) => { saveDb(next); setDb(next) }
  const invAccounts = db.accounts.filter((a) => ['investment', 'retirement'].includes(a.accountType))

  const positionAnnual = (p: Position) =>
    p.dividendPerShare && p.dividendFrequency ? p.shares * p.dividendPerShare * mult[p.dividendFrequency] : 0

  const addPosition = (p: Omit<Position, 'id'>) => {
    commit({ ...db, positions: [...db.positions, { ...p, id: 'pos' + Date.now() }] })
    setShowAdd(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Investments</h1>
        <button onClick={() => setShowAdd(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          + Add Position
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {invAccounts.map((a) => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-medium text-slate-800">{a.nickname}</div>
            <div className="text-xs text-slate-500">{a.institutionName} · {a.accountType}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{fmtMoney(a.currentBalance)}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Shares</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Gain/Loss</th>
              <th className="px-4 py-3">Div/yr</th>
            </tr>
          </thead>
          <tbody>
            {db.positions.map((p) => {
              const value = p.shares * (p.currentPrice ?? 0)
              const gain = (p.currentPrice ?? 0) - (p.costBasisPerShare ?? 0)
              return (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.symbol}</div>
                    <div className="text-xs text-slate-500">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.shares}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtMoney2(p.currentPrice ?? 0)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{fmtMoney(value)}</td>
                  <td className={`px-4 py-3 ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmtMoney(gain * p.shares)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{fmtMoney2(positionAnnual(p))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">RSU Grants</h2>
        <div className="space-y-4">
          {db.rsuGrants.map((r) => {
            const pct = Math.round((r.sharesVested / r.totalShares) * 100)
            return (
              <div key={r.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-800">{r.employer} · {r.grantId}</span>
                  <span className="text-slate-600">{r.sharesVested}/{r.totalShares} vested</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Unvested value: {fmtMoney(r.sharesUnvested * (r.currentPrice ?? 0))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AddPositionModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addPosition} accounts={invAccounts.map((a) => ({ id: a.id, name: a.nickname }))} />
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
        <select className={inputCls} value={f.accountId} onChange={(e) => set('accountId', e.target.value)}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input className={inputCls} placeholder="Symbol" value={f.symbol} onChange={(e) => set('symbol', e.target.value)} />
        <input className={inputCls} placeholder="Name" value={f.name} onChange={(e) => set('name', e.target.value)} />
        <input className={inputCls} type="number" placeholder="Shares" value={f.shares} onChange={(e) => set('shares', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="Price" value={f.price} onChange={(e) => set('price', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="Cost basis" value={f.costBasis} onChange={(e) => set('costBasis', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="Div/share/period" value={f.dividend} onChange={(e) => set('dividend', Number(e.target.value))} />
      </div>
      <button
        onClick={() => onAdd({
          accountId: f.accountId, personId: null, symbol: f.symbol, name: f.name,
          assetClass: 'stock', shares: f.shares, costBasisPerShare: f.costBasis,
          dividendPerShare: f.dividend || undefined, dividendFrequency: f.dividend ? 'quarterly' : undefined,
          currentPrice: f.price, priceSource: 'manual',
        })}
        className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
      >
        Add Position
      </button>
    </Modal>
  )
}
