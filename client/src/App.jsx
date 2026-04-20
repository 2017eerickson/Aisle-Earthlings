import './App.css'
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/header'
import SideNav from './components/sideNav'
import { verifyUser } from './utils/authUtils'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        await verifyUser()
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <SideNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
      <Outlet context={{ isAuthenticated, setIsAuthenticated }} />
    </>
  )
}

export default App
