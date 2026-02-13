/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      
      { source: '/loan', destination: '/tools/loan', permanent: true },
      { source: '/gold-goal', destination: '/tools/gold-goal', permanent: true },
    ];
  },
};

export default nextConfig;
