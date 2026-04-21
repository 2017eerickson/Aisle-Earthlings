import React from 'react'

export default function FavoritesSection({ title, bg, loading, items, search, onSearch, renderCard }) {
  return (
    <div className={`${bg} rounded-lg overflow-hidden flex flex-col`}>
      {/* Label + cards + arrow */}
      <div className='flex gap-8 flex-1 px-4 pt-5 min-h-[170px]'>
        <div className=' text-left text-white font-bold tracking-[.46em] text-sm leading-tight flex-shrink-0 w-28'>
          {title.map(line => <p key={line}>{line}</p>)}
        </div>

        <div className='flex-1 flex items-center justify-center min-w-0'>
          {loading ? (
            <p className='text-white font-bold tracking-widest text-sm'>Loading...</p>
          ) : items.length > 0 ? (
            <div className='flex gap-5 overflow-x-auto w-full pb-1'>
              {items.map((item, i) => renderCard(item, i))}
            </div>
          ) : (
            <p className='text-white font-bold tracking-[.46em] text-lg'>no favorites yet..</p>
          )}
        </div>

        {items.length > 0 && !loading && (
          <button className='flex-shrink-0 text-black text-2xl font-bold'>→</button>
        )}
      </div>

      {/* Search bar */}
      <div className='flex items-center px-4 pb-3 pt-2'>
        <div className='bg-[#d9d9d9] flex items-center px-2 h-6'>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder='search'
            className='bg-transparent text-xs font-bold tracking-widest text-[#423c3c]/50 w-20 outline-none placeholder:text-[#423c3c]/50'
          />
        </div>
        <div className='bg-[#d9d9d9] h-6 w-7 flex items-center justify-center border-l border-gray-300'>
          <svg viewBox='0 0 24 24' className='w-3.5 h-3.5' fill='none' stroke='currentColor' strokeWidth='2.5'>
            <circle cx='11' cy='11' r='7' />
            <line x1='16.5' y1='16.5' x2='22' y2='22' />
          </svg>
        </div>
      </div>
    </div>
  )
}
