

const nextConfig: any = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "payload-saleor-payload.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.salp.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
