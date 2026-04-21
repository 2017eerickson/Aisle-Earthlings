import axios from 'axios'

const favoritesAPI = axios.create({
  baseURL: '/api/v1/favorites',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export async function getFavorites() {
  const res = await favoritesAPI.get('/')
  return res.data
}

export async function addFavorite(favorite_type, reference_id) {
  const res = await favoritesAPI.post('/', { favorite_type, reference_id })
  return res.data
}

export async function removeFavorite(id) {
  await favoritesAPI.delete(`/${id}/`)
}
