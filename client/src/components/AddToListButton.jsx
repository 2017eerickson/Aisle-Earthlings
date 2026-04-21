import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getStoreDetail } from '../utils/krogerUtils'

export default function AddToListButton({ upc, productName, locationId = '', storeName, storeAddress, className = '' }) {
  const { addToList } = useOutletContext()
  const [added, setAdded] = useState(false)

  async function handleClick(e) {
    e.stopPropagation()
    try {
      let resolvedStoreName = storeName || ''
      let resolvedStoreAddress = storeAddress || ''

      if (!storeName && locationId) {
        try {
          const res = await getStoreDetail(locationId)
          resolvedStoreName = res.data.display_name || res.data.name || ''
          resolvedStoreAddress = res.data.address_line || ''
        } catch {
          // proceed without store info
        }
      }

      await addToList({
        upc,
        product_name: productName,
        product_store_id: locationId,
        store_name: resolvedStoreName,
        store_address: resolvedStoreAddress,
        quantity: 1,
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } catch (err) {
      console.error('Error adding to list:', err)
    }
  }

  return (
    <button onClick={handleClick} className={`cursor-pointer ${className}`}>
      {added ? 'added!' : 'add to list'}
    </button>
  )
}
