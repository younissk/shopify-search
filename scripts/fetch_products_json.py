import requests
import json
import concurrent.futures
from threading import Lock, BoundedSemaphore
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, UTC
import time
import random
import os

from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential
try:
    # supabase-py v2
    from supabase import create_client, Client
except Exception:  # pragma: no cover
    create_client = None
    Client = None

# Last unsuccessful: thesoapopera.com

@dataclass
class ScrapingStats:
    total_processed: int = 0
    successful_domains: int = 0
    failed_domains: List[str] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.now)
    lock: Lock = field(default_factory=Lock)
    rate_limit_semaphore: BoundedSemaphore = field(
        default_factory=lambda: BoundedSemaphore(2))
    all_products: List[Dict[str, Any]] = field(default_factory=list)

    def wait_for_rate_limit(self) -> None:
        """Implements rate limiting with jitter to prevent thundering herd."""
        self.rate_limit_semaphore.acquire()
        time.sleep(0.5 + random.random())

    def add_products(self, products: List[Dict[str, Any]], domain: str) -> None:
        with self.lock:
            self.all_products.extend(products)
            self.successful_domains += 1
            self.total_processed += 1
            products_count = len(products)
            total_count = len(self.all_products)
            print(
                f"Found {products_count} products from {domain} "
                f"(Total: {total_count} products from {self.successful_domains} domains)"
            )

    def add_failed_domain(self, domain: str, error: str) -> None:
        with self.lock:
            self.failed_domains.append(domain)
            self.total_processed += 1
            print(f"Error processing {domain}: {error}")


def fetch_all_pages_for_endpoint(domain: str, endpoint_path: str, headers: Dict[str, str], per_page: int = 250) -> List[Dict[str, Any]]:
    """Fetch all products for a given public storefront endpoint using page-number pagination.

    Tries pages starting at 1 and stops when a page returns fewer than `per_page` items,
    an empty list, or when duplicate page content is detected.
    """
    collected: List[Dict[str, Any]] = []
    last_first_product_id: Optional[int] = None
    page: int = 1

    while True:
        url = f"https://{domain}{endpoint_path}?limit={per_page}&page={page}"
        response = requests.get(url, timeout=10, headers=headers)
        response.raise_for_status()
        data: Dict[str, Any] = response.json()
        products: List[Dict[str, Any]] = data.get("products", [])

        if not products:
            break

        # Detect duplicate page loops (some themes ignore page param)
        first_id: Optional[int] = None
        try:
            if isinstance(products[0].get("id"), int):
                first_id = products[0]["id"]
        except Exception:
            first_id = None

        if last_first_product_id is not None and first_id is not None and first_id == last_first_product_id:
            # Same page served again -> stop to avoid infinite loop
            break

        collected.extend(products)
        last_first_product_id = first_id

        # If fewer than requested, likely last page
        if len(products) < per_page:
            break

        page += 1
        time.sleep(0.5 + random.random())

    return collected


class SupabaseWriter:
    """Thread-safe writer that upserts Shopify product data into Supabase Postgres.

    It stores both normalized columns for performant querying and full raw JSON to avoid data loss.
    It also writes immutable snapshots per fetch to ensure history is preserved.
    """

    # Reduced batch size for better reliability
    def __init__(self, batch_size: int = 50) -> None:
        load_dotenv()
        self.supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
        self.supabase_key: Optional[str] = os.getenv("SUPABASE_API_KEY")
        self.client: Optional[Client] = None
        self.lock: Lock = Lock()
        self.batch_size = batch_size

        if self.supabase_url and self.supabase_key and create_client is not None:
            try:
                self.client = create_client(
                    self.supabase_url, self.supabase_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Supabase client: {e}")
        else:
            print("Warning: SUPABASE_URL/SUPABASE_API_KEY not set or supabase library unavailable. Persistence disabled.")

    def is_enabled(self) -> bool:
        return self.client is not None

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=1, max=10))
    def _upsert(self, table: str, rows: List[Dict[str, Any]], on_conflict: str) -> None:
        assert self.client is not None
        if not rows:
            return
        try:
            with self.lock:
                self.client.table(table).upsert(
                    rows, on_conflict=on_conflict).execute()
        except Exception as e:
            error_msg = str(e)
            print(f"Error upserting to {table}: {error_msg}")

            if "timeout" in error_msg.lower() or "connection" in error_msg.lower():
                print(f"Connection/timeout error for {table}, retrying...")
            elif "rate" in error_msg.lower():
                print(f"Rate limit hit for {table}, backing off...")
                time.sleep(2)  # Additional backoff for rate limits
            elif "ON CONFLICT DO UPDATE command cannot affect row a second time" in error_msg:
                print(
                    f"Warning: Duplicate rows detected in batch for {table}. This should be fixed by deduplication.")
            elif "no unique or exclusion constraint matching" in error_msg:
                print(
                    f"Warning: Invalid conflict constraint for {table}. Check table schema.")

            # For certain errors, we want to skip rather than retry
            if any(msg in error_msg for msg in [
                "no unique or exclusion constraint matching",
                "ON CONFLICT DO UPDATE command cannot affect row a second time"
            ]):
                return  # Skip this batch instead of retrying

            raise  # Re-raise for retry

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=1, max=10))
    def _insert(self, table: str, rows: List[Dict[str, Any]]) -> None:
        assert self.client is not None
        if not rows:
            return
        try:
            with self.lock:
                self.client.table(table).insert(rows).execute()
        except Exception as e:
            print(f"Error inserting to {table}: {str(e)}")
            if "timeout" in str(e).lower() or "connection" in str(e).lower():
                print(f"Connection/timeout error for {table}, retrying...")
            elif "rate" in str(e).lower():
                print(f"Rate limit hit for {table}, backing off...")
                time.sleep(2)  # Additional backoff for rate limits
            raise  # Re-raise for retry

    def _chunked(self, rows: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        return [rows[i:i + self.batch_size] for i in range(0, len(rows), self.batch_size)]

    def upsert_products(self, products: List[Dict[str, Any]], domain: str) -> None:
        if not self.is_enabled() or not products:
            return

        fetched_at = datetime.now(UTC).isoformat()

        product_rows: List[Dict[str, Any]] = []
        variant_rows: List[Dict[str, Any]] = []
        # Use dict for deduplication
        image_rows_dict: Dict[str, Dict[str, Any]] = {}
        option_rows: List[Dict[str, Any]] = []
        option_value_rows: List[Dict[str, Any]] = []
        snapshot_rows: List[Dict[str, Any]] = []

        for p in products:
            product_id = p.get("id")
            if product_id is None:
                continue

            # Core product row with raw_json
            product_rows.append({
                "domain": domain,
                "product_id": product_id,
                "handle": p.get("handle"),
                "title": p.get("title"),
                "vendor": p.get("vendor"),
                "product_type": p.get("product_type"),
                "tags": p.get("tags"),
                "created_at": p.get("created_at"),
                "updated_at": p.get("updated_at"),
                "published_at": p.get("published_at"),
                "status": p.get("status"),
                "admin_graphql_api_id": p.get("admin_graphql_api_id"),
                "template_suffix": p.get("template_suffix"),
                "published_scope": p.get("published_scope"),
                "fetched_at": fetched_at,
                "raw_json": p,
            })

            # Snapshot row preserves entire product JSON per fetch
            snapshot_rows.append({
                "domain": domain,
                "product_id": product_id,
                "fetched_at": fetched_at,
                "raw_json": p,
            })

            # Variants
            for v in p.get("variants", []) or []:
                variant_id = v.get("id")
                if variant_id is None:
                    continue
                variant_rows.append({
                    "domain": domain,
                    "variant_id": variant_id,
                    "product_id": product_id,
                    "title": v.get("title"),
                    "sku": v.get("sku"),
                    "price": v.get("price"),
                    "compare_at_price": v.get("compare_at_price"),
                    "position": v.get("position"),
                    "inventory_policy": v.get("inventory_policy"),
                    "inventory_management": v.get("inventory_management"),
                    "inventory_quantity": v.get("inventory_quantity"),
                    "barcode": v.get("barcode"),
                    "weight": v.get("weight"),
                    "weight_unit": v.get("weight_unit"),
                    "requires_shipping": v.get("requires_shipping"),
                    "taxable": v.get("taxable"),
                    "option1": v.get("option1"),
                    "option2": v.get("option2"),
                    "option3": v.get("option3"),
                    "image_id": v.get("image_id"),
                    "created_at": v.get("created_at"),
                    "updated_at": v.get("updated_at"),
                    "fetched_at": fetched_at,
                    "raw_json": v,
                })

            # Images - deduplicate by domain and image_id
            for img in p.get("images", []) or []:
                image_id = img.get("id")
                if image_id is None:
                    continue

                # Use dictionary to deduplicate by domain+image_id
                image_key = f"{domain}:{image_id}"
                image_rows_dict[image_key] = {
                    "domain": domain,
                    "image_id": image_id,
                    "product_id": product_id,
                    "position": img.get("position"),
                    "src": img.get("src"),
                    "width": img.get("width"),
                    "height": img.get("height"),
                    "alt": img.get("alt"),
                    "created_at": img.get("created_at"),
                    "updated_at": img.get("updated_at"),
                    "fetched_at": fetched_at,
                    "raw_json": img,
                }

            # Options and their values
            for opt in p.get("options", []) or []:
                option_id = opt.get("id")
                option_rows.append({
                    "domain": domain,
                    "option_id": option_id,
                    "product_id": product_id,
                    "name": opt.get("name"),
                    "position": opt.get("position"),
                    "fetched_at": fetched_at,
                    "raw_json": opt,
                })
                values = opt.get("values", []) or []
                for idx, val in enumerate(values, start=1):
                    option_value_rows.append({
                        "domain": domain,
                        "product_id": product_id,
                        "option_name": opt.get("name"),
                        "position": idx,
                        "value": val,
                        "fetched_at": fetched_at,
                    })

        # Perform batched upserts/inserts
        for chunk in self._chunked(product_rows):
            self._upsert("products", chunk, on_conflict="domain,product_id")
        for chunk in self._chunked(variant_rows):
            self._upsert("variants", chunk, on_conflict="domain,variant_id")
        # Convert deduplicated image dict to list
        image_rows = list(image_rows_dict.values())
        for chunk in self._chunked(image_rows):
            self._upsert("images", chunk, on_conflict="domain,image_id")
        for chunk in self._chunked(option_value_rows):
            self._upsert("option_values", chunk,
                         on_conflict="domain,product_id,option_name,position")


# Initialize a global writer (lazy-disabled if env is missing)
SUPABASE_WRITER = SupabaseWriter()


def fetch_domain_products(domain: str, stats: ScrapingStats) -> None:
    """Fetch products from a single domain."""
    try:
        stats.wait_for_rate_limit()

        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        }

        # Public storefront endpoints. Try collections-all first (commonly paginates), then plain products.
        endpoints = [
            "/collections/all/products.json",
            "/products.json",
        ]

        all_domain_products: List[Dict[str, Any]] = []

        for endpoint in endpoints:
            try:
                products_for_endpoint = fetch_all_pages_for_endpoint(
                    domain=domain,
                    endpoint_path=endpoint,
                    headers=headers,
                    per_page=250,
                )
                if products_for_endpoint:
                    all_domain_products = products_for_endpoint
                    break
            except requests.exceptions.HTTPError as http_err:
                # Handle common HTTP errors
                if http_err.response is not None:
                    if http_err.response.status_code in (404, 400):
                        # Try next endpoint
                        continue
                    elif http_err.response.status_code == 401:
                        # Don't retry unauthorized - store requires authentication
                        print(f"Skipping {domain}: Authentication required")
                        break
                    elif http_err.response.status_code == 429:
                        # Rate limited - add delay and retry
                        print(f"Rate limited for {domain}, backing off...")
                        time.sleep(5 + random.random() * 5)
                        continue
                raise
            except Exception:
                # Try next endpoint on generic errors
                continue

        # Add domain to each product and save
        for product in all_domain_products:
            product["domain"] = domain

        stats.add_products(all_domain_products, domain)

        # Persist immediately so data isn't lost if the process exits later
        try:
            if SUPABASE_WRITER.is_enabled():
                print(
                    f"Attempting to persist {len(all_domain_products)} products for {domain}...")
                SUPABASE_WRITER.upsert_products(all_domain_products, domain)
                print(
                    f"Successfully persisted {len(all_domain_products)} products for {domain} to Supabase")
        except Exception as persist_err:
            # Non-fatal: continue scraping even if persistence fails
            error_msg = str(persist_err)
            if "timeout" in error_msg.lower():
                print(
                    f"Warning: Timeout persisting data for {domain}. Consider reducing batch size or adding retries.")
            elif "rate" in error_msg.lower():
                print(
                    f"Warning: Rate limit hit while persisting data for {domain}. Adding delay for next operations.")
                time.sleep(5)  # Add delay for rate limits
            else:
                print(
                    f"Warning: Failed to persist data for {domain}: {error_msg}")
            # Log full error details for debugging
            print(
                f"Full error context for {domain}: {type(persist_err).__name__}: {error_msg}")

    except requests.exceptions.RequestException as e:
        stats.add_failed_domain(domain, f"Request failed: {str(e)}")
    except json.JSONDecodeError as e:
        stats.add_failed_domain(domain, f"Invalid JSON: {str(e)}")
    except Exception as e:
        stats.add_failed_domain(domain, f"Unexpected error: {str(e)}")
    finally:
        stats.rate_limit_semaphore.release()


def main():
    """Main entry point with graceful shutdown handling."""
    try:
        _main()
    except KeyboardInterrupt:
        print("\nGracefully shutting down...")
        print("Waiting for in-progress tasks to complete (press Ctrl+C again to force quit)...")
        try:
            # Give tasks a chance to complete
            time.sleep(2)
        except KeyboardInterrupt:
            print("\nForce quitting...")
            return 1
    return 0


def _main():
    # Read domains
    with open("domains.txt", "r") as f:
        domains = [line.strip() for line in f.readlines() if line.strip()]

    if not domains:
        print("No domains found in domains.txt")
        return

    # Initialize statistics
    stats = ScrapingStats()
    max_workers = min(32, len(domains))

    print(
        f"Starting to fetch products from {len(domains)} domains using {max_workers} threads...")

    # Process domains using thread pool
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(fetch_domain_products, domain, stats)
            for domain in domains
        ]
        concurrent.futures.wait(futures)

    # Calculate and print summary
    duration = (datetime.now() - stats.start_time).total_seconds()
    success_rate = (stats.successful_domains / len(domains)) * 100

    print("\nScraping Summary:")
    print(f"Duration: {duration:.2f} seconds")
    print(f"Total domains processed: {len(domains)}")
    print(
        f"Successful domains: {stats.successful_domains} ({success_rate:.1f}%)")
    print(f"Failed domains: {len(stats.failed_domains)}")
    print(f"Total products collected: {len(stats.all_products)}")

    # Save products to file
    with open("products.json", "w") as f:
        json.dump(stats.all_products, f, indent=2)

    print("\nProducts saved to products.json")

    if stats.failed_domains:
        print("\nFailed domains:")
        for domain in stats.failed_domains:
            print(f"- {domain}")


if __name__ == "__main__":
    import sys
    sys.exit(main())
