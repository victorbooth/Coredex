import { useState } from 'react'
import { loadDb, saveDb } from '../../data/dataProvider'
import type { Database } from '../../data/sampleData'
import type { Account } from '../../types'
import Modal from '../ui/Modal'
import PinDialog from '../ui/PinDialog'
import { fmtMoney } from '../../utils/finance'

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

export default function AccountsPage() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Accounts & Cards</h1>
        <button onClick={() => setShowNew(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          + New Card
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {db.accounts.map((a) => {
              const isCard = a.accountType === 'creditCard'
              const cd = cardDetails(a.id)
              const util = a.creditLimit ? Math.round((a.currentBalance / a.creditLimit) * 100) : 0
              return (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{a.nickname}</div>
                    <div className="text-xs text-slate-500">{a.institutionName}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{a.accountType}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{fmtMoney(a.currentBalance)}</td>
                  <td className="px-4 py-3">
                    {revealed === a.id ? (
                      <div className="text-xs">
                        <div>Acct: {a.fullAccountNumber ?? '123456789012'}</div>
                        <div>Routing: {a.routingNumber ?? '021000021'}</div>
                        <button className="text-blue-600" onClick={() => setRevealed(null)}>hide</button>
                      </div>
                    ) : (
                      <span className="text-slate-600" onClick={() => setPinFor(a.id)}>•••• {a.last4}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isCard && (
                      <button className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" onClick={() => setPayFor(a)}>
                        Pay
                      </button>
                    )}
                    {isCard && cd && (
                      <div className="mt-1 text-xs text-slate-500">Util {util}% · due day {a.dueDay}</div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

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
        <input className={inputCls} placeholder="Institution" value={f.institution} onChange={(e) => set('institution', e.target.value)} />
        <input className={inputCls} placeholder="Nickname" value={f.nickname} onChange={(e) => set('nickname', e.target.value)} />
        <input className={inputCls} placeholder="Last 4" value={f.last4} onChange={(e) => set('last4', e.target.value)} />
        <input className={inputCls} type="number" placeholder="Balance" value={f.balance} onChange={(e) => set('balance', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="Credit limit" value={f.limit} onChange={(e) => set('limit', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="APR %" value={f.apr} onChange={(e) => set('apr', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="Min payment" value={f.minPay} onChange={(e) => set('minPay', Number(e.target.value))} />
        <input className={inputCls} type="number" placeholder="Due day" value={f.dueDay} onChange={(e) => set('dueDay', Number(e.target.value))} />
      </div>
      <button onClick={() => onAdd(f)} className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
        Add Card
      </button>
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
      <input className={inputCls} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button onClick={() => onPay(account.id, Number(amount))} className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
        Log Payment
      </button>
    </Modal>
  )
}
