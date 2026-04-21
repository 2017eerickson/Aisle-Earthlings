import axios from 'axios'

const geminiAPI = axios.create({
  baseURL: '/api/v1/gemini',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export async function getStoreInfo(locationId) {
  const response = await geminiAPI.get(`/store-info/${locationId}/`)
  if (response.status !== 200) throw new Error(`Unexpected status: ${response.status}`)
  return response.data
}
