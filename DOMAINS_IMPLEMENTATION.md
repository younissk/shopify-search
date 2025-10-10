# Domains Table Implementation

This implementation adds a comprehensive `domains` table to track Shopify store metadata, statistics, and scraping status.

## Database Schema

The `domains` table includes:

### Core Fields

- `domain` (TEXT, PRIMARY KEY) - Domain name (e.g., "example.myshopify.com")
- `display_name` (TEXT) - Human-readable shop name
- `description` (TEXT) - Shop description/tagline
- `created_at` (TIMESTAMPTZ) - When first discovered
- `updated_at` (TIMESTAMPTZ) - Last metadata update

### Product Statistics

- `product_count` (INTEGER) - Total products
- `vendor_count` (INTEGER) - Unique vendors
- `product_types` (TEXT[]) - Array of product categories/types
- `price_range_min` (NUMERIC) - Lowest product price
- `price_range_max` (NUMERIC) - Highest product price

### Scraping Metadata

- `last_fetched_at` (TIMESTAMPTZ) - Last successful product fetch
- `scraping_status` (TEXT) - 'active' | 'failed' | 'paused'
- `last_scrape_error` (TEXT) - Last error message if failed
- `fetch_attempt_count` (INTEGER) - Total fetch attempts
- `successful_fetch_count` (INTEGER) - Successful fetches

### Shopify Metadata (auto-scraped)

- `shop_email` (TEXT) - Contact email from homepage
- `shop_currency` (TEXT) - Store currency (e.g., "USD")
- `powered_by_badge` (BOOLEAN) - Shows "Powered by Shopify" badge
- `meta_description` (TEXT) - Meta description from homepage
- `social_links` (JSONB) - Social media URLs
- `raw_metadata` (JSONB) - Full scraped metadata for future use

## Setup Instructions

### 1. Create Database Schema

Run the SQL script in Supabase:

```bash
# Execute the SQL file in your Supabase SQL editor
cat sql/create_domains_table.sql
```

### 2. Backfill Existing Domains

Populate the domains table from existing products:

```bash
cd /Users/youniss/Documents/GitHub/shopify-search
python scripts/populate_domains.py
```

### 3. Scrape Domain Metadata (Optional)

Extract additional metadata from storefronts:

```bash
python scripts/scrape_domain_metadata.py
```

### 4. Update Product Scraper

The product scraper (`scripts/fetch_products_json.py`) has been updated to automatically:

- Calculate domain statistics when scraping products
- Update scraping status (active/failed)
- Track fetch attempts and success rates

## Frontend Features

### Domains Listing Page (`/domains`)

- **Statistics Dashboard**: Shows total stores, products, active stores, and success rate
- **Domain Cards**: Display store info, product count, vendors, price ranges, categories
- **Status Badges**: Visual indicators for active/failed/paused stores
- **Pagination**: Browse through all domains
- **Sorting**: Sort by product count, domain name, or last updated

### Domain Detail Page (`/domain/[domainId]`)

- **Rich Header**: Store name, description, status, statistics
- **Metadata Display**: Product categories, social media links, contact info
- **Statistics Cards**: Products, vendors, price range, last updated
- **Product Grid**: Browse products from the specific store

## API Functions

### Supabase Queries (`frontend/supabase/domain.ts`)

- `getAllDomains(page, sortBy, sortOrder, status)` - Paginated domain list with filtering
- `getDomainByName(domain)` - Single domain details
- `getDomainStats()` - Aggregate statistics
- `createDomain(input)` - Create new domain record
- `updateDomainStatus(domain, status, error)` - Update scraping status

### TypeScript Types (`frontend/types/Domain.ts`)

- `Domain` - Complete domain interface
- `DomainStats` - Aggregate statistics
- `DomainListResult` - Paginated results
- `CreateDomainInput` - Domain creation input

## Usage Examples

### Fetch All Active Domains

```typescript
const { data: domains } = await getAllDomains(1, 'product_count', 'desc', 'active');
```

### Get Domain Statistics

```typescript
const { data: stats } = await getDomainStats();
console.log(`Total stores: ${stats.total_domains}`);
console.log(`Total products: ${stats.total_products}`);
```

### Update Domain Status

```typescript
await updateDomainStatus('example.myshopify.com', 'failed', 'Connection timeout');
```

## Backend Scripts

### Domain Metadata Scraper (`scripts/scrape_domain_metadata.py`)

Extracts comprehensive metadata from Shopify storefronts:

- Shop name and description
- Contact information
- Social media links
- Currency detection
- Theme identification

### Population Script (`scripts/populate_domains.py`)

Backfills domains table from existing products:

- Calculates statistics for each domain
- Extracts unique vendors and product types
- Computes price ranges
- Optionally triggers metadata scraping

### Updated Product Scraper (`scripts/fetch_products_json.py`)

Enhanced to maintain domain records:

- Automatically updates domain statistics
- Tracks scraping success/failure
- Maintains fetch attempt counters
- Updates last fetched timestamps

## Benefits

1. **Performance**: Pre-computed statistics avoid expensive aggregations
2. **Monitoring**: Track scraping health and success rates
3. **Rich Metadata**: Auto-scraped store information enhances user experience
4. **Analytics**: Comprehensive domain-level insights
5. **Maintenance**: Easy identification of failed or problematic domains

## Next Steps

1. Run the database migration in Supabase
2. Execute the population script to backfill existing data
3. Optionally run metadata scraping for enhanced store information
4. The frontend will automatically display the new domain information
5. Future product scraping will automatically maintain domain records
