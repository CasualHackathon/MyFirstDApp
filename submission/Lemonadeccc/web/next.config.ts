import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.meshy\.ai\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'meshy-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /^https:\/\/gateway\.pinata\.cloud\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'ipfs-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  // 基础优化
  poweredByHeader: false,
  compress: true,
  
  // 构建时忽略 ESLint（仅在 GitHub Actions 或显式开启时）
  eslint: {
    ignoreDuringBuilds: process.env.GITHUB_ACTIONS === 'true' || process.env.NEXT_IGNORE_ESLINT === 'true',
  },

  // 构建时忽略 TypeScript 错误（仅在 GitHub Actions 或显式开启时）
  typescript: {
    ignoreBuildErrors: process.env.GITHUB_ACTIONS === 'true' || process.env.NEXT_IGNORE_TS_ERRORS === 'true',
  },
  
  // 图片优化
  images: {
    domains: [
      'api.meshy.ai',
      'gateway.pinata.cloud',
      'ipfs.io',
      'cloudflare-ipfs.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7天
  },
  
  // 实验性功能
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
    ],
  },
  
  // 服务器外部包
  serverExternalPackages: ['three', '@react-three/fiber', '@react-three/drei'],
  
  // Webpack 优化
  webpack: (config, { dev, isServer }) => {
    // 外部化某些包以减少bundle大小
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // 优化three.js相关包
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // 生产环境优化
    if (!dev) {
      // 去除console.log（已有logger替代）
      config.optimization.minimizer?.forEach((minimizer: any) => {
        if (minimizer.options && minimizer.options.minimizer) {
          minimizer.options.minimizer.options = {
            ...minimizer.options.minimizer.options,
            compress: {
              ...minimizer.options.minimizer.options.compress,
              drop_console: true,
              drop_debugger: true,
            },
          };
        }
      });
    }
    
    return config;
  },
  
  // 输出配置
  output: 'standalone',
  
  // 重定向规则
  async redirects() {
    return [
      {
        source: '/api-test',
        destination: '/test',
        permanent: true,
      },
    ];
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // 3D模型文件缓存
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default withPWA(nextConfig);
