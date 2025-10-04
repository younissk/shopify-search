from bs4 import BeautifulSoup
import requests
import time
import random

FIRST_URL = "https://cro.media/all-shopify-stores/#store-list"
URL = "https://cro.media/all-shopify-stores/pages-{page}/#store-list"

TOTAL_PAGES = 110

def scrape_page(url):
    delay = random.uniform(1.0, 3.0)
    print(f"Waiting {delay:.1f}s before scraping {url}")
    time.sleep(delay)
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise exception for bad status codes
        
        soup = BeautifulSoup(response.text, "html.parser")
        table = soup.find("table", class_="default-table").find("tbody")
        
        domains = []
        
        rows = table.find_all("tr")
        for row in rows:
            domain = row.find("h4").text.strip()
            domains.append(domain.replace("Shopify Store: ", ""))
        
        return domains
    except requests.RequestException as e:
        print(f"Error scraping {url}: {e}")
        return []

def save_domains(domains):
    with open("domains.txt", "w") as f:
        for domain in domains:
            f.write(domain + "\n")

if __name__ == "__main__":
    
    domains = scrape_page(FIRST_URL)
    print(f"Scraped {len(domains)} domains from page 1")
    
    for page in range(2, TOTAL_PAGES + 1):
        url = URL.format(page=page)
        new_domains = scrape_page(url)
        domains.extend(new_domains)
        print(f"Scraped {len(new_domains)} domains from page {page} (Total: {len(domains)})")
        
    save_domains(domains)
    print(f"\nScraping complete! Saved {len(domains)} domains to domains.csv")