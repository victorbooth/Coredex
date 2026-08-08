import { useState } from 'react'
import Modal from './Modal'
import { Button, inputCls } from './kit'

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
        className={inputCls}
        placeholder="PIN"
        autoFocus
      />
      {error && <p className="mt-2 text-sm text-rose-600">Incorrect PIN</p>}
      <p className="mt-2 text-xs text-ink-400">Demo PIN: 1234</p>
      <Button onClick={submit} className="mt-4 w-full">Reveal</Button>
    </Modal>
  )
}
