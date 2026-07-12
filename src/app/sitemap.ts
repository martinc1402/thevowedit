import type { MetadataRoute } from "next";
import { listSupplierSlugs } from "@/lib/suppliers";

// The public directory is live again, so it belongs in the sitemap: the browse index
// plus every published vendor profile. listSupplierSlugs() already filters to
// published, so an unpublished (or pruned) vendor can never leak in here.
const BASE = "https://thevowedit.ph";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listSupplierSlugs();

  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/vendors`, changeFrequency: "daily", priority: 0.9 },
    ...slugs.map((slug) => ({
      url: `${BASE}/vendors/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
