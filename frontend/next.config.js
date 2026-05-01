/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Railway/Vercel deployed backend (fill in your subdomain)
      { protocol: "https", hostname: "**.up.railway.app" },
      { protocol: "https", hostname: "**.vercel.app" },
    ],
  },
  // Mapbox GL requires transpilation
  transpilePackages: ["mapbox-gl"],
};

module.exports = nextConfig;

