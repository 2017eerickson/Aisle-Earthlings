import axios from 'axios'

const listAPI = axios.create({
  baseURL: 'https://aisleearthlings.com/api/v1/list', 
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export async function getList() {
  const res = await listAPI.get('/')
  return res.data
}

export async function addListItem(itemData) {
  const res = await listAPI.post('/', itemData)
  return res.data
}

export async function updateListItem(itemId, data) {
  const res = await listAPI.patch(`/items/${itemId}/`, data)
  return res.data
}

export async function removeListItem(itemId) {
  await listAPI.delete(`/items/${itemId}/`)
}
