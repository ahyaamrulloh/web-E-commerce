'use client'
import React, { useState } from "react"
import { assets } from "@/assets/assets"
import Image from "next/image"
import toast from "react-hot-toast"

const AddProduct = () => {
  const [files, setFiles] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Earphone')
  const [price, setPrice] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [stock, setStock] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi minimal 1 gambar
    const uploadedFiles = files.filter(Boolean)
    if (uploadedFiles.length === 0) {
      toast.error('Upload minimal 1 gambar produk')
      return
    }

    setLoading(true)
    try {
      // Kirim sebagai FormData karena ada file
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('price', price)
      formData.append('offer_price', offerPrice)
      formData.append('stock', stock || 0)

      // Append semua file gambar
      uploadedFiles.forEach((file) => {
        formData.append('images', file)
      })

      const res = await fetch('/api/seller/product/add', {
        method: 'POST',
        body: formData // tidak perlu Content-Type, browser set otomatis
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Produk berhasil ditambahkan')
        // Reset form
        setFiles([])
        setName('')
        setDescription('')
        setCategory('Earphone')
        setPrice('')
        setOfferPrice('')
        setStock('')
      } else {
        toast.error('Gagal: ' + data.error)
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        {/* Upload Gambar */}
        <div>
          <p className="text-base font-medium">Gambar Produk</p>
          <p className="text-xs text-gray-400 mb-2">Upload maksimal 4 gambar</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  onChange={(e) => {
                    const updatedFiles = [...files]
                    updatedFiles[index] = e.target.files[0]
                    setFiles(updatedFiles)
                  }}
                  type="file"
                  id={`image${index}`}
                  accept="image/*"
                  hidden
                />
                <Image
                  className="max-w-24 cursor-pointer rounded border border-gray-200 object-cover"
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                  alt="upload"
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Nama Produk */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Nama Produk
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Masukkan nama produk"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">
            Deskripsi Produk
          </label>
          <textarea
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Deskripsikan produk kamu"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          />
        </div>

        {/* Kategori, Harga, Stok */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="category">
              Kategori
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="Earphone">Earphone</option>
              <option value="Headphone">Headphone</option>
              <option value="Watch">Watch</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Camera">Camera</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Harga
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Harga Diskon
            </label>
            <input
              id="offer-price"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="stock">
              Stok
            </label>
            <input
              id="stock"
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setStock(e.target.value)}
              value={stock}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Menyimpan...' : 'Tambah Produk'}
        </button>
      </form>
    </div>
  )
}

export default AddProduct