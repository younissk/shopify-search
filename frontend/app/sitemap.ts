import { MetadataRoute } from "next";
import { supabase } from "@/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shopifysearch.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/domains`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  try {
    // Fetch top domains for dynamic sitemap entries
    const { data: domains } = await supabase
      .from("domains")
      .select("domain, updated_at")
      .order("product_count", { ascending: false, nullsFirst: false })
      .limit(500); // Limit to top 500 domains to keep sitemap reasonable

    const domainRoutes: MetadataRoute.Sitemap =
      domains?.map((domain) => ({
        url: `${baseUrl}/domains/${domain.domain}`,
        lastModified: domain.updated_at ? new Date(domain.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })) || [];

    return [...staticRoutes, ...domainRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least static routes if dynamic generation fails
    return staticRoutes;
  }
}

