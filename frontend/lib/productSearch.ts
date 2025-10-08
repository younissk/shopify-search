import { Product } from "@/types/Product";

export type ProductSearchSort = "rank" | "recent";

export interface ProductSearchParams {
  query?: string;
  domain?: string;
  limit?: number;
  cursor?: string;
  sort?: ProductSearchSort;
}

export interface ProductSearchResponse {
  items: Product[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
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
  "https://djvnxdkpoxfxabplpjei.supabase.co/functions/v1/products-semantic-search";

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

  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  return searchParams.toString();
}

const REQUEST_TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retries?: number;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeout?: number; retries?: number }
): Promise<Response> {
  const { retries = MAX_RETRIES, ...fetchOptions } = options;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchWithTimeout(url, fetchOptions);
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error && error.name === "AbortError") {
        throw error; // Don't retry timeouts or user cancellations
      }
      
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.log(`🔍 [SEARCH] Retry ${attempt + 1}/${retries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

import { searchCache } from "./searchCache";
import { performanceMonitor } from "./monitoring";
import { circuitBreaker } from "./circuitBreaker";

export async function searchProducts(
  params: ProductSearchParams,
  init?: RequestOptions
): Promise<{ data: ProductSearchResponse | null; error: ProductSearchError | null }> {
  const startTime = performance.now();
  console.log(`🔍 [SEARCH] Starting search for query: "${params.query}"`);

  // Check cache first
  if (params.query) {
    const cached = searchCache.get(params.query, params.domain);
    if (cached) {
      console.log(`🔍 [SEARCH] Returning cached result for: "${params.query}"`);
      performanceMonitor.recordCacheHit();
      return { data: cached, error: null };
    }
    performanceMonitor.recordCacheMiss();
  }

  // Prepare request parameters
  const queryString = buildQueryString({
    sort: DEFAULT_SORT,
    limit: DEFAULT_LIMIT,
    ...params,
  });

  const url = `${SEARCH_ENDPOINT}${queryString ? `?${queryString}` : ""}`;
  console.log(`🔍 [SEARCH] URL: ${url}`);

  const headers: Record<string, string> = {
    accept: "application/json",
  };

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (anonKey) {
    headers.Authorization = `Bearer ${anonKey}`;
    headers.apikey = anonKey;
  }

  // Execute request with circuit breaker
  try {
    return await circuitBreaker.execute(
      async () => {
        const fetchStartTime = performance.now();
        console.log(`🔍 [SEARCH] Starting fetch request at ${new Date().toISOString()}`);
        console.log(`🔍 [SEARCH] Request headers:`, headers);
        
        const response = await fetchWithRetry(url, {
          method: "GET",
          headers,
          signal: init?.signal,
          timeout: init?.timeout ?? REQUEST_TIMEOUT_MS,
          retries: init?.retries ?? MAX_RETRIES,
          next: { revalidate: 0 },
        });

    const fetchEndTime = performance.now();
    const fetchDuration = fetchEndTime - fetchStartTime;
    console.log(`🔍 [SEARCH] Fetch completed in ${fetchDuration.toFixed(2)}ms (${(fetchDuration/1000).toFixed(2)}s)`);
    console.log(`🔍 [SEARCH] Response status: ${response.status} ${response.statusText}`);
    console.log(`🔍 [SEARCH] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let message = `Search request failed with status ${response.status}`;

      if (response.status === 401) {
        message =
          "Search request was unauthorized. Check that your Supabase anon key is configured and the edge function allows public access.";
      }

      const totalTime = performance.now() - startTime;
      console.log(`🔍 [SEARCH] Request failed after ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s)`);
      throw new Error(message);
    }

    const parseStartTime = performance.now();
    console.log(`🔍 [SEARCH] Starting JSON parsing at ${new Date().toISOString()}`);
    
    const payload = (await response.json()) as ProductSearchResponse;
    
    const parseEndTime = performance.now();
    const parseDuration = parseEndTime - parseStartTime;
    console.log(`🔍 [SEARCH] JSON parsing completed in ${parseDuration.toFixed(2)}ms`);
    
    // Cache the successful response
    if (params.query && !params.cursor) {
      searchCache.set(params.query, payload, params.domain);
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`🔍 [SEARCH] Total search time: ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s)`);
    console.log(`🔍 [SEARCH] Results: ${payload.items.length} items, total: ${payload.total}`);
    
    performanceMonitor.recordMetric('search_duration', totalTime, {
      query_length: params.query?.length.toString() || '0',
      results_count: payload.items.length.toString(),
      total_results: payload.total.toString(),
      cached: 'false'
    });
    
    return { data: payload, error: null };
    },
    async () => {
      // Fallback function - return cached results if available
      if (params.query) {
        const cached = searchCache.get(params.query, params.domain);
        if (cached) {
          console.log(`🔍 [SEARCH] Circuit open, using cached results for: "${params.query}"`);
          return { data: cached, error: null };
        }
      }
      
      // No cache available, return empty results
      return {
        data: {
          items: [],
          total: 0,
          hasMore: false,
          nextCursor: null,
          sort: params.sort || DEFAULT_SORT
        },
        error: {
          message: "Search service is temporarily unavailable",
          status: 503
        }
      };
    }
  );
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.log(`🔍 [SEARCH] Error after ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s):`, error);
    
    if (error instanceof DOMException && error.name === "AbortError") {
      return { data: null, error: { message: "Request aborted", aborted: true } };
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: { message } };
  }
}
