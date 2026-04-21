import React from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteButton from './FavoriteButton'
import AddToListButton from './AddToListButton'

export default function ProductCard({ product, storeName, storeAddress }) {
  const navigate = useNavigate()

  return (
    <div className='bg-gray-300 p-2 flex flex-col gap-2'>

      {/* Product image or X placeholder */}
      <div className='relative bg-gray-300 border-2 border-black h-28 w-full overflow-hidden flex items-center justify-center flex-shrink-0'>
        <FavoriteButton type='product' referenceId={product.upc} locationId={product.location_id} size={14} className='absolute top-1 right-1 z-10 bg-white rounded-full p-1' />
        {product.image_front ? (
          <img
            src={product.image_front}
            alt={product.name}
            className='w-full h-full object-contain'
          />
        ) : (
          <svg className='absolute inset-0 w-full h-full' preserveAspectRatio='none'>
            <line x1='0' y1='0' x2='100%' y2='100%' stroke='black' strokeWidth='1.5' />
            <line x1='100%' y1='0' x2='0' y2='100%' stroke='black' strokeWidth='1.5' />
          </svg>
        )}
      </div>

      {/* Product info */}
      <div className='font-bold tracking-widest text-xs text-black leading-snug text-left'>
        <p className='truncate'>{product.name}</p>
        <p className='truncate'>{product.brand}</p>
        <p>{product.price ? `$${product.price}` : '—'}</p>
        <button
          onClick={() => navigate(`/product/${product.upc}`, { state: { location_id: product.location_id } })}
          className='font-bold cursor-pointer'
        >
          →
        </button>
      </div>

      {/* Add to list */}
      <AddToListButton
        upc={product.upc}
        productName={product.name}
        locationId={product.location_id}
        storeName={storeName}
        storeAddress={storeAddress}
        className='bg-rose-200 rounded px-2 py-1 text-xs font-bold tracking-widest w-fit cursor-pointer'
      />

    </div>
  )
}
