/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // We'll keep the default Next.js webpack configuration
    // Locatorjs should work without changing the devtool
    return config;
  },
};

module.exports = nextConfig;