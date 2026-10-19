/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  // Redirects are now handled in middleware.ts for better performance
  // (except the retired /jobs pages, which moved to /careers).
  async redirects() {
    return [
      { source: "/jobs", destination: "/careers", permanent: true },
      { source: "/jobs/:id", destination: "/careers/:id", permanent: true },
    ];
  },
  serverExternalPackages: ['@tsparticles/react', '@tsparticles/preset-links', 'react-icons'],
  turbopack: {},
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Handle chunk loading issues
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
};

export default nextConfig;
  