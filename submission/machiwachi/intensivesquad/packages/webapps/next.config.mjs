/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // redirects: async () => {
  // return [
  //   {
  //     source: "/",
  //     destination: "/leaderboard",
  //     permanent: true,
  //   },
  // ];
  // },
};

export default nextConfig;
