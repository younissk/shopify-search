import { Product } from "@/types/Product";

export type ProductSearchSort = "rank" | "recent";

export interface ProductSearchParams {
  query?: string;
  domain?: string;
  limit?: number;
  page?: number;
  sort?: ProductSearchSort;
}

export interface ProductSearchResponse {
  items: Product[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  sort: ProductSearchSort;
}

export interface ProductSearchError {
  message: string;
  status?: number;
  aborted?: boolean;
}

const DEFAULT_LIMIT = 24;
const DEFAULT_SORT: ProductSearchSort = "rank";

const SEARCH_ENDPOINT =
  process.env.NEXT_PUBLIC_PRODUCTS_SEARCH_URL ??
  "https://djvnxdkpoxfxabplpjei.supabase.co/functions/v1/products-search";

function buildQueryString(params: ProductSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.set("q", params.query);
  }

  if (params.domain) {
    searchParams.set("domain", params.domain);
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.limit) {
    searchParams.set("limit", params.limit.toString());
  }

  if (params.page) {
    searchParams.set("page", params.page.toString());
  }

  return searchParams.toString();
}

export async function searchProducts(
  params: ProductSearchParams,
  init?: { signal?: AbortSignal }
): Promise<{ data: ProductSearchResponse | null; error: ProductSearchError | null }> {
  const queryString = buildQueryString({
    sort: DEFAULT_SORT,
    limit: DEFAULT_LIMIT,
    page: 1,
    ...params,
  });

  const url = `${SEARCH_ENDPOINT}${queryString ? `?${queryString}` : ""}`;

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (anonKey) {
      headers.Authorization = `Bearer ${anonKey}`;
      headers.apikey = anonKey;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: init?.signal,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      let message = `Search request failed with status ${response.status}`;

      if (response.status === 401) {
        message =
          "Search request was unauthorized. Check that your Supabase anon key is configured and the edge function allows public access.";
      }

      return { data: null, error: { message, status: response.status } };
    }

    const payload = (await response.json()) as ProductSearchResponse;
    return { data: payload, error: null };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { data: null, error: { message: "Request aborted", aborted: true } };
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: { message } };
  }
}
