/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  turbopack: {},

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Environment variables
  env: {},

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/code/format",
        destination: "/code/formatter",
        permanent: true,
      },
      {
        source: "/code/minify",
        destination: "/code/minifier",
        permanent: true,
      },
      {
        source: "/http/builder",
        destination: "/http-builder",
        permanent: true,
      },
      { source: "/unix", destination: "/unix-time", permanent: true },
      { source: "/qrcode", destination: "/qr-code", permanent: true },
    ];
  },
};

module.exports = nextConfig;
