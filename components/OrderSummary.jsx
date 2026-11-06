'use client'
import { useAppContext } from "@/context/AppContext"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const OrderSummary = () => {
  const { getCartCount, getCartTotal, user, cartItems, products, clearCart } = useAppContext()
  const router = useRouter()

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userAddresses, setUserAddresses] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('midtrans') // 'midtrans' | 'cod'
  const [loading, setLoading] = useState(false)

  const fetchUserAddresses = async () => {
    if (!user) return
    try {
      const res = await fetch('/api/address/list')
      const data = await res.json()
      if (data.addresses) setUserAddresses(data.addresses)
    } catch (error) {
      console.error('Gagal fetch alamat:', error)
    }
  }

  useEffect(() => {
    fetchUserAddresses()
  }, [user])

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    setIsDropdownOpen(false)
  }

  const createOrder = async () => {
    if (!selectedAddress) {
      toast.error('Pilih alamat pengiriman dulu')
      return
    }
    if (getCartCount() === 0) {
      toast.error('Keranjang masih kosong')
      return
    } 

    for (const [productId, quantity] of Object.entries(cartItems)) {
    const product = products.find(p => p.id === productId)
    if (product && product.stock < quantity) {
      toast.error(`Stok ${product.name} tidak cukup. Tersisa ${product.stock} item`)
      return
    }
    if (product && product.stock === 0) {
      toast.error(`${product.name} sudah habis`)
      return
    }
  }

    setLoading(true)
    try {
      const orderItems = Object.entries(cartItems).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)
        return {
          product_id: productId,
          quantity,
          price: product?.offer_price || product?.price || 0
        }
      })

      const total = getCartTotal() + Math.floor(getCartTotal() * 0.02)

      if (paymentMethod === 'cod') {
        // COD — langsung buat order tanpa payment
        const res = await fetch('/api/order/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: selectedAddress.id,
            items: orderItems,
            totalAmount: total,
            paymentMethod: 'cod',
            paymentStatus: 'Pending' // bayar saat barang datang
          })
        })
        const data = await res.json()
        if (data.success) {
          clearCart()
          router.push('/order-placed')
        } else {
          toast.error('Gagal membuat order: ' + data.error)
        }

      } else {
        // Midtrans — buat token dulu, baru buka payment popup
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: selectedAddress.id,
            items: orderItems,
            totalAmount: total
          })
        })
        const data = await res.json()

        if (data.token) {
          // Buka popup Midtrans Snap
          window.snap.pay(data.token, {
            onSuccess: async (result) => {
              // Update payment status di database
              await fetch('/api/payment/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderId,
                  paymentStatus: 'Paid'
                })
              })
              clearCart()
              router.push('/order-placed')
            },
            onPending: (result) => {
              toast('Pembayaran pending — selesaikan pembayaranmu')
              router.push('/my-orders')
            },
            onError: (result) => {
              toast.error('Pembayaran gagal, coba lagi')
            },
            onClose: () => {
              toast('Kamu menutup popup pembayaran')
            }
          })
        } else {
          toast.error('Gagal membuat transaksi: ' + data.error)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  const total = getCartTotal();

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">

        {/* Pilih Alamat */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Pilih Alamat
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.full_name}, ${selectedAddress.city}, ${selectedAddress.province}`
                  : "Pilih Alamat"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.length === 0 ? (
                  <li className="px-4 py-2 text-gray-400 text-sm">
                    Belum ada alamat tersimpan
                  </li>
                ) : (
                  userAddresses.map((address) => (
                    <li
                      key={address.id}
                      className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                      onClick={() => handleAddressSelect(address)}
                    >
                      {address.full_name}, {address.city}, {address.province}
                    </li>
                  ))
                )}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center text-orange-600"
                >
                  + Tambah Alamat Baru
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Pilih Metode Pembayaran */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Metode Pembayaran
          </label>
          <div className="flex flex-col gap-2">

            {/* Midtrans */}
            <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${
              paymentMethod === 'midtrans' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="payment"
                value="midtrans"
                checked={paymentMethod === 'midtrans'}
                onChange={() => setPaymentMethod('midtrans')}
                className="accent-orange-600"
              />
              <div>
                <p className="font-medium text-sm">Transfer / QRIS / Kartu Kredit</p>
                <p className="text-xs text-gray-400">Via Midtrans — bayar sekarang</p>
              </div>
            </label>

            {/* COD */}
            <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${
              paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="accent-orange-600"
              />
              <div>
                <p className="font-medium text-sm">Bayar di Tempat (COD)</p>
                <p className="text-xs text-gray-400">Bayar saat barang tiba</p>
              </div>
            </label>

          </div>
        </div>

        <hr className="border-gray-500/30" />

        {/* Ringkasan Harga */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items ({getCartCount()})</p>
            <p className="text-gray-800">Rp {getCartTotal().toLocaleString('id-ID')}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Ongkos Kirim</p>
            <p className="font-medium text-gray-800">Gratis</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>Rp {total.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={loading}
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Memproses...' : paymentMethod === 'cod' ? 'Buat Pesanan (COD)' : 'Bayar Sekarang'}
      </button>
    </div>
  )
}

export default OrderSummary