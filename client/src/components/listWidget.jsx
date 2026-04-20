import React from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'

export default function listWidget() {
  return (
    <div>
         {/* Floating list widget */}
              <motion.button
                className='fixed bottom-8 right-8 bg-gray-300 rounded-full px-6 py-4 shadow-md cursor-pointer'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List size={32} className='text-stone-800' />
              </motion.button>
    </div>
  )
}
