import React, { useState, useEffect } from 'react'

import { useOutletContext, useNavigate } from 'react-router-dom'
import { getStoresByZip } from '../utils/krogerUtils'
import SearchBar from '../components/searchBar'
import ZipcodeSearch from '../components/zipcodeSearch'
import ListWidget from '../components/listWidget'
import StoreCard from '../components/StoreCard'

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, stores, setStores, zipcode, setZipcode, searchQuery, setSearchQuery } = useOutletContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated === false) navigate('/')
  }, [isAuthenticated])

  async function handleSearch(zip) {
    if (!zip.trim()) return
    try {
      setLoading(true)
      const response = await getStoresByZip(zip)
      const fetchedStores = response.data
      setStores(fetchedStores)

    } catch {
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative flex flex-col flex-1'>

      <ZipcodeSearch
        zipcode={zipcode}
        setZipcode={setZipcode}
        onSearch={handleSearch}
      />
      <div className='flex-1 mt-10 border-t border-black ' >
       
      </div>
      
      {loading ? (
        <div className='flex-1 flex items-center justify-center py-16'>
          <p className='font-bold text-sm tracking-widest text-black'>
            Loading stores...
          </p>
        </div>
      ) : stores.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-4 items-start'>
          {stores.map((store, index) => (
            <StoreCard
              key={store.location_id}
              store={store}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className='flex-1 flex items-center justify-center py-16'>
          <p className='font-bold text-2xl tracking-[.46em] text-black text-center'>
            Enter zip to generate stores closet to you!
          </p>
        </div>
      )}

      <ListWidget />
    </div>
  )
}
