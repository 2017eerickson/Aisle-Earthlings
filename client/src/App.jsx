import './App.css'
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/header'
import SideNav from './components/sideNav'
import { verifyUser } from './utils/authUtils'
import { getFavorites, addFavorite, removeFavorite } from './utils/favoritesUtils'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [stores, setStores] = useState([])
  const [zipcode, setZipcode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [storeInfoMap, setStoreInfoMap] = useState({})
  const [favorites, setFavorites] = useState([])
  const [selectedStores, setSelectedStores] = useState([null, null, null, null])
  const [editingPanels, setEditingPanels] = useState(new Set())

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

  useEffect(() => {
    if (!isAuthenticated) return
    async function loadFavorites() {
      try {
        const data = await getFavorites()
        setFavorites(data)
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
    loadFavorites()
  }, [isAuthenticated])

  function isFavorite(type, referenceId) {
    return favorites.some(f => f.favorite_type === type && f.reference_id === referenceId)
  }

  async function toggleFavorite(type, referenceId, locationId = null) {
    const existing = favorites.find(f => f.favorite_type === type && f.reference_id === referenceId)
    if (existing) {
      await removeFavorite(existing.id)
      setFavorites(prev => prev.filter(f => f.id !== existing.id))
    } else {
      const newFav = await addFavorite(type, referenceId, locationId)
      setFavorites(prev => [...prev, newFav])
    }
  }

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <SideNav
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
      <Outlet context={{ isAuthenticated, setIsAuthenticated, stores, setStores, zipcode, setZipcode, searchQuery, setSearchQuery, storeInfoMap, setStoreInfoMap, favorites, isFavorite, toggleFavorite, selectedStores, setSelectedStores, editingPanels, setEditingPanels }} />
    </>
  )
}

export default App
