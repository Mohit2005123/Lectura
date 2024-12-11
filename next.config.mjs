/** @type {import('next').NextConfig} */
// next.config.js (ESM syntax)
export default {
     
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**', // Allow images from any domain
        },
      ],
      domains: ['cdn.prod.website-files.com'],
    },
  }
  
// next.config.js
