import type { ReactNode } from 'react'

export default function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-alice-200 bg-white p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-ink-400 transition-colors hover:bg-alice-100 hover:text-ink-900">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
