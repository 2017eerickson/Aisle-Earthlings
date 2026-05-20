import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import ZipcodeSearch from '../components/zipcodeSearch'
import { getStoresByZip } from '../utils/krogerUtils'
import StorePanel from '../components/StorePanel'

export default function ComparePage() {
  const { isAuthenticated, stores, setStores, zipcode, setZipcode, selectedStores, setSelectedStores, editingPanels, setEditingPanels } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [globalSearchTrigger, setGlobalSearchTrigger] = useState(null)

  useEffect(() => {
    if (isAuthenticated === false) navigate('/')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!location.state?.preloadStore) return
    window.history.replaceState({}, '', location.pathname)
    setSelectedStores(prev => {
      const firstEmpty = prev.findIndex(s => s === null)
      if (firstEmpty === -1) {
        alert('Compare page is full!')
        return prev
      }
      const next = [...prev]
      next[firstEmpty] = location.state.preloadStore
      const stillEmpty = next.map((s, i) => s === null ? i : -1).filter(i => i !== -1)
      setEditingPanels(new Set(stillEmpty))
      return next
    })
  }, [location.key])

  async function handleZipcodeSearch(zip) {
    if (!zip.trim()) return
    try {
      const res = await getStoresByZip(zip)
      setStores(res.data)
    } catch {
      setStores([])
    }
    setEditingPanels(new Set([0, 1, 2, 3]))
  }

  function handleSelectStore(panelIndex, store) {
    setSelectedStores(prev => {
      const next = [...prev]
      next[panelIndex] = store
      return next
    })
    setEditingPanels(prev => {
      const next = new Set(prev)
      next.delete(panelIndex)
      return next
    })
  }

  function handleSearchAll() {
    if (!globalSearchQuery.trim()) return
    setGlobalSearchTrigger({ term: globalSearchQuery, ts: Date.now() })
  }

  return (
    <div className='flex flex-col flex-1'>
      <ZipcodeSearch
        zipcode={zipcode}
        setZipcode={setZipcode}
        onSearch={handleZipcodeSearch}
      />

      {/* Search all bar */}
      <div className=' mt-5 flex items-center gap-3 px-4 pb-4'>
        <div className='flex-1 border-t border-black' />
        <input
          data-testid='global-search-input'
          type='text'
          placeholder='search all'
          value={globalSearchQuery}
          onChange={e => setGlobalSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearchAll()}
          className='bg-gray-300 px-4 py-3 text-sm font-bold tracking-widest placeholder:text-stone-700 placeholder:opacity-50 w-64 sm:w-80 outline-none'
        />
        <button data-testid='global-search-btn' className='bg-gray-300 p-3 cursor-pointer' onClick={handleSearchAll}>
          <Search size={20} className='text-stone-800' />
        </button>
        <div className='flex-1 border-t border-black' />
      </div>

      {/* 2×2 panel grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4'>
        {[0, 1, 2, 3].map(i => (
          <StorePanel
            key={i}
            stores={stores}
            selectedStore={selectedStores[i]}
            onSelectStore={store => handleSelectStore(i, store)}
            isEditing={editingPanels.has(i)}
            onEdit={() => setEditingPanels(prev => new Set([...prev, i]))}
            globalSearchTrigger={globalSearchTrigger}
          />
        ))}
      </div>
    </div>
  )
}
