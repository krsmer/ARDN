import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  typescript: {
    // ⚠️ Be careful with this option in production
    ignoreBuildErrors: false,
  },
  eslint: {
    // ⚠️ Be careful with this option in production  
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
