'use client'
import React from 'react'
import Link from 'next/link'
import { assets } from '../../assets/assets'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const SideBar = () => {
  const pathname = usePathname()

  const menuItems = [
    {
      name: 'Tambah Produk',
      path: '/seller',
      icon: assets.add_icon,
      description: 'Upload produk baru'
    },
    {
      name: 'Daftar Produk',
      path: '/seller/product-list',
      icon: assets.product_list_icon,
      description: 'Kelola semua produk'
    },
    {
      name: 'Pesanan',
      path: '/seller/orders',
      icon: assets.order_icon,
      description: 'Kelola pesanan masuk'
    },
  ]

  return (
    <div className='md:w-64 w-16 border-r min-h-screen text-sm border-gray-200 py-4 flex flex-col bg-white'>

      {/* Menu label — hanya desktop */}
      <p className='hidden md:block text-xs text-gray-400 uppercase font-medium px-4 mb-2'>
        Menu
      </p>

      {menuItems.map((item) => {
        const isActive = pathname === item.path

        return (
          <Link href={item.path} key={item.name}>
            <div className={`flex items-center py-3 px-4 gap-3 transition cursor-pointer ${
              isActive
                ? 'border-r-4 border-orange-500 bg-orange-50 text-orange-600'
                : 'hover:bg-gray-50 text-gray-600 border-r-4 border-transparent'
            }`}>

              {/* Icon */}
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-orange-100' : 'bg-gray-100'}`}>
                <Image
                  src={item.icon}
                  alt={item.name}
                  className='w-5 h-5'
                />
              </div>

              {/* Label — hanya desktop */}
              <div className='hidden md:flex flex-col'>
                <span className={`font-medium ${isActive ? 'text-orange-600' : 'text-gray-700'}`}>
                  {item.name}
                </span>
                <span className='text-xs text-gray-400'>{item.description}</span>
              </div>

            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default SideBar