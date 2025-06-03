/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.alchemyapi.io',
        port: '',
        pathname: '/images/assets/**',
      },
    ],
  },
};

export default nextConfig;
