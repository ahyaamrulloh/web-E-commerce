'use client'
import React, { useEffect, useState } from "react"
import { assets } from "@/assets/assets"
import Image from "next/image"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import Loading from "@/components/Loading"

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/order/list')
      const data = await res.json()
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Gagal fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">Pesanan Saya</h2>

          {loading ? <Loading /> : orders.length === 0 ? (
            <p className="text-gray-500 text-sm mt-4">Belum ada pesanan.</p>
          ) : (
            <div className="max-w-5xl border-t border-gray-300 text-sm">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300"
                >
                  {/* Nama Produk */}
                  <div className="flex-1 flex gap-5 max-w-80">
                    <Image
                      className="max-w-16 max-h-16 object-cover"
                      src={assets.box_icon}
                      alt="box_icon"
                    />
                    <div className="flex flex-col gap-3">
                      <span className="font-medium text-base">
                        {order.order_items.map(item =>
                          `${item.products?.name} x ${item.quantity}`
                        ).join(', ')}
                      </span>
                      <span>Items: {order.order_items.length}</span>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div>
                    <p>
                      <span className="font-medium">{order.addresses?.full_name}</span>
                      <br />
                      <span>{order.addresses?.address}</span>
                      <br />
                      <span>{order.addresses?.city}, {order.addresses?.province}</span>
                      <br />
                      <span>{order.addresses?.phone}</span>
                    </p>
                  </div>

                  {/* Total */}
                  <p className="font-medium my-auto">
                    Rp {order.total_amount?.toLocaleString('id-ID')}
                  </p>

                  {/* Status */}
                  <div>
                    <p className="flex flex-col gap-1">
                      <span>Status: <span className={`font-medium ${
                        order.status === 'Done' ? 'text-green-600' :
                        order.status === 'Shipped' ? 'text-blue-600' :
                        order.status === 'Cancelled' ? 'text-red-600' :
                        'text-orange-600'
                      }`}>{order.status}</span></span>
                      <span>Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                      <span>Pembayaran: <span className={`font-medium ${
                        order.payment_status === 'Paid' ? 'text-green-600' : 'text-orange-600'
                      }`}>{order.payment_status}</span></span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default MyOrders