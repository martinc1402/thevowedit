import type { MetadataRoute } from "next";

// Pre-launch sitemap: only the two live pages. Expand this (and the robots
// disallow list) when the directory routes come back — see src/lib/launch.ts.
const BASE = "https://thevowedit.ph";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
