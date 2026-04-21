import { useState, useEffect } from 'react'
import { Search, Pencil } from 'lucide-react'
import FavoriteButton from '../components/FavoriteButton'
import ProductCard from '../components/ProductCard'
import { getProductsByLocation, searchProducts } from '../utils/krogerUtils'

export default function StorePanel({ stores, selectedStore, onSelectStore, isEditing, onEdit, globalSearchTrigger }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedStore) {
      setProducts([])
      return
    }
    async function loadInitialProducts() {
      try {
        setLoading(true)
        const res = await getProductsByLocation(selectedStore.location_id)
        setProducts(res.data)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadInitialProducts()
  }, [selectedStore])

  useEffect(() => {
    if (!globalSearchTrigger || !selectedStore) return
    async function doGlobalSearch() {
      try {
        setLoading(true)
        const res = await searchProducts(selectedStore.location_id, globalSearchTrigger.term)
        setProducts(res.data)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    doGlobalSearch()
  }, [globalSearchTrigger, selectedStore])

  async function handlePanelSearch() {
    if (!selectedStore || !searchQuery.trim()) return
    try {
      setLoading(true)
      const res = await searchProducts(selectedStore.location_id, searchQuery)
      setProducts(res.data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
    setSearchQuery('')
  }

  if (isEditing) {
    return (
      <div className='bg-[#bcafaf] flex flex-col h-[532px]'>
        <div className='flex flex-col items-center justify-center flex-1 gap-4 py-10 px-4'>
          <p className='font-bold tracking-[.46em] text-black text-lg'>ADD STORE</p>
          <div className='flex flex-col items-center gap-3 w-full'>
            {stores.slice(0, 6).map(store => (
              <button
                key={store.location_id}
                onClick={() => onSelectStore(store)}
                className='text-[#3155d8] font-bold tracking-widest text-sm cursor-pointer hover:underline text-center'
              >
                {store.name} | {store.address_line}
              </button>
            ))}
            {stores.length === 0 && (
              <p className='font-bold text-xs tracking-widest text-black opacity-50 text-center'>
                No stores loaded. Enter a zip code above.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-[#bcafaf] flex flex-col h-[532px]'>
      {/* Panel header */}
      <div className='flex items-center gap-2 px-2 py-1.5 border-b border-black/20 shrink-0'>
        <span className=' font-bold tracking-widest  text-black truncate flex-1 min-w-0'>
          <h1>{selectedStore ? selectedStore.name.toUpperCase() : 'NO STORE'}</h1>
          <h6 className='text-gray-500 text-sm ' >{selectedStore ? selectedStore.address_line : null}</h6>

        </span>
        {selectedStore && (
          <FavoriteButton type='store' referenceId={selectedStore.location_id} size={13} />
        )}
        <button onClick={onEdit} className='cursor-pointer shrink-0'>
          <Pencil size={13} className='text-gray-700' />
        </button>
        <input
          type='text'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePanelSearch()}
          placeholder='search'
          className='bg-[#d9d9d9] px-2 py-0.5 text-xs tracking-widest placeholder:opacity-50 outline-none w-24 shrink-0'
        />
        <button onClick={handlePanelSearch} className='cursor-pointer shrink-0'>
          <Search size={13} className='text-gray-700' />
        </button>
      </div>

      {/* Scrollable product area — fixed height shows exactly 4 cards (2×2) */}
      <div className='overflow-y-auto flex-1'>
        {!selectedStore ? (
          <div className='flex items-center justify-center h-full'>
            <button
              onClick={onEdit}
              className='font-bold tracking-widest text-xs text-black opacity-50  hover:opacity-100'
            >
              + select store
            </button>
          </div>
        ) : loading ? (
          <div className='flex items-center justify-center h-full'>
            <p className='font-bold text-xs tracking-widest text-white opacity-50'>Loading...</p>
          </div>
        ) : products.length > 0 ? (
          <div className='grid grid-cols-2 gap-2 p-2'>
            {products.map(product => (
              <ProductCard key={product.upc} product={product} />
            ))}
          </div>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <p className='font-bold text-xs tracking-widest text-black opacity-50'>No products found.</p>
          </div>
        )}
      </div>
    </div>
  )
}