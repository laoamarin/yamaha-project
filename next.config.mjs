/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["tailwind-merge", "@base-ui/react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Prevent static-paths-worker from loading stale vendor-chunks during HMR
    webpackBuildWorker: false,
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Filesystem cache races with HMR → "Cannot find module vendor-chunks/..."
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
