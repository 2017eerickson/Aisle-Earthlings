import axios from 'axios'

const geminiAPI = axios.create({
  baseURL: 'https://aisleearthlings.com/api/v1/gemini',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export async function getVeganStatus(upc) {
  const response = await geminiAPI.get(`/vegan/${upc}/`)
  if (response.status !== 200) throw new Error(`Unexpected status: ${response.status}`)
  return response.data
}
