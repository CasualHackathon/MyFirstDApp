/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 配置
  serverExternalPackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  webpack: (config, { dev, isServer }) => {
    // Prevent hydration mismatch in development
    if (dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig
