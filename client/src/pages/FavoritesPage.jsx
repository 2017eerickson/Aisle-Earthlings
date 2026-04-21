import React, { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { getStoreDetail, getProductDetail } from '../utils/krogerUtils'
import StoreCard from '../components/StoreCard'
import ProductCard from '../components/ProductCard'
import FavoritesSection from '../components/FavoriteSection'

export default function FavoritesPage() {
  const { isAuthenticated, favorites } = useOutletContext()
  const navigate = useNavigate()
  const [storeData, setStoreData] = useState([])
  const [productData, setProductData] = useState([])
  const [storeSearch, setStoreSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [loadingStores, setLoadingStores] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    if (isAuthenticated === false) navigate('/')
  }, [isAuthenticated])

  useEffect(() => {
    const storeFavs = favorites.filter(f => f.favorite_type === 'store')
    if (storeFavs.length === 0) { setStoreData([]); return }
    console.log(storeFavs)
    setLoadingStores(true)
    Promise.allSettled(storeFavs.map(f => getStoreDetail(f.reference_id)
      .then(r => r.data)))
      .then(results => setStoreData(results.filter(r => r.status === 'fulfilled').map(r => r.value)))
      .finally(() => setLoadingStores(false))
  }, [favorites])

  useEffect(() => {
    const productFavs = favorites.filter(f => f.favorite_type === 'product')
    if (productFavs.length === 0) { setProductData([]); return }
    setLoadingProducts(true)
    console.log(productFavs)
    Promise.allSettled(productFavs.map(f => getProductDetail(f.location_id, f.reference_id)
      .then(r => r.data)))
      .then(results => setProductData(results.filter(r => r.status === 'fulfilled').map(r => r.value)))
      .finally(() => setLoadingProducts(false))
  }, [favorites])

  const filteredStores = storeData.filter(s => {
    const q = storeSearch.toLowerCase()
    return !q || s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.address_line?.toLowerCase().includes(q)
  })

  const filteredProducts = productData.filter(p => {
    const q = productSearch.toLowerCase()
    return !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
  })

  return (
    <div className='flex-1 flex flex-col gap-6 px-8 py-8'>
      <FavoritesSection
        title={['PRODUCT', 'FAVORITES']}
        bg='bg-[#ff7900]'
        loading={loadingProducts}
        items={filteredProducts}
        search={productSearch}
        onSearch={setProductSearch}
        renderCard={(product, i) => (
          <div key={product.upc || i} className='flex-shrink-0 w-36'>
            <ProductCard product={product} />
          </div>
        )}
      />
      <FavoritesSection
        title={['STORE', 'FAVORITES']}
        bg='bg-[#ffb8c4]'
        loading={loadingStores}
        items={filteredStores}
        search={storeSearch}
        onSearch={setStoreSearch}
        renderCard={(store, i) => (
          <div key={store.location_id || i} className='flex-shrink-0 w-44'>
            <StoreCard store={store} index={i} />
          </div>
        )}
        />
    </div>
  )
}


