import { useState } from 'react'
import { loadDb, saveDb } from '../../data/dataProvider'
import type { Database } from '../../data/sampleData'
import Modal from '../ui/Modal'
import { fmtMoney, fmtMoney2 } from '../../utils/finance'

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

export default function EsppPage() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ESPP & Line of Credit</h1>
        <button onClick={() => setShowAdd(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          + Add Contribution
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {db.esppPrograms.map((e) => (
          <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-medium text-slate-800">{e.planName} · {personName(e.personId)}</div>
            <div className="text-xs text-slate-500">{e.employer} · {e.discountPercent}% discount</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{fmtMoney(e.accumulatedContribution)}</div>
            <div className="mt-1 text-xs text-slate-500">
              Purchase {e.purchaseDate} · {e.status}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Funding</th>
            </tr>
          </thead>
          <tbody>
            {db.esppContributions.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-600">{c.paycheckDate}</td>
                <td className="px-4 py-3 text-slate-600">{personName(c.personId)}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{fmtMoney(c.amount)}</td>
                <td className="px-4 py-3">
                  {c.fundedByLoc
                    ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">LOC draw</span>
                    : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Paycheck</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Purchase</th>
              <th className="px-4 py-3">Shares</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Net</th>
              <th className="px-4 py-3">ROI</th>
            </tr>
          </thead>
          <tbody>
            {db.esppPurchases.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-600">{p.purchaseDate}</td>
                <td className="px-4 py-3 text-slate-600">{p.sharesPurchased.toFixed(2)}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{p.status}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{fmtMoney(p.netProceeds ?? 0)}</td>
                <td className="px-4 py-3 text-emerald-600">{(p.estimatedRoi ?? 0).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loc && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Line of Credit — {loc.nickname}</h2>
          <div className="mb-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div><span className="text-slate-500">Balance</span> <span className="font-semibold">{fmtMoney(loc.currentBalance)}</span></div>
            <div><span className="text-slate-500">Limit</span> <span className="font-semibold">{fmtMoney(loc.creditLimit ?? 0)}</span></div>
            <div><span className="text-slate-500">APR</span> <span className="font-semibold">{(loc.apr ?? 0).toFixed(2)}%</span></div>
          </div>
          <div className="space-y-1 text-sm">
            {locDraws.map((d) => (
              <div key={d.id} className="flex justify-between text-slate-600">
                <span>Draw {d.locDrawDate}</span>
                <span className="font-medium text-amber-700">{fmtMoney(d.locDrawAmount ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddContributionModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addContribution} programs={db.esppPrograms.map((e) => ({ id: e.id, name: `${e.planName} (${personName(e.personId)})` }))} />
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
        <select className={inputCls} value={f.esppProgramId} onChange={(e) => setF({ ...f, esppProgramId: e.target.value })}>
          {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className={inputCls} type="number" placeholder="Amount" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
        <input className={inputCls} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <label className="flex items-center gap-2 text-slate-700">
          <input type="checkbox" checked={f.fundedByLoc} onChange={(e) => setF({ ...f, fundedByLoc: e.target.checked })} />
          Funded by line of credit
        </label>
      </div>
      <button onClick={() => onAdd(f)} className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
        Add Contribution
      </button>
    </Modal>
  )
}
