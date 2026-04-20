import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header({ menuOpen, setMenuOpen }) {
  return (
    <div id='header' className='flex flex-row justify-between items-center p-4 border-b-2 border-gray-200'>
      <button onClick={() => setMenuOpen(!menuOpen)} className='cursor-pointer text-stone-900'>
        <AnimatePresence mode="wait" initial={false}>
          {menuOpen ? (
            <motion.span
              key="x"
              className='block'
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={28} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              className='block'
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={28} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <h1 className='text-green-700 text-5xl tracking-[.20em]'>
        <Link to='/'>AISLE EARTHLINGS</Link>
      </h1>
      <h3><Link to='/about'>ABOUT</Link></h3>
    </div>
  )
}
