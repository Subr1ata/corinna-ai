/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
      {
        protocol: "https",
        hostname: "wordpress-1269066-4577871.cloudwaysapps.com",
      },
      {
        protocol: "https",
        hostname: "wordpress-1279519-4629189.cloudwaysapps.com",
      },
    ],
  },
};

export default nextConfig;
