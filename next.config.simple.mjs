/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ["localhost", "images.unsplash.com"],
  },
  env: {
    AGRICULTURAL_CONSCIOUSNESS: "enabled",
  },
};

export default nextConfig;
