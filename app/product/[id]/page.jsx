"use client"
import { useEffect, useState } from "react"
import { assets } from "@/assets/assets"
import ProductCard from "@/components/ProductCard"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import Loading from "@/components/Loading"
import { useAppContext } from "@/context/AppContext"
import React from "react"

const Product = () => {
  const { id } = useParams()
  const router = useRouter()
  const { products, addToCart } = useAppContext()

  const [mainImage, setMainImage] = useState(null)
  const [productData, setProductData] = useState(null)

  const fetchProductData = async () => {
    // Ganti _id → id
    const product = products.find(p => p.id === id)
    setProductData(product)
  }

  useEffect(() => {
    fetchProductData()
  }, [id, products.length])

  return productData ? (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* Gambar Produk */}
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image
                src={mainImage || productData.image[0]}
                alt={productData.name}
                className="w-full h-auto object-cover mix-blend-multiply"
                width={1280}
                height={720}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.image.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <Image
                    src={image}
                    alt={productData.name}
                    className="w-full h-auto object-cover mix-blend-multiply"
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Detail Produk */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Image
                    key={index}
                    className="h-4 w-4"
                    src={index < 4 ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                  />
                ))}
              </div>
              <p>(4.5)</p>
            </div>

            <p className="text-gray-600 mt-3">{productData.description}</p>

            {/* Harga — ganti $ → Rp, offerPrice → offer_price */}
            <p className="text-3xl font-medium mt-6">
              Rp {(productData.offer_price || productData.price).toLocaleString('id-ID')}
              {productData.offer_price && (
                <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                  Rp {productData.price.toLocaleString('id-ID')}
                </span>
              )}
            </p>

            <hr className="bg-gray-600 my-6" />

            {/* Info Produk */}
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/50">Generic</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/50">Multi</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50">{productData.category}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Stok</td>
                    <td className="text-gray-800/50">{productData.stock} tersedia</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tombol Aksi — ganti _id → id */}
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={() => addToCart(productData.id)}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(productData.id)
                  router.push('/cart')
                }}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* Produk Lainnya */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured <span className="font-medium text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products
              .filter(p => p.id !== productData.id) // jangan tampilkan produk yang sedang dibuka
              .slice(0, 5)
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>
          <button className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
            See more
          </button>
        </div>
      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default Product