import type { MetadataRoute } from "next";

// MVP sitemap: only the two live pages (homepage + privacy). The public
// directory (browse / category / supplier) was removed for MVP; add its URLs
// back here when it returns.
const BASE = "https://thevowedit.ph";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
