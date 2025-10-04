

.PHONY: scrape, fetch_products_json

scrape:
	uv run python scripts/scrape_data.py

fetch_products_json:
	uv run python scripts/fetch_products_json.py