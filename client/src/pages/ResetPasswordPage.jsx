import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { resetPassword } from '../utils/authUtils'

export default function ResetPasswordPage() {
    const { uid, token } = useParams()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            await resetPassword(uid, token, password)
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        }
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen'>
            <div className='flex flex-col gap-4 w-80 p-8 border border-gray-200 rounded-lg'>
                <h1 className='text-2xl font-bold text-center'>AISLE EARTHLINGS</h1>
                <h2 className='text-lg font-medium text-center text-gray-700'>Set New Password</h2>

                {success ? (
                    <div className='flex flex-col gap-3'>
                        <p className='text-sm text-gray-600 text-center'>
                            Your password has been reset successfully.
                        </p>
                        <Link
                            to='/'
                            className='bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors text-center'
                        >
                            Log In
                        </Link>
                    </div>
                ) : (
                    <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                        <input
                            type='password'
                            placeholder='New password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400'
                        />
                        <input
                            type='password'
                            placeholder='Confirm new password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className='border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400'
                        />
                        {error && <p className='text-red-500 text-sm'>{JSON.stringify(error)}</p>}
                        <button
                            type='submit'
                            className='bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors'
                        >
                            Reset Password
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
