import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useOutletContext, useNavigate } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { getProductDetail, getStoreDetail } from '../utils/krogerUtils'
import StackedThumbnails from '../components/StackedThumbnails'
import AddToListButton from '../components/AddToListButton'
import VeganBadge from '../components/VeganBadge'

export default function ProductPage() {
  const { upc } = useParams()
  const { state } = useLocation()
  const location_id = state?.location_id
  const { isAuthenticated } = useOutletContext()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(null)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (isAuthenticated === false) navigate('/')
  }, [isAuthenticated])

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const [productRes, storeRes] = await Promise.all([
          getProductDetail(location_id, upc),
          location_id ? getStoreDetail(location_id) : Promise.resolve(null),
        ])
        setProduct(productRes.data)
        setActiveImage(productRes.data?.image_front || null)
        if (storeRes) setStore(storeRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [upc, location_id])

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='font-bold text-sm tracking-widest text-black'>Loading...</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col flex-1 px-4 py-4 gap-6'>

      {/* Main content row */}
      <div className='flex gap-4 items-stretch'>

        {/* Stacked thumbnails */}
        <StackedThumbnails
          product={product}
          activeImage={activeImage} 
          setActiveImage={setActiveImage} />

        {/* Large product image */}
        <div
          className={`relative bg-gray-300 border-2 border-black flex-1 overflow-hidden flex items-center justify-center ${activeImage ? 'cursor-zoom-in' : ''}`}
          style={{ height: '60vmin' }}
          onClick={() => activeImage && setZoomed(true)}
        >
          {activeImage ? (
            <img
              src={activeImage}
              alt={product?.name}
              className='w-full h-full object-contain p-4'
            />
          ) : (
            <svg className='absolute inset-0 w-full h-full' preserveAspectRatio='none'>
              <line x1='0' y1='0' x2='100%' y2='100%' stroke='black' strokeWidth='2' />
              <line x1='100%' y1='0' x2='0' y2='100%' stroke='black' strokeWidth='2' />
            </svg>
          )}
          <div
            className='absolute bottom-2 right-2 z-10'
            onClick={e => e.stopPropagation()}
          >
            <VeganBadge upc={upc} />
          </div>
        </div>

        {/* Info panel */}
        <div className='bg-rose-50 p-4 w-64 flex-shrink-0 relative'>
          <button className='absolute top-3 right-3 cursor-pointer'>
            <Heart size={24} className='text-gray-700' />
          </button>
          <div className='font-bold tracking-widest text-xs text-black leading-loose text-left '>
            <p>Brand:</p>
            <p className='font-normal opacity-70'>{product?.brand || '—'}</p>
            <p className='mt-2'>Product name:</p>
            <p className='font-normal opacity-70'>{product?.name || '—'}</p>
            <p className='mt-2'>Store name/location:</p>
            <p className='font-normal opacity-70'>
              {store ? `${store.display_name}, ${store.city}` : '—'}
            </p>
            <p className='mt-2'>Price:</p>
            <p className='font-normal opacity-70'>
              {product?.price ? `$${product.price}` : '—'}
            </p>
            <p className='mt-2'>Contains:</p>
            <p className='font-normal opacity-70'>{product?.categories || '—'}</p>
          </div>
        </div>

      </div>

      {/* Star rating + add to list */}
      <div className='flex items-center gap-3'>
        <div className='flex gap-1'>
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              size={28}
              className={i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
        <span className='font-bold tracking-widest text-sm text-black'>reviews</span>
        <AddToListButton
          upc={upc}
          productName={product?.name || ''}
          locationId={location_id || ''}
          storeName={store?.display_name || ''}
          storeAddress={store?.address_line || ''}
          className='ml-auto bg-rose-200 rounded-lg px-4 py-2 text-sm font-bold tracking-widest cursor-pointer'
        />
      </div>

      {/* Zoom modal */}
      {zoomed && activeImage && (
        <div
          className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center cursor-zoom-out'
          onClick={() => setZoomed(false)}
        >
          <img
            src={activeImage}
            alt={product?.name}
            className='max-w-[90vw] max-h-[90vh] object-contain'
          />
        </div>
      )}
    </div>
  )
}
