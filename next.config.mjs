/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ allow external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        pathname: '/**',
      },
    ],
    // or just whitelist the domain
    domains: ['cdn.prod.website-files.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js', 'tesseract.js-core', 'sharp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
