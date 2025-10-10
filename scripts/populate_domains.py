#!/usr/bin/env python3
"""
Populate domains table from existing products data.

This script backfills the domains table by:
1. Reading domains from domains.txt up to and including 'thesoapopera.com'
2. Calculating statistics for each domain (product count, vendors, price ranges)
3. Upserting domain records with the calculated data
4. Optionally triggering metadata scraping for each domain

Note: Only processes domains up to 'thesoapopera.com' as that's where product scraping stopped.
"""

import os
from typing import Dict, Any, List
from datetime import datetime, UTC
from dotenv import load_dotenv

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

load_dotenv()

with open('domains.txt', 'r') as f:
    domains = []
    for line in f:
        domain = line.strip()
        if domain:  # Skip empty lines
            domains.append(domain)
        if domain == 'thesoapopera.com':
            break  # Stop processing after thesoapopera.com


class DomainPopulator:
    """Populates domains table from existing products data."""
    
    def __init__(self):
        self.supabase_client = None
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_API_KEY")
        
        if supabase_url and supabase_key and create_client:
            try:
                self.supabase_client = create_client(supabase_url, supabase_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Supabase client: {e}")
        else:
            print("Warning: SUPABASE_URL/SUPABASE_API_KEY not set or supabase library unavailable.")
    
    def is_enabled(self) -> bool:
        return self.supabase_client is not None
    
    def get_distinct_domains(self) -> List[str]:
        """Get list of distinct domains from domains.txt file up to thesoapopera.com."""
        try:
            # Use the domains from domains.txt file that was loaded at module level
            distinct_domains = list(set(domains))
            print(f"Found {len(distinct_domains)} distinct domains in domains.txt (up to thesoapopera.com)")
            return distinct_domains
        except Exception as e:
            print(f"Error processing domains from domains.txt: {e}")
            return []
    
    def calculate_domain_statistics(self, domain: str) -> Dict[str, Any]:
        """Calculate statistics for a specific domain."""
        if not self.is_enabled():
            return {}
        
        try:
            # Get all products for this domain
            result = self.supabase_client.table('products').select('*').eq('domain', domain).execute()
            products = result.data
            
            if not products:
                # Domain exists in domains.txt but no products scraped yet
                return {
                    'domain': domain,
                    'product_count': 0,
                    'vendor_count': 0,
                    'product_types': None,
                    'price_range_min': None,
                    'price_range_max': None,
                }
            
            # Calculate statistics
            vendors = set()
            product_types = set()
            prices = []
            
            for product in products:
                # Collect vendors
                vendor = product.get('vendor')
                if vendor:
                    vendors.add(vendor)
                
                # Collect product types
                product_type = product.get('product_type')
                if product_type:
                    product_types.add(product_type)
                
                # Get prices from raw_json variants
                raw_json = product.get('raw_json', {})
                variants = raw_json.get('variants', [])
                
                for variant in variants:
                    price_str = variant.get('price')
                    if price_str:
                        try:
                            price = float(price_str)
                            prices.append(price)
                        except (ValueError, TypeError):
                            pass
            
            # Calculate price range
            price_range_min = min(prices) if prices else None
            price_range_max = max(prices) if prices else None
            
            return {
                'domain': domain,
                'product_count': len(products),
                'vendor_count': len(vendors),
                'product_types': list(product_types) if product_types else None,
                'price_range_min': price_range_min,
                'price_range_max': price_range_max,
            }
            
        except Exception as e:
            print(f"Error calculating statistics for {domain}: {e}")
            return {
                'domain': domain,
                'product_count': 0,
                'vendor_count': 0,
                'product_types': None,
                'price_range_min': None,
                'price_range_max': None,
            }
    
    def upsert_domain_record(self, domain_stats: Dict[str, Any]) -> bool:
        """Upsert domain record to database."""
        if not self.is_enabled():
            return False
        
        try:
            # Prepare data for database
            domain_data = {
                **domain_stats,
                'created_at': datetime.now(UTC).isoformat(),
                'updated_at': datetime.now(UTC).isoformat(),
                'scraping_status': 'active' if domain_stats['product_count'] > 0 else 'pending',
                'fetch_attempt_count': 0,
                'successful_fetch_count': 1 if domain_stats['product_count'] > 0 else 0,
            }
            
            # Upsert to database
            result = self.supabase_client.table('domains').upsert(
                domain_data, 
                on_conflict='domain'
            ).execute()
            
            status = "with products" if domain_stats['product_count'] > 0 else "pending scraping"
            print(f"Upserted domain record for {domain_stats['domain']}: {domain_stats['product_count']} products ({status})")
            return True
            
        except Exception as e:
            print(f"Error upserting domain record for {domain_stats['domain']}: {e}")
            return False
    
    def populate_domains(self, scrape_metadata: bool = False) -> None:
        """Main method to populate domains table with domains up to thesoapopera.com."""
        if not self.is_enabled():
            print("Supabase client not available, cannot populate domains")
            return
        
        print("Starting domain population process (up to thesoapopera.com)...")
        
        # Get distinct domains
        domains = self.get_distinct_domains()
        if not domains:
            print("No domains found to populate")
            return
        
        successful = 0
        failed = 0
        
        for domain in domains:
            try:
                print(f"Processing domain: {domain}")
                
                # Calculate statistics
                domain_stats = self.calculate_domain_statistics(domain)
                
                # Upsert domain record
                if self.upsert_domain_record(domain_stats):
                    successful += 1
                    
                    # Optionally trigger metadata scraping
                    if scrape_metadata:
                        print(f"Triggering metadata scraping for {domain}...")
                        # Note: This would require importing and calling the metadata scraper
                        # For now, we'll just log that it should be done
                        print(f"TODO: Run metadata scraper for {domain}")
                else:
                    failed += 1
                    
            except Exception as e:
                print(f"Error processing domain {domain}: {e}")
                failed += 1
        
        print("\nDomain population complete:")
        print(f"  Successful: {successful}")
        print(f"  Failed: {failed}")
        print(f"  Total: {len(domains)}")


def main():
    """Main entry point."""
    import sys
    
    # Parse command line arguments
    scrape_metadata = '--scrape-metadata' in sys.argv
    
    populator = DomainPopulator()
    populator.populate_domains(scrape_metadata=scrape_metadata)


if __name__ == "__main__":
    main()
