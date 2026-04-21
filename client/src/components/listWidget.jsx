import React from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'

export default function ListWidget({ isAuthenticated, listItems, setListOpen }) {
  if (!isAuthenticated) return null

  const itemCount = listItems.length
  return (
    <motion.button
      className='fixed bottom-8 right-8 bg-gray-300 rounded-full px-6 py-4 shadow-md cursor-pointer'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setListOpen(true)}
    >
      <List size={32} className='text-stone-800' />
      {itemCount > 0 && (
        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </motion.button>
  )
}
