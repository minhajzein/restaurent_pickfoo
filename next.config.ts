import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'deveznan.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'pickfoo-storage.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
