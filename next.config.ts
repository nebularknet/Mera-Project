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
  redirects: async () => {
    return [
      // Only redirect from main domain to subdomains (avoid conflicts with middleware)
      {
        source: '/academy',
        destination: 'https://academy.nebulark.net',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'nebulark.net',
          },
        ],
      },
      {
        source: '/studio',
        destination: 'https://studio.nebulark.net',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'nebulark.net',
          },
        ],
      },
    ];
  },
  serverExternalPackages: ['@tsparticles/react', '@tsparticles/preset-links', 'react-icons'],
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
  