import { ProductSearchResponse } from "./productSearch";

interface CacheEntry {
  response: ProductSearchResponse;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

class SearchCache {
  private cache: Map<string, CacheEntry>;
  private static instance: SearchCache;

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): SearchCache {
    if (!SearchCache.instance) {
      SearchCache.instance = new SearchCache();
    }
    return SearchCache.instance;
  }

  private getCacheKey(query: string, domain?: string): string {
    return `${query}:${domain || '*'}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_TTL;
  }

  private cleanup() {
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // If still over size limit, remove oldest entries
    if (this.cache.size > MAX_CACHE_SIZE) {
      const entriesToDelete = this.cache.size - MAX_CACHE_SIZE;
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < entriesToDelete; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  get(query: string, domain?: string): ProductSearchResponse | null {
    const key = this.getCacheKey(query, domain);
    const entry = this.cache.get(key);

    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }

    console.log(`🗄️ [CACHE] Cache hit for query: "${query}"`);
    return entry.response;
  }

  set(query: string, response: ProductSearchResponse, domain?: string): void {
    const key = this.getCacheKey(query, domain);
    
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });

    console.log(`🗄️ [CACHE] Cached response for query: "${query}"`);
    this.cleanup();
  }

  clear(): void {
    this.cache.clear();
    console.log(`🗄️ [CACHE] Cache cleared`);
  }

  prefetch(_query: string, _domain?: string): void {
    // TODO: Implement prefetching logic for partial queries
    // This would fetch results for common prefixes/variations
  }
}

export const searchCache = SearchCache.getInstance();
