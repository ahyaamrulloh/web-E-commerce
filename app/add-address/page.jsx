'use client'
import { assets } from "@/assets/assets"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import toast from "react-hot-toast"

const AddAddress = () => {
  const router = useRouter()
  const { user } = useAppContext()
  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    fullName: '',
    phoneNumber: '',
    pincode: '',
    area: '',
    city: '',
    state: '',
  })

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    // Validasi semua field terisi
    if (!address.fullName || !address.phoneNumber || !address.area || !address.city || !address.state) {
      toast.error('Semua field wajib diisi')
      return
    }

    if (!user) {
      toast.error('Login dulu ya')
      router.push('/sign-in')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/address/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: address.fullName,
          phone: address.phoneNumber,
          zip_code: address.pincode,
          address: address.area,
          city: address.city,
          province: address.state,
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Alamat berhasil disimpan')
        router.push('/cart') // balik ke cart setelah simpan alamat
      } else {
        toast.error('Gagal simpan alamat: ' + data.error)
      }
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-500">
            Tambah Alamat <span className="font-semibold text-orange-600">Pengiriman</span>
          </p>
          <div className="space-y-3 max-w-sm mt-10">
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Nama lengkap"
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              value={address.fullName}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Nomor telepon"
              onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
              value={address.phoneNumber}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Kode pos"
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              value={address.pincode}
            />
            <textarea
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
              rows={4}
              placeholder="Alamat lengkap (jalan, RT/RW, kelurahan)"
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              value={address.area}
              required
            />
            <div className="flex space-x-3">
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="Kota/Kabupaten"
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                value={address.city}
                required
              />
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="Provinsi"
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                value={address.state}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="max-w-sm w-full mt-6 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Simpan Alamat'}
          </button>
        </form>
        <Image
          className="md:mr-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="my_location_image"
        />
      </div>
      <Footer />
    </>
  )
}

export default AddAddress