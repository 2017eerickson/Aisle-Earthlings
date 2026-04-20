import React from 'react'
import { Link } from 'react-router-dom'


export default function sideNav() {

  return (
    <div id='sideNav' className='flex flex-col justify-start items-start gap-4 p-4 min-h-screen w-[20%] bg-red-50' >
        <h1><Link to='/'>X</Link></h1>
        <h1><Link to='/'>HOME</Link></h1>
        <h1><Link to='/compare'>COMPARE</Link></h1>
        <h1><Link to='/favorites'>FAVORITES</Link></h1>
        <h1><Link to='/logout'>LOGOUT</Link></h1>

    </div>
  )
}
