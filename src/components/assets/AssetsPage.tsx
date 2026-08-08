import { useState } from 'react'
import { loadDb, saveDb } from '../../data/dataProvider'
import type { Database } from '../../data/sampleData'
import type { AssetType, CollectibleItem } from '../../types'
import Modal from '../ui/Modal'
import { fmtMoney } from '../../utils/finance'

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
const assetTypes: AssetType[] = ['coin', 'tradingCard', 'book', 'electronics', 'jewelry', 'art', 'vehicle', 'realEstate', 'other']

export default function AssetsPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Other Assets</h1>
          <p className="text-sm text-slate-500">Total estimated value: {fmtMoney(total)}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          + Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {db.collectibles.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-slate-800">{c.itemName}</div>
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">{c.assetType}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">{fmtMoney(c.estimatedValue * c.quantity)}</div>
                <div className="text-xs text-slate-500">qty {c.quantity}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {c.frontImageLink
                ? <img src={c.frontImageLink} alt="front" className="h-16 w-16 rounded-lg object-cover" />
                : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">front</div>}
              {c.backImageLink
                ? <img src={c.backImageLink} alt="back" className="h-16 w-16 rounded-lg object-cover" />
                : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">back</div>}
            </div>
            {c.storageLocation && <div className="mt-2 text-xs text-slate-500">📍 {c.storageLocation}</div>}
          </div>
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
        <select className={inputCls} value={f.assetType} onChange={(e) => set('assetType', e.target.value)}>
          {assetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className={inputCls} placeholder="Item name" value={f.itemName} onChange={(e) => set('itemName', e.target.value)} />
        <input className={inputCls} type="number" placeholder="Quantity" value={f.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="Est. value each" value={f.estimatedValue} onChange={(e) => set('estimatedValue', Number(e.target.value))} />
        <input className={inputCls} placeholder="Storage location" value={f.storageLocation} onChange={(e) => set('storageLocation', e.target.value)} />
        <input className={inputCls} placeholder="Front image link" value={f.frontImageLink} onChange={(e) => set('frontImageLink', e.target.value)} />
        <input className={inputCls} placeholder="Back image link" value={f.backImageLink} onChange={(e) => set('backImageLink', e.target.value)} />
      </div>
      <button
        onClick={() => onAdd({
          assetType: f.assetType, itemName: f.itemName, quantity: f.quantity,
          estimatedValue: f.estimatedValue, valueAsOfDate: new Date().toISOString().slice(0, 10),
          storageLocation: f.storageLocation || undefined,
          frontImageLink: f.frontImageLink || undefined, backImageLink: f.backImageLink || undefined,
        })}
        className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
      >
        Add Item
      </button>
    </Modal>
  )
}
