import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, createUser } from '../utils/authUtils'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        try {
            if (isLogin) {
                await loginUser(email, password)
            } else {
                await createUser(email, password)
            }
            navigate('/')
        } catch (err) {
            setError(err.response?.data || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <div className='flex flex-col gap-4 w-80 p-8 border border-gray-200 rounded-lg'>
                <h1 className='text-2xl font-bold text-center'>AISLE EARTHLINGS</h1>
                <div className='flex border border-gray-200 rounded-md overflow-hidden'>
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${isLogin ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}
                        onClick={() => setIsLogin(true)}
                        type='button'
                    >
                        Log In
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${!isLogin ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}
                        onClick={() => setIsLogin(false)}
                        type='button'
                    >
                        Create Account
                    </button>
                </div>
                <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400'
                    />
                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400'
                    />
                    {error && <p className='text-red-500 text-sm'>{JSON.stringify(error)}</p>}
                    <button
                        type='submit'
                        className='bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors'
                    >
                        {isLogin ? 'Log In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}
