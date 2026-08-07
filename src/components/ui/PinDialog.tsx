import { useState } from 'react'
import Modal from './Modal'

const DEMO_PIN = '1234'

export default function PinDialog({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    if (pin === DEMO_PIN) {
      setPin(''); setError(false); onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Enter PIN">
      <input
        type="password"
        value={pin}
        onChange={(e) => { setPin(e.target.value); setError(false) }}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
        placeholder="PIN"
        autoFocus
      />
      {error && <p className="mt-2 text-sm text-red-600">Incorrect PIN</p>}
      <p className="mt-2 text-xs text-slate-500">Demo PIN: 1234</p>
      <button onClick={submit} className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
        Reveal
      </button>
    </Modal>
  )
}
