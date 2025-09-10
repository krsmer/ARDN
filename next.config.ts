import type { NextConfig } from "next";

// Production build configuration - seed file removed
const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  typescript: {
    // ⚠️ Be careful with this option in production
    ignoreBuildErrors: false,
  },
  eslint: {
    // ⚠️ Be careful with this option in production  
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
