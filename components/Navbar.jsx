"use client"
import React from "react"
import { assets } from "@/assets/assets"
import Link from "next/link"
import { useAppContext } from "@/context/AppContext"
import { UserButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"

const Navbar = () => {
  const { isSeller, getCartCount } = useAppContext()
  const router = useRouter()

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">

      {/* Logo */}
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
      />

      {/* Menu tengah — desktop */}
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">Home</Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">Shop</Link>
        <Link href="/" className="hover:text-gray-900 transition">Contact</Link>
        {isSeller && (
          <button
            onClick={() => router.push('/seller')}
            className="text-xs border px-4 py-1.5 rounded-full"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      {/* Kanan — desktop */}
      <div className="hidden md:flex items-center gap-5">

        {/* Keranjang */}
        <button
          onClick={() => router.push('/cart')}
          className="relative"
        >
          <Image
            className="w-5 h-5"
            src={assets.cart_icon}
            alt="cart"
          />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </button>

        {/* User — pakai Clerk UserButton */}
        <UserButton afterSignOutUrl="/" />

      </div>

      {/* Kanan — mobile */}
      <div className="flex items-center md:hidden gap-4">
        {isSeller && (
          <button
            onClick={() => router.push('/seller')}
            className="text-xs border px-3 py-1 rounded-full"
          >
            Seller
          </button>
        )}

        {/* Keranjang mobile */}
        <button
          onClick={() => router.push('/cart')}
          className="relative"
        >
          <Image
            className="w-5 h-5"
            src={assets.cart_icon}
            alt="cart"
          />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </button>

        {/* User mobile */}
        <UserButton afterSignOutUrl="/" />
      </div>

    </nav>
  )
}

export default Navbar