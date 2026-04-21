import React from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteButton from './FavoriteButton'

const CARD_COLORS = [
  'bg-pink-500',
  'bg-green-700',
  'bg-pink-500',
  'bg-gray-300',
  'bg-orange-500',
  'bg-gray-300',
]

export default function StoreCard({ store, index }) {
  const isLarge = index === 1 || index === 3 || index === 5
  const bgColor = CARD_COLORS[index] ?? 'bg-gray-300'
  const navigate = useNavigate()

  return (
    <div className={`relative ${bgColor} ${isLarge ? 'h-72' : 'h-56'} p-3 flex flex-col gap-2 rounded-md shadow-md `}>

      {/* Favorite */}
      <FavoriteButton
        type='store'
        referenceId={store.location_id}
        size={14}
        className='absolute top-2 right-2 bg-white rounded-full p-1 z-10'
      />

      {/* Store image */}
      <div className={`border-2 border-black w-3/4 mx-auto flex-shrink-0 ${isLarge ? 'h-36' : 'h-24'} overflow-hidden`}>
        <img
          src='https://png.pngtree.com/thumb_back/fh260/background/20251228/pngtree-fresh-produce-aisle-in-a-modern-grocery-store-image_20940059.webp'
          alt='Store'
          className='w-full h-full object-cover'
        />
      </div>

      {/* Store info */}
      <div className='flex-1 flex flex-col justify-between pl-1 text-left mt-2'>
        <div className={`font-bold tracking-widest leading-tight text-black ${isLarge ? 'text-sm' : 'text-xs'}`}>
          <h1 className='mt-3 text-xl'>{store.name}</h1>
          <p className='mt-3'>{store.distance_miles != null ? `${store.distance_miles} mi` : ''}</p>
          <p>{store.address_line}, {store.city}</p>
        </div>
        <div className='flex items-center justify-between mt-1'>
          <button
            onClick={() => navigate(`/store/${store.location_id}/`)}
            className='font-bold tracking-widest text-black text-sm'
          >
            →
          </button>
          <button onClick={() => navigate('/compare')}>
            <span className='bg-white rounded-md px-2 py-0.5 text-xs font-bold tracking-widest'>
              COMPARE
            </span>
          </button>
        </div>
      </div>

    </div>
  )
}
