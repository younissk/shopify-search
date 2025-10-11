export interface Domain {
  domain: string;
  display_name?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number | null;
  vendor_count?: number | null;
  product_types?: string[] | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  last_fetched_at?: string | null;
  scraping_status?: 'active' | 'failed' | 'paused' | 'pending' | null;
  last_scrape_error?: string | null;
  fetch_attempt_count?: number | null;
  successful_fetch_count?: number | null;
  shop_email?: string | null;
  shop_currency?: string | null;
  powered_by_badge?: boolean | null;
  meta_description?: string | null;
  social_links?: Record<string, string> | null;
  raw_metadata?: Record<string, unknown> | null;
}

export interface DomainPaginationResult {
  data: Domain[] | null;
  error: string | null;
  total: number;
  hasMore: boolean;
}
