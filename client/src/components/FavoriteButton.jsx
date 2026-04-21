import React from 'react'
import { Heart } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'

export default function FavoriteButton({ type, referenceId, size = 16, className = '' }) {
  const { isFavorite, toggleFavorite } = useOutletContext()
  const favorited = isFavorite(type, referenceId)

  async function handleClick(e) {
    e.stopPropagation()
    try {
      await toggleFavorite(type, referenceId)
    } catch {}
  }

  return (
    <button
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        className={favorited ? 'text-rose-500 fill-rose-500' : 'text-gray-700'}
      />
    </button>
  )
}
