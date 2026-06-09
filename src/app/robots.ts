import type { MetadataRoute } from "next";

// MVP robots policy. Only the homepage and /privacy are live, so everything is
// crawlable; the directory routes were removed for MVP. Add disallows back here
// if non-public routes return.
const BASE = "https://thevowedit.ph";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
