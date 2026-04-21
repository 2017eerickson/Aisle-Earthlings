import React, { useState, useEffect } from 'react'
import { useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { getStoreDetail, getProductsByLocation } from '../utils/krogerUtils'
import ProductCard from '../components/ProductCard'
import ListWidget from '../components/listWidget'
import SearchBar from '../components/searchBar'

export default function StorePage() {
  const { location_id } = useParams()
  const { isAuthenticated } = useOutletContext()
  const navigate = useNavigate()

  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
    if (isAuthenticated === false) navigate('/')
  }, [isAuthenticated])

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true)
        const [detailRes, productsRes] = await Promise.all([
          getStoreDetail(location_id),
          getProductsByLocation(location_id),
        ])
        setStore(detailRes.data)
        setProducts(productsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStore()
  }, [location_id])

  return (
    <div className='flex flex-col flex-1 px-4 py-4 gap-6'>

      {/* Store header */}
      <div className='flex gap-4 items-stretch'>

        {/* Stacked product thumbnails */}
        <div className='flex flex-col gap-1 flex-shrink-0'>
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='relative bg-gray-300 border border-black w-20 h-7 overflow-hidden flex-shrink-0'
            >
              {products[i]?.image_front ? (
                <img
                  src={products[i].image_front}
                  alt=''
                  className='w-full h-full object-cover'
                />
              ) : (
                <svg className='absolute inset-0 w-full h-full' preserveAspectRatio='none'>
                  <line x1='0' y1='0' x2='100%' y2='100%' stroke='black' strokeWidth='1' />
                  <line x1='100%' y1='0' x2='0' y2='100%' stroke='black' strokeWidth='1' />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Store icon */}
        <div className='bg-white border-2 border-black flex-1 flex items-center justify-center'>
          <img src='https://png.pngtree.com/thumb_back/fh260/background/20251228/pngtree-fresh-produce-aisle-in-a-modern-grocery-store-image_20940059.webp' 
          alt='Store Icon' 
          className='w-[100%] h-30 object-cover' />
        </div>

        {/* Info panel */}
        <div className='bg-rose-50 p-3 w-64 flex-shrink-0 overflow-auto'>
          <div className='font-bold tracking-widest text-xs text-black leading-loose'>
            <h1>{store?.display_name || '—'}</h1>
            {!loading && products.length > 0 && (
              <p className='mt-1'>{products.length} vegan products</p>
            )}
          </div>
        </div>

      </div>

      {/* Product search */}
      <SearchBar
        location_id={location_id}
        setProducts={setProducts}
        products={products}
      />

      {/* Products heading */}
      <p className='font-bold text-xl tracking-widest text-black text-center'>
        Products from this store
      </p>

      {/* Product grid */}
      {loading ? (
        <p className='font-bold text-sm tracking-widest text-black'>Loading...</p>
      ) : products.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
          {products.map(product => (
            <ProductCard key={product.upc} product={product} />
          ))}
        </div>
      ) : (
        <p className='font-bold text-sm tracking-widest text-black opacity-50'>
          No products found.
        </p>
      )}

      <ListWidget />
    </div>
  )
}
