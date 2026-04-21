import React from 'react'
import { MapPin } from 'lucide-react'

export default function ZipcodeSearch({ zipcode, setZipcode, onSearch }) {
  return (
    <div>
      {/* Zipcode row */}
      <div className='flex items-center gap-3 px-4 pt-4'>
        <div className='flex-1 border-t border-black' />
        <input
          type='text'
          placeholder='enter zipcode'
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.(zipcode)}
          className='bg-gray-300 px-4 py-2 text-sm font-bold tracking-widest placeholder:text-stone-700 placeholder:opacity-50 w-64 outline-none'
        />
        <button
          className='bg-gray-300 p-2 cursor-pointer'
          onClick={() => onSearch?.(zipcode)}
        >
          <MapPin size={20} className='text-stone-800' />
        </button>
        <div className='flex-1 border-t border-black' />
      </div>
    </div>
  )
}
