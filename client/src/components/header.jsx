import React from 'react'
import { Link } from 'react-router-dom'

export default function header() {

    return (
        <div  id='header' className='flex flex-row justify-between items-center p-4 border-b-2 border-gray-200' >
            <h3><Link to='/sideNav'>MENU</Link></h3>
            <h1 className='text-green-700 text-5xl tracking-[.20em]'>AISLE EARTHLINGS</h1>
            <h3><Link to='/about'>ABOUT</Link></h3>
        </div>
    )
}
