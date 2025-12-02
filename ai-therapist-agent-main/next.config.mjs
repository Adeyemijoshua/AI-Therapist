/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ FIXED - Remove invalid options
  experimental: {
    turbo: {
      rules: {
        '*.{ts,tsx}': ['...'],
      }
    },
    optimizeCss: false, // Disable if causing critters error
    // REMOVE: webpackMemoryOptimizations (invalid)
  },

  reactStrictMode: false,
  
  images: {
    unoptimized: true,
  },
  
  swcMinify: true,
  
  // ✅ DISABLE optimization that needs critters
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      canvas$: false,
    };
    return config;
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // ✅ ADD output export for static deployment
  output: 'standalone',
};

export default nextConfig;