'use client'
import React, { useEffect, useState } from "react"
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Footer from "@/components/seller/Footer"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"

const ProductList = () => {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSellerProducts = async () => {
    try {
      const res = await fetch('/api/seller/product/list')
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Gagal fetch produk:', error)
      toast.error('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const res = await fetch('/api/seller/product/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          is_active: !currentStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(currentStatus ? 'Produk dinonaktifkan' : 'Produk diaktifkan')
        fetchSellerProducts() // refresh list
      }
    } catch (error) {
      toast.error('Gagal update status produk')
    }
  }

  useEffect(() => {
    fetchSellerProducts()
  }, [])

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">Semua Produk ({products.length})</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Produk</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">Kategori</th>
                  <th className="px-4 py-3 font-medium truncate">Harga</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">Stok</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">Status</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Belum ada produk. Tambah produk dulu.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-gray-500/20">
                      {/* Nama + Gambar */}
                      <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                        <div className="bg-gray-500/10 rounded p-2 flex-shrink-0">
                          <Image
                            src={product.image[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover"
                            width={64}
                            height={64}
                          />
                        </div>
                        <span className="truncate w-full">{product.name}</span>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3 max-sm:hidden">{product.category}</td>

                      {/* Harga — ganti $ → Rp, offerPrice → offer_price */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>Rp {(product.offer_price || product.price).toLocaleString('id-ID')}</span>
                          {product.offer_price && (
                            <span className="line-through text-xs text-gray-400">
                              Rp {product.price.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stok */}
                      <td className="px-4 py-3 max-sm:hidden">
                        <span className={product.stock === 0 ? 'text-red-500' : ''}>
                          {product.stock}
                        </span>
                      </td>

                      {/* Status aktif/nonaktif */}
                      <td className="px-4 py-3 max-sm:hidden">
                        <button
                          onClick={() => toggleProductStatus(product.id, product.is_active)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 max-sm:hidden">
                        <button
                          onClick={() => router.push(`/product/${product.id}`)}
                          className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md"
                        >
                          <span className="hidden md:block">Lihat</span>
                          <Image
                            className="h-3.5"
                            src={assets.redirect_icon}
                            alt="redirect_icon"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default ProductList