import type { MetadataRoute } from "next";

// Pre-launch robots policy. The directory routes return 404 while MVP_LAUNCH is
// true (see src/lib/launch.ts); the explicit disallows keep crawlers off the
// known prefixes in the meantime. Remove them when the directory goes live.
const BASE = "https://thevowedit.ph";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/browse", "/supplier/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
