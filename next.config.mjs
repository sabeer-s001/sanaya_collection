/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["framer-motion", "lucide-react"],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'autumnlane.in' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'medias.utsavfashion.com' },
    ],
  },
};

export default nextConfig;
