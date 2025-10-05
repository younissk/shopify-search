import { supabase } from "./client";

export interface CatalogueStatistics {
  totalProducts: number;
  totalImages: number;
  uniqueDomains: number;
  latestFetchedAt: string | null;
  latestUpdatedAt: string | null;
}

export interface StatisticsResponse {
  data: CatalogueStatistics | null;
  error: string | null;
}

export interface UniqueDomainsResponse {
  data: string[] | null;
  error: string | null;
}

export const getCatalogueStatistics = async (): Promise<StatisticsResponse> => {
  try {
    const [productCountResult, imageCountResult, latestFetchResult] = await Promise.all([
      supabase.from("products").select("*", { head: true, count: "exact" }),
      supabase.from("images").select("*", { head: true, count: "exact" }),
      supabase
        .from("products")
        .select("fetched_at, updated_at")
        .order("fetched_at", { ascending: false, nullsFirst: false })
        .limit(1),
    ]);

    const uniqueDomainsResult = await getUniqueProductDomains();

    if (productCountResult.error) {
      console.error("Error counting products:", productCountResult.error);
      return { data: null, error: productCountResult.error.message };
    }

    if (imageCountResult.error) {
      console.error("Error counting images:", imageCountResult.error);
      return { data: null, error: imageCountResult.error.message };
    }

    if (latestFetchResult.error) {
      console.error("Error fetching latest product metadata:", latestFetchResult.error);
      return { data: null, error: latestFetchResult.error.message };
    }

    if (uniqueDomainsResult.error) {
      console.error("Error fetching product domains:", uniqueDomainsResult.error);
      return { data: null, error: uniqueDomainsResult.error };
    }

    const latestEntry = latestFetchResult.data?.[0] ?? null;

    return {
      data: {
        totalProducts: productCountResult.count ?? 0,
        totalImages: imageCountResult.count ?? 0,
        uniqueDomains: uniqueDomainsResult.data?.length ?? 0,
        latestFetchedAt: latestEntry?.fetched_at ?? null,
        latestUpdatedAt: latestEntry?.updated_at ?? null,
      },
      error: null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error getting catalogue statistics:", errorMessage);
    return { data: null, error: errorMessage };
  }
};

export const getUniqueProductDomains = async (): Promise<UniqueDomainsResponse> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("domain")
      .not("domain", "is", null);

    if (error) {
      console.error("Error loading unique domains:", error);
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const uniqueDomains = Array.from(
      new Set(
        data
          .map((row) => row.domain)
          .filter((domain): domain is string => typeof domain === "string" && domain.trim().length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    return { data: uniqueDomains, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error getting unique product domains:", errorMessage);
    return { data: null, error: errorMessage };
  }
};
