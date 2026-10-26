import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../utils/authUtils'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        try {
            await requestPasswordReset(email)
            setSubmitted(true)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <div className='flex flex-col gap-4 w-80 p-8 border border-gray-200 rounded-lg'>
                <h1 className='text-2xl font-bold text-center'>AISLE EARTHLINGS</h1>
                <h2 className='text-lg font-medium text-center text-gray-700'>Reset Password</h2>

                {submitted ? (
                    <div className='flex flex-col gap-3'>
                        <p className='text-sm text-gray-600 text-center'>
                            If an account with that email exists, we've sent a password reset link. Check your inbox.
                        </p>
                        <Link to='/' className='text-sm text-center text-gray-500 hover:text-gray-700 transition-colors'>
                            Back to login
                        </Link>
                    </div>
                ) : (
                    <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                        <p className='text-sm text-gray-500'>
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                        <input
                            type='email'
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400'
                        />
                        {error && <p className='text-red-500 text-sm'>{JSON.stringify(error)}</p>}
                        <button
                            type='submit'
                            className='bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors'
                        >
                            Send Reset Link
                        </button>
                        <Link to='/' className='text-sm text-center text-gray-500 hover:text-gray-700 transition-colors'>
                            Back to login
                        </Link>
                    </form>
                )}
            </div>
        </div>
    )
}
