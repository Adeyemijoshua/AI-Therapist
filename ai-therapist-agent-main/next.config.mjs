/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  //  FIXED Experimental Section:
  experimental: {
    // Remove all the invalid options, keep only valid ones:
    turbo: {
      //  CORRECT: turbo should be an object, not boolean
      rules: {
        '*.{ts,tsx}': ['...'],
      }
    },
    // Remove these invalid options:
    // appDir: true,  // REMOVE - Not needed in Next.js 14
    // suppressHydrationWarning: true,  // REMOVE
    // skipTypeChecking: true,  // REMOVE  
    // skipMiddlewareUrlNormalize: true,  // REMOVE
    // missingSuspenseWithCSRBailout: false,  // REMOVE
    
    // You can add these if you want:
    optimizeCss: true,
    webpackMemoryOptimizations: true,
  },

  reactStrictMode: false,
  
  images: {
    unoptimized: true,
  },
  
  //  ENABLE swcMinify for faster builds
  swcMinify: true,
  
  pageExtensions: ["tsx", "ts", "jsx", "js"].filter(
    (ext) => !ext.includes("spec")
  ),
  
  //  FIXED Webpack config:
  webpack: (config, { isServer, dev }) => {
    // Keep your aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      canvas$: false,
    };
    
    // Add these for better performance:
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      }
    }
    
    return config;
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;