import React from 'react'

export default function StackedThumbnails({ product, activeImage, setActiveImage }) {
  return (
    <div> <div className='flex flex-col gap-1 flex-shrink-0'>
          {(() => {
            const images = [
              product?.image_front,
              product?.image_back,
              product?.image_left,
              product?.image_right,
            ].filter(Boolean)
            return Array.from({ length: 5 }).map((_, i) => {
              const src = images[i]
              return (
                <button
                  key={i}
                  onClick={() => src && setActiveImage(src)}
                  className={`relative bg-gray-300 border w-20 h-20 overflow-hidden flex-shrink-0 cursor-pointer ${activeImage === src && src ? 'border-2 border-black' : 'border-gray-400'}`}
                >
                  {src ? (
                    <img src={src} alt='' className='w-full h-full object-contain' />
                  ) : (
                    <svg className='absolute inset-0 w-full h-full' preserveAspectRatio='none'>
                      <line x1='0' y1='0' x2='100%' y2='100%' stroke='black' strokeWidth='1' />
                      <line x1='100%' y1='0' x2='0' y2='100%' stroke='black' strokeWidth='1' />
                    </svg>
                  )}
                </button>
              )
            })
          })()}
        </div></div>
  )
}
