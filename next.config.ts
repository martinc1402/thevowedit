import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Supabase Storage public objects (any project ref). Supplier images
        // live at https://<ref>.supabase.co/storage/v1/object/public/supplier-images/...
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      // Public profiles moved from /suppliers/<slug> to /vendors/<slug>.
      {
        source: "/suppliers/:slug",
        destination: "/vendors/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
