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
              <th
