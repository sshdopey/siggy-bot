/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Expose GIPHY key to client for SDK usage
    NEXT_PUBLIC_GIPHY_API_KEY: process.env.GIPHY_API_KEY,
  },
};
export default nextConfig;
