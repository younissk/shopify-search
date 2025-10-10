#!/usr/bin/env python3
"""
Domain metadata scraper for Shopify stores.

This script scrapes metadata from Shopify storefronts including:
- Shop name and description
- Contact information
- Social media links
- Currency and theme information
- Meta tags and SEO data
"""

import os
import re
import time
import random
from typing import Dict, Any, Optional
from datetime import datetime, UTC

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

load_dotenv()


class DomainMetadataScraper:
    """Scrapes metadata from Shopify storefronts."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # Initialize Supabase client
        self.supabase_client = None
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_API_KEY")
        
        if supabase_url and supabase_key and create_client:
            try:
                self.supabase_client = create_client(supabase_url, supabase_key)
            except Exception as e:
                print(f"Warning: Failed to initialize Supabase client: {e}")
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a webpage."""
        try:
            # Add random delay to avoid rate limiting
            time.sleep(random.uniform(0.5, 2.0))
            
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            return soup
            
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def extract_shop_name(self, soup: BeautifulSoup, domain: str) -> Optional[str]:
        """Extract shop name from various sources."""
        # Try og:title first
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content'].strip()
        
        # Try page title
        title_tag = soup.find('title')
        if title_tag and title_tag.text:
            title = title_tag.text.strip()
            # Remove common suffixes
            for suffix in [' - Shopify', ' | Shopify', ' - Powered by Shopify']:
                title = title.replace(suffix, '')
            if title and title != domain:
                return title
        
        # Try h1 tags
        h1_tags = soup.find_all('h1')
        for h1 in h1_tags:
            text = h1.text.strip()
            if text and len(text) < 100:  # Reasonable shop name length
                return text
        
        return None
    
    def extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract shop description from meta tags."""
        # Try meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        
        # Try og:description
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            return og_desc['content'].strip()
        
        return None
    
    def extract_contact_email(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract contact email from the page."""
        # Look for mailto links
        mailto_links = soup.find_all('a', href=re.compile(r'^mailto:'))
        for link in mailto_links:
            email = link['href'].replace('mailto:', '').strip()
            if self.is_valid_email(email):
                return email
        
        # Look for email patterns in text
        text_content = soup.get_text()
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text_content)
        
        for email in emails:
            if self.is_valid_email(email):
                return email
        
        return None
    
    def is_valid_email(self, email: str) -> bool:
        """Validate email format."""
        pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
        return bool(re.match(pattern, email))
    
    def extract_social_links(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract social media links from the page."""
        social_links = {}
        
        # Common social media patterns
        social_patterns = {
            'twitter': [r'twitter\.com', r'x\.com'],
            'facebook': [r'facebook\.com', r'fb\.com'],
            'instagram': [r'instagram\.com'],
            'linkedin': [r'linkedin\.com'],
            'youtube': [r'youtube\.com', r'youtu\.be'],
            'tiktok': [r'tiktok\.com'],
            'pinterest': [r'pinterest\.com'],
        }
        
        # Find all links
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link['href']
            if not href:
                continue
            
            # Convert relative URLs to absolute
            if href.startswith('/'):
                href = f"https://{self.domain}{href}"
            
            # Check against social patterns
            for platform, patterns in social_patterns.items():
                if platform not in social_links:  # Only take first match
                    for pattern in patterns:
                        if re.search(pattern, href, re.IGNORECASE):
                            social_links[platform] = href
                            break
        
        return social_links
    
    def extract_currency(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract currency information from the page."""
        # Look for currency symbols or codes in text
        text_content = soup.get_text()
        
        # Common currency patterns
        currency_patterns = [
            r'\$(\d+)',  # USD
            r'€(\d+)',   # EUR
            r'£(\d+)',  # GBP
            r'¥(\d+)',  # JPY
            r'CAD',      # Canadian Dollar
            r'AUD',      # Australian Dollar
        ]
        
        for pattern in currency_patterns:
            if re.search(pattern, text_content):
                if '$' in pattern:
                    return 'USD'
                elif '€' in pattern:
                    return 'EUR'
                elif '£' in pattern:
                    return 'GBP'
                elif '¥' in pattern:
                    return 'JPY'
                elif 'CAD' in pattern:
                    return 'CAD'
                elif 'AUD' in pattern:
                    return 'AUD'
        
        return None
    
    def detect_shopify_theme(self, soup: BeautifulSoup) -> Optional[str]:
        """Detect Shopify theme information."""
        # Look for theme-related meta tags
        theme_meta = soup.find('meta', attrs={'name': 'generator'})
        if theme_meta and 'shopify' in theme_meta.get('content', '').lower():
            return 'Shopify'
        
        # Look for Shopify-specific classes or IDs
        shopify_elements = soup.find_all(attrs={'class': re.compile(r'shopify|theme')})
        if shopify_elements:
            return 'Shopify'
        
        return None
    
    def check_powered_by_badge(self, soup: BeautifulSoup) -> bool:
        """Check if the store shows 'Powered by Shopify' badge."""
        text_content = soup.get_text().lower()
        return 'powered by shopify' in text_content or 'shopify' in text_content
    
    def scrape_domain_metadata(self, domain: str) -> Dict[str, Any]:
        """Scrape comprehensive metadata for a domain."""
        print(f"Scraping metadata for {domain}...")
        
        metadata = {
            'domain': domain,
            'scraped_at': datetime.now(UTC).isoformat(),
        }
        
        # Fetch homepage
        homepage_url = f"https://{domain}/"
        soup = self.fetch_page(homepage_url)
        
        if not soup:
            metadata['error'] = 'Failed to fetch homepage'
            return metadata
        
        # Extract various metadata
        metadata['display_name'] = self.extract_shop_name(soup, domain)
        metadata['description'] = self.extract_description(soup)
        metadata['shop_email'] = self.extract_contact_email(soup)
        metadata['social_links'] = self.extract_social_links(soup)
        metadata['shop_currency'] = self.extract_currency(soup)
        metadata['powered_by_badge'] = self.check_powered_by_badge(soup)
        metadata['meta_description'] = self.extract_description(soup)
        
        # Store raw HTML for future analysis
        metadata['raw_html'] = str(soup)[:10000]  # Limit size
        
        return metadata
    
    def upsert_domain_metadata(self, domain: str, metadata: Dict[str, Any]) -> bool:
        """Upsert domain metadata to Supabase."""
        if not self.supabase_client:
            print("Supabase client not available, skipping database update")
            return False
        
        try:
            # Prepare data for database
            db_data = {
                'domain': domain,
                'display_name': metadata.get('display_name'),
                'description': metadata.get('description'),
                'shop_email': metadata.get('shop_email'),
                'shop_currency': metadata.get('shop_currency'),
                'powered_by_badge': metadata.get('powered_by_badge'),
                'meta_description': metadata.get('meta_description'),
                'social_links': metadata.get('social_links'),
                'raw_metadata': metadata,
                'updated_at': datetime.now(UTC).isoformat(),
            }
            
            # Upsert to database
            result = self.supabase_client.table('domains').upsert(
                db_data, 
                on_conflict='domain'
            ).execute()
            
            print(f"Successfully updated metadata for {domain}")
            return True
            
        except Exception as e:
            print(f"Error updating metadata for {domain}: {e}")
            return False


def main():
    """Main function to scrape metadata for domains."""
    scraper = DomainMetadataScraper()
    
    # Read domains from file or command line
    import sys
    if len(sys.argv) > 1:
        domains = sys.argv[1:]
    else:
        # Read from domains.txt
        try:
            with open('domains.txt', 'r') as f:
                domains = [line.strip() for line in f if line.strip()]
        except FileNotFoundError:
            print("No domains.txt file found and no domains provided as arguments")
            return
    
    print(f"Scraping metadata for {len(domains)} domains...")
    
    successful = 0
    failed = 0
    
    for domain in domains:
        try:
            metadata = scraper.scrape_domain_metadata(domain)
            success = scraper.upsert_domain_metadata(domain, metadata)
            
            if success:
                successful += 1
            else:
                failed += 1
                
        except Exception as e:
            print(f"Error processing {domain}: {e}")
            failed += 1
    
    print(f"\nScraping complete: {successful} successful, {failed} failed")


if __name__ == "__main__":
    main()
