import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

/* Shared class strings */
export const inputCls =
  'w-full rounded-lg border border-alice-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-sapphire-400 focus:outline-none focus:ring-2 focus:ring-sapphire-100'

export const thCls = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400'
export const tdCls = 'px-4 py-3 text-sm text-ink-600'

/* Chart theme */
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
