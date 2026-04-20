import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { logoutUser } from '../utils/authUtils'

export default function SideNav({ menuOpen, setMenuOpen, isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logoutUser()
    } catch {
      // proceed with logout regardless
    }
    setIsAuthenticated(false)
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          <motion.div
            className='fixed inset-0 bg-black/30 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
          <motion.div
            id='sideNav'
            className='fixed top-0 left-0 flex flex-col justify-start items-start gap-4 p-4 min-h-screen w-[20%] bg-red-50 z-50'
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <button onClick={() => setMenuOpen(false)} className='self-end cursor-pointer'>
              <X size={24} />
            </button>
            {isAuthenticated ? (
              <>
                <h1><Link to='/homepage' onClick={() => setMenuOpen(false)}>HOME</Link></h1>
                <h1><Link to='/compare' onClick={() => setMenuOpen(false)}>COMPARE</Link></h1>
                <h1><Link to='/favorites' onClick={() => setMenuOpen(false)}>FAVORITES</Link></h1>
                <h1><Link to='/about' onClick={() => setMenuOpen(false)}>ABOUT</Link></h1>
                <h1><button onClick={handleLogout}>LOGOUT</button></h1>
              </>
            ) : (
              <>
                <h1><Link to='/homepage' onClick={() => setMenuOpen(false)}>HOME</Link></h1>
                <h1><Link to='/about' onClick={() => setMenuOpen(false)}>ABOUT</Link></h1>
                <h1><Link to='/' onClick={() => setMenuOpen(false)}>LOGIN</Link></h1>
                <h1><Link to='/' onClick={() => setMenuOpen(false)}>SIGN UP</Link></h1>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
