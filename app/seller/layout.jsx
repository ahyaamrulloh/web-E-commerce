'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import { useAppContext } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/components/Loading'

const Layout = ({ children }) => {
  const { user, isSeller, isLoaded } = useAppContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return // tunggu Clerk selesai cek session

    if (!user) {
      router.push('/sign-in') // belum login → ke halaman login
      return
    }

    if (!isSeller) {
      router.push('/') // sudah login tapi bukan seller → ke beranda
    }
  }, [isLoaded, user, isSeller])

  // Tampilkan loading selama Clerk masih cek session
  if (!isLoaded || !user || !isSeller) {
    return <Loading />
  }

  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout