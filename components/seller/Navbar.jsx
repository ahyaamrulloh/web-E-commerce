'use client'
import React from 'react'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const Navbar = () => {
  const router = useRouter()

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b bg-white'>
      {/* Logo — klik balik ke toko */}
      <div className='flex items-center gap-3'>
        <Image
          onClick={() => router.push('/')}
          className='w-28 lg:w-32 cursor-pointer'
          src={assets.logo}
          alt="logo"
        />
        <span className='text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-full'>
          Seller Dashboard
        </span>
      </div>

      {/* Kanan — tombol ke toko + avatar */}
      <div className='flex items-center gap-4'>
        <button
          onClick={() => router.push('/')}
          className='text-xs text-gray-600 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition'
        >
          Lihat Toko
        </button>
        <UserButton afterSignOutUrl='/' />
      </div>
    </div>
  )
}

export default Navbar