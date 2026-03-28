import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-pdf"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      // Steam CDN
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "media.steampowered.com" },
      { protocol: "https", hostname: "steamcdn-a.akamaihd.net" },
      // TMDB
      { protocol: "https", hostname: "image.tmdb.org" },
      // Google Books
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "*.books.google.com" },
      // Picsum (dummy certificate thumbnails)
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Spotify
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      // Flag CDN
      { protocol: "https", hostname: "flagcdn.com" },
      // Pinterest
      { protocol: "https", hostname: "i.pinimg.com" },
    ],
  },

  // ✅ Disable ESLint saat build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Fix pdfjs-dist v4 + webpack: disable canvas/encoding stubs
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
};

export default nextConfig;
