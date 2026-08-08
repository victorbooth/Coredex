import { useState } from 'react'
import {
  LayoutDashboard, CreditCard, HandCoins, TrendingUp,
  Coins, Gem, Target, Settings,
} from 'lucide-react'
import Dashboard from './components/layout/Dashboard'
import AccountsPage from './components/accounts/AccountsPage'
import LoansPage from './components/loans/LoansPage'
import InvestmentsPage from './components/investments/InvestmentsPage'
import EsppPage from './components/espp/EsppPage'
import AssetsPage from './components/assets/AssetsPage'
import GoalsPage from './components/goals/GoalsPage'
import SettingsPage from './components/settings/SettingsPage'

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
