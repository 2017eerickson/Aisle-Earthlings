import React, { useState, useEffect } from 'react'
import { MapPin, Search, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOutletContext, useNavigate } from 'react-router-dom'
import SearchBar from '../components/searchBar'
import ZipcodeSearch from '../components/zipcodeSearch'
import ListWidget from '../components/listWidget'

export default function HomePage() {
  const [zipcode, setZipcode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated } = useOutletContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated === false) navigate('/')
  }, [isAuthenticated])

  return (
    <div className='relative flex flex-col flex-1'>

     <ZipcodeSearch 
      zipcode={zipcode}
      setZipcode={setZipcode}
     />

    <SearchBar 
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />

      {/* Body text */}
      <div className='flex-1 flex items-center justify-center py-16'>
        <p className='font-bold text-2xl tracking-[.46em] text-black text-center'>
          Enter zip to generate stores closet to you!
        </p>
      </div>
      <ListWidget />
    </div>
  )
}
