import React from 'react'
import { X, Trash2, Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { updateListItem, removeListItem } from '../utils/listUtils'

export default function GroceryListDrawer({ listOpen, setListOpen, listItems, setListItems }) {

  async function handleToggleCheck(item) {
    try {
      const updated = await updateListItem(item.id, { checked: !item.checked })
      setListItems(prev => prev.map(i => i.id === item.id ? updated : i))
    } catch (e) {
      console.error('Error updating item:', e)
    }
  }

  async function handleQuantityChange(item, delta) {
    const newQty = item.quantity + delta
    if (newQty < 1) return
    try {
      const updated = await updateListItem(item.id, { quantity: newQty })
      setListItems(prev => prev.map(i => i.id === item.id ? updated : i))
    } catch (e) {
      console.error('Error updating quantity:', e)
    }
  }

  async function handleRemove(itemId) {
    try {
      await removeListItem(itemId)
      setListItems(prev => prev.filter(i => i.id !== itemId))
    } catch (e) {
      console.error('Error removing item:', e)
    }
  }

  async function handleClearChecked() {
    const checked = listItems.filter(i => i.checked)
    await Promise.all(checked.map(i => removeListItem(i.id)))
    setListItems(prev => prev.filter(i => !i.checked))
  }

  const checkedCount = listItems.filter(i => i.checked).length
  
  return (
    
    <AnimatePresence >
      {listOpen && (
        <>
          <motion.div
            className='fixed inset-0 bg-black/30 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setListOpen(false)}
          />
          <motion.div
            data-testid='grocery-drawer'
            className='fixed top-0 right-0 flex flex-col h-screen w-[30%] bg-red-50 z-50 shadow-xl'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className='flex items-center justify-between p-4 border-b border-stone-200'>
              <h2 className='text-lg font-semibold text-stone-800'>
                MY LIST{' '}
                <span data-testid='list-item-count' className='text-sm font-normal text-stone-500'>({listItems.length})</span>
              </h2>
              <button data-testid='drawer-close-btn' onClick={() => setListOpen(false)} className='cursor-pointer'>
                <X size={24} />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3'>
              {listItems.length === 0 && (
                <p data-testid='list-empty-msg' className='text-stone-400 text-center mt-8 text-sm'>Your list is empty</p>
              )}
              {listItems.map(item => (
                <div
                  data-testid='list-item'
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm ${item.checked ? 'opacity-50' : ''}`}
                >
                  <input
                    data-testid='item-checkbox'
                    type='checkbox'
                    checked={item.checked}
                    onChange={() => handleToggleCheck(item)}
                    className='cursor-pointer w-4 h-4 accent-[var(--accent)]'
                  />
                  <div className='flex-1 flex flex-col min-w-0'>
                    {item.upc ? (
                      <Link
                        data-testid='item-product-link'
                        to={`/product/${item.upc}`}
                        state={{ location_id: item.product_store_id }}
                        onClick={() => setListOpen(false)}
                        className={`text-sm text-stone-800 text-left hover:underline ${item.checked ? 'line-through' : ''}`}
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      <span className={`text-sm text-stone-800 text-left ${item.checked ? 'line-through' : ''}`}>
                        {item.product_name}
                      </span>
                    )}
                    {item.store_name && (
                      <span className='text-xs text-stone-400 truncate'>
                        {item.store_name}{item.store_address ? ` · ${item.store_address}` : ''}
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-1'>
                    <button data-testid='qty-decrease' onClick={() => handleQuantityChange(item, -1)} className='cursor-pointer p-0.5'>
                      <Minus size={14} />
                    </button>
                    <span data-testid='qty-display' className='text-sm w-5 text-center'>{item.quantity}</span>
                    <button data-testid='qty-increase' onClick={() => handleQuantityChange(item, 1)} className='cursor-pointer p-0.5'>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    data-testid='item-delete'
                    onClick={() => handleRemove(item.id)}
                    className='cursor-pointer text-stone-400 hover:text-red-500'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {checkedCount > 0 && (
              <div className='p-4 border-t border-stone-200'>
                <button
                  data-testid='clear-checked-btn'
                  onClick={handleClearChecked}
                  className='w-full text-sm text-stone-500 hover:text-red-500 cursor-pointer'
                >
                  Clear {checkedCount} checked item{checkedCount > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
