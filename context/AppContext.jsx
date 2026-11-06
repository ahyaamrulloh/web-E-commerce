'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const AppContext = createContext(null)

export const AppContextProvider = ({ children }) => {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState({})
  const [isSeller, setIsSeller] = useState(false)

  // Fetch produk dari Supabase
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Gagal fetch produk:', error.message)
      return
    }
    setProducts(data)
  }

  // Cek role + sync user ke Supabase setiap login
  useEffect(() => {
  if (isLoaded && user) {
    setIsSeller(user.publicMetadata?.role === 'seller')
    syncUser()

    // Cek apakah ada produk yang pending sebelum login
    const pendingCart = localStorage.getItem('pendingCart')
    if (pendingCart) {
      setCartItems(prev => ({
        ...prev,
        [pendingCart]: (prev[pendingCart] || 0) + 1
      }))
      localStorage.removeItem('pendingCart') // hapus setelah diproses
      toast.success('Produk ditambahkan ke keranjang')
      router.push('/cart') // langsung ke cart
    }
  }
}, [isLoaded, user])

  // Fetch produk saat pertama kali app dibuka
  useEffect(() => {
    fetchProducts()
  }, [])

  // Load cart dari localStorage saat pertama buka
  useEffect(() => {
  const savedCart = localStorage.getItem('cartItems')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // simpan cart ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  // Kirim data user ke API route untuk disimpan ke Supabase
  const syncUser = async () => {
    await fetch('/api/user/sync', { method: 'POST' })
  }

  // Tambah produk ke keranjang
  const addToCart = (productId) => {
    if (!user) {
      // Simpan produk yang mau dibeli sebelum redirect login
      localStorage.setItem('pendingCart', productId)
      toast.error('Login dulu ya')
      router.push('/sign-in')
      return
    }
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
    toast.success('Ditambahkan ke keranjang')
  }

  // Update jumlah item
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prev => ({ ...prev, [productId]: quantity }))
  }

  // Hapus item dari keranjang
  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const updated = { ...prev }
      delete updated[productId]
      return updated
    })
    toast.success('Dihapus dari keranjang')
  }

  // Kosongkan keranjang (dipanggil setelah checkout berhasil)
  const clearCart = () => {
  setCartItems({})
  localStorage.removeItem('cartItems')
}

  // Total jumlah item untuk badge di navbar
  const getCartCount = () =>
    Object.values(cartItems).reduce((total, qty) => total + qty, 0)

  // Total harga semua item
  const getCartTotal = () =>
    Object.entries(cartItems).reduce((total, [id, qty]) => {
      const product = products.find(p => p.id === id)
      if (!product) return total
      return total + (product.offer_price || product.price) * qty
    }, 0)

  const value = {
    products,
    user,
    isSeller,
    isLoaded,
    cartItems,
    fetchProducts,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    supabase,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext harus dipakai di dalam AppContextProvider')
  return context
}