

.PHONY: scrape, fetch_products_json populate_domains

scrape:
	uv run python scripts/scrape_data.py

fetch_products_json:
	uv run python scripts/fetch_products_json.py

populate_domains:
	uv run python scripts/populate_domains.py