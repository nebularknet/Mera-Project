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
    return [];
  },
  serverExternalPackages: ['@tsparticles/react', '@tsparticles/preset-links']
};

export default nextConfig;
  