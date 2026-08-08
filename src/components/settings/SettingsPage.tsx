import { useState } from 'react'
import { loadDb, saveDb, resetDb } from '../../data/dataProvider'
import type { Database } from '../../data/sampleData'

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

export default function SettingsPage() {
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
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Profile & Locale</h2>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <label className="text-xs text-slate-500">Timezone
            <input className={inputCls} value={db.settings.timezone} onChange={(e) => set({ timezone: e.target.value })} />
          </label>
          <label className="text-xs text-slate-500">Currency
            <input className={inputCls} value={db.settings.currency} onChange={(e) => set({ currency: e.target.value })} />
          </label>
          <label className="text-xs text-slate-500">Date format
            <input className={inputCls} value={db.settings.dateFormat} onChange={(e) => set({ dateFormat: e.target.value })} />
          </label>
          <label className="text-xs text-slate-500">Time format
            <select className={inputCls} value={db.settings.timeFormat} onChange={(e) => set({ timeFormat: e.target.value as '12h' | '24h' })}>
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </label>
          <label className="text-xs text-slate-500">Annual work hours
            <input className={inputCls} type="number" value={db.settings.annualWorkHours} onChange={(e) => set({ annualWorkHours: Number(e.target.value) })} />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Security & Access</h2>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <label className="text-xs text-slate-500">Password manager link
            <input className={inputCls} value={db.settings.passwordManagerUrl} onChange={(e) => set({ passwordManagerUrl: e.target.value })} />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Account numbers are hidden behind a PIN. In the demo the PIN is 1234.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Cash Flow Categories</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {db.cashFlowCategories.filter((c) => !c.isArchived).map((c) => (
            <span key={c.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{c.name}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <button onClick={addCategory} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Add</button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Data</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">Mode:</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Demo (local)</span>
          <button onClick={reset} className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            Reset demo data
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Google Sheets connection will be added in the production phase.
        </p>
      </div>
    </div>
  )
}
