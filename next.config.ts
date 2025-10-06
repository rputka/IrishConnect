import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow common external image domains to prevent Next/Image errors
    // Add or adjust as needed when you know your actual sources
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
