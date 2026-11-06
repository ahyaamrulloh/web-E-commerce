/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.com',  // untuk nanti upload foto produk ke Supabase Storage
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com', // gambar dari GitHub
        pathname: '**',
      },
    ],
  },
}

export default nextConfig