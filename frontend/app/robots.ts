import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shopifysearch.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/*",
          "/domain-requests",
          "/collections/new",
          "/collections/*/edit",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

