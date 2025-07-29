/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined, // Ensure we're not using static export
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
  