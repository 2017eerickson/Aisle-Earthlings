import React from 'react'
import { Search } from 'lucide-react'
import {  searchProducts } from '../utils/krogerUtils'
import { useState } from 'react'


export default function SearchBar({location_id, setProducts}) {

    const [searchQuery, setSearchQuery] = useState('')
    

    async function handleProductSearch(term) {
      try {
        const res = await searchProducts(location_id, term)
        setProducts(res.data)
      } catch (err) {
        console.error(err)
      }
    }
  return (
    <div>
      {/* Search row */}
      <div className='flex items-center gap-3 px-4 pt-2 pb-4'>
        <div className='flex-1 border-t border-black' />
        <input
          data-testid='product-search-input'
          type='text'
          placeholder='search  all'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='bg-gray-300 px-4 py-3 text-sm font-bold tracking-widest placeholder:text-stone-700 placeholder:opacity-50 w-80 outline-none'
        />
        <button data-testid='product-search-btn' className='bg-gray-300 p-3 cursor-pointer'
        onClick={() => handleProductSearch(searchQuery)}>
          <Search size={20} className='text-stone-800' />
        </button>
        <div className='flex-1 border-t border-black' />
      </div>

    </div>
  )
}
