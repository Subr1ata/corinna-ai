/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wordpress-1279519-4629189.cloudwaysapps.com",
      },
    ],
  },
};

export default nextConfig;
