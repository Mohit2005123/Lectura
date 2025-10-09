/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow images from any domain
      },
    ],
    domains: ['cdn.prod.website-files.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle Firebase modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Handle Firebase vendor chunks
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        firebase: {
          test: /[\\/]node_modules[\\/]@?firebase/,
          name: 'firebase',
          chunks: 'all',
          priority: 10,
        },
      },
    };
    
    return config;
  },
};

export default nextConfig;
