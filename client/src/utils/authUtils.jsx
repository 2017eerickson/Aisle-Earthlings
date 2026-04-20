import axios from 'axios'

const authAPI = axios.create({
    baseURL: '/api/v1/users',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
})

export async function verifyUser() {
    const response = await authAPI.get('/')
    if (response.status !== 200) throw new Error(`Unexpected status: ${response.status}`)
    return response.data
}

export async function createUser(email, password) {
    const response = await authAPI.post('/create/', { email, password })
    if (response.status !== 201) throw new Error(`Unexpected status: ${response.status}`)
    return response.data
}

export async function loginUser(email, password) {
    const response = await authAPI.post('/login/', { email, password })
    if (response.status !== 200) throw new Error(`Unexpected status: ${response.status}`)
    return response.data
}

export async function logoutUser() {
    const response = await authAPI.post('/logout/')
    if (response.status !== 200) throw new Error(`Unexpected status: ${response.status}`)
    return response.data
}
