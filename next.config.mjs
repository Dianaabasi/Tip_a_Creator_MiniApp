/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ["imagedelivery.net", "res.cloudinary.com", "i.imgur.com", "warpcast.com"],
      unoptimized: true,
    },
    async headers() {
      return [
        {
          source: "/.well-known/fc:miniapp:manifest",
          headers: [
            { key: "Content-Type", value: "application/json" },
            { key: "Cache-Control", value: "public, max-age=3600" },
            { key: "Access-Control-Allow-Origin", value: "*" },
          ],
        },
      ];
    },
    async rewrites() {
      return [
        {
          source: "/.well-known/fc:miniapp:manifest",
          destination: "/manifest.json",
        },
      ];
    },
    eslint: {
      ignoreDuringBuilds: false,
    },
    typescript: {
      ignoreBuildErrors: false,
    },
  };
  
  export default nextConfig;