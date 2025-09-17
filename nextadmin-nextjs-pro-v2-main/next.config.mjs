/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,   // ignora errores de TS en build
  },
  eslint: {
    ignoreDuringBuilds: true,  // ignora errores de ESLint en build
  },
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "http",  hostname: "img.bbystatic.com" },
      { protocol: "https", hostname: "pub-73fe63a332d247cb9166493e4dbbd09b.r2.dev" },
    ],
  },
};

export default nextConfig;
