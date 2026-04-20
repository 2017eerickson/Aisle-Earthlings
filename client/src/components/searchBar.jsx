import React from 'react'
import { Search } from 'lucide-react'


export default function searchBar(
    {searchQuery, setSearchQuery}
) {
  return (
    <div>
      {/* Search row */}
      <div className='flex items-center gap-3 px-4 pt-2 pb-4'>
        <div className='flex-1 border-t border-black' />
        <input
          type='text'
          placeholder='search  all'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='bg-gray-300 px-4 py-3 text-sm font-bold tracking-widest placeholder:text-stone-700 placeholder:opacity-50 w-80 outline-none'
        />
        <button className='bg-gray-300 p-3 cursor-pointer'>
          <Search size={20} className='text-stone-800' />
        </button>
        <div className='flex-1 border-t border-black' />
      </div>

    </div>
  )
}
