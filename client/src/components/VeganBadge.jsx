import { useState } from 'react'
import { getVeganStatus } from '../utils/geminiUtils'

const BADGE_CONFIG = {
  vegan:     { label: 'Vegan',     className: 'bg-green-400 text-green-900' },
  not_vegan: { label: 'Not Vegan', className: 'bg-red-400 text-red-900' },
  uncertain: { label: 'Unsure',    className: 'bg-yellow-300 text-yellow-900' },
}

export default function VeganBadge({ upc }) {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [status, setStatus] = useState(null)

  async function handleClick() {
    if (state !== 'idle' && state !== 'error') return
    setState('loading')
    try {
      const data = await getVeganStatus(upc)
      setStatus(data.vegan_status)
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'idle' || state === 'error') {
    return (
      <button
        onClick={handleClick}
        className='text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 cursor-pointer'
      >
        {state === 'error' ? '!' : '?'} vegan
      </button>
    )
  }

  if (state === 'loading') {
    return (
      <span className='text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-gray-200 text-gray-500'>
        ...
      </span>
    )
  }

  const config = BADGE_CONFIG[status]
  if (!config) return null

  return (
    <span className={`text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded ${config.className}`}>
      {config.label}
    </span>
  )
}
