import { useState } from 'react'
import Dashboard from './components/layout/Dashboard'
import AccountsPage from './components/accounts/AccountsPage'
import LoansPage from './components/loans/LoansPage'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'accounts', label: 'Accounts & Cards' },
  { id: 'loans', label: 'Loans & Debt' },
  { id: 'investments', label: 'Investments' },
  { id: 'espp', label: 'ESPP' },
  { id: 'assets', label: 'Other Assets' },
  { id: 'goals', label: 'Goals & Cash Flow' },
  { id: 'settings', label: 'Settings' },
]

export default function App() {
  const [active, setActive] = useState('dashboard')

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-60 border-r border-slate-200 bg-white p-4">
        <div className="mb-6 text-lg font-bold">Household Finance</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                active === item.id
                  ? 'bg-blue-50 font-medium text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {active === 'dashboard' && <Dashboard />}
        {active === 'accounts' && <AccountsPage />}
        {active === 'loans' && <LoansPage />}
        {!['dashboard', 'accounts', 'loans'].includes(active) && (
          <>
            <h1 className="text-xl font-semibold capitalize">{active}</h1>
            <p className="mt-2 text-sm text-slate-500">This section is coming in a later batch.</p>
          </>
        )}
      </main>
    </div>
  )
}
