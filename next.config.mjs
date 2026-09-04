/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["framer-motion", "lucide-react"],
  // Removed: `optimizeFonts: false`
  // With 3 Google Fonts (Plus Jakarta Sans, Cormorant Garamond, Outfit), having
  // font optimization disabled was adding 300–500ms of render-blocking network
  // time. Next.js will now inline the critical font CSS and add preload hints.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'autumnlane.in' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'medias.utsavfashion.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/_next/static/:path*.map',
        destination: '/empty.map',
      },
    ];
  },
};

export default nextConfig;
