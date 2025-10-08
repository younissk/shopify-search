"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Search as SearchIcon } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { StateCard } from "@/components/feedback/StateCard";
import {
  searchProducts,
  type ProductSearchResponse,
} from "@/lib/productSearch";

interface SearchExperienceProps {
  initialQuery: string;
  initialResults: ProductSearchResponse | null;
  initialError?: string | null;
}

const DEBOUNCE_MS = 350;

export function SearchExperience({
  initialQuery,
  initialResults,
  initialError = null,
}: SearchExperienceProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProductSearchResponse | null>(
    initialResults
  );
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const lastSuccessfulQueryRef = useRef<string | null>(
    initialResults ? initialQuery.trim() : null
  );

  // Listen for URL changes from the app bar search
  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams, query]);

  useEffect(() => {
    setQuery(initialQuery);
    setResults(initialResults);
    setError(initialError);
    setDebouncedQuery(initialQuery);
    lastSuccessfulQueryRef.current = initialResults
      ? initialQuery.trim()
      : null;
  }, [initialError, initialQuery, initialResults]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      setLoading(false);
      setError(null);
      setResults(null);
      return;
    }

    if (lastSuccessfulQueryRef.current === trimmed) {
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await searchProducts(
        { query: trimmed, page: 1 },
        { signal: controller.signal }
      );

      if (controller.signal.aborted) {
        return;
      }

      if (fetchError?.aborted) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setResults(null);
        return;
      }

      setResults(data);
      lastSuccessfulQueryRef.current = trimmed;
    };

    fetchResults().finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const activeQuery = query.trim();
  const resultsQuery = debouncedQuery.trim();

  const resultSummary = useMemo(() => {
    if (!activeQuery) {
      return "Start searching to see live catalogue results.";
    }

    if (loading) {
      return `Searching for "${activeQuery}"...`;
    }

    if (error) {
      return `We hit a snag loading results for "${activeQuery}".`;
    }

    if (!results) {
      return `No results yet for "${activeQuery}".`;
    }

    const countLabel = results.total === 1 ? "result" : "results";
    return `Showing ${results.items.length} of ${results.total} ${countLabel} for "${activeQuery}".`;
  }, [activeQuery, error, loading, results]);

  const hasQuery = activeQuery.length > 0;
  const showResultsGrid = hasQuery && !!results?.items.length;
  const showEmptyState =
    resultsQuery.length > 0 &&
    results?.items.length === 0 &&
    !loading &&
    !error;

  return (
    <div className="space-y-6">
      <section className="space-y-4" aria-live="polite">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-secondary">
            Search results
          </h2>
          <span className="text-sm text-[var(--color-foreground-soft)]">
            {resultSummary}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-3 text-sm font-medium text-[var(--color-foreground-soft)]">
              Fetching products...
            </span>
          </div>
        ) : null}

        {error ? (
          <StateCard
            tone="danger"
            icon={<AlertCircle className="h-10 w-10" />}
            title="Unable to load results"
            description={
              <span>
                {error}
                <br />
                Try adjusting your keywords or retrying the search.
              </span>
            }
          />
        ) : null}

        {!loading && !error && !hasQuery ? (
          <div className="flex items-center justify-center h-full">
            <StateCard
              icon={<SearchIcon className="h-10 w-10" />}
              title="Search the Shopify universe"
              description="Enter a product name, brand, or store domain to explore live listings."
            />
          </div>
        ) : null}

        {showEmptyState ? (
          <StateCard
            icon={<SearchIcon className="h-10 w-10" />}
            title="No matches found"
            description="We couldn’t find products matching that query. Try different keywords or broaden your search."
          />
        ) : null}

        {showResultsGrid ? (
          <div
            className="grid grid-cols-2 gap-6 sm:grid-cols-2 xl:grid-cols-3"
            data-testid="product-card-grid"
          >
            {results?.items.map((product) => (
              <ProductCard
                key={`${product.domain}-${product.product_id}`}
                title={product.title}
                image={product.raw_json?.images?.[0]?.src ?? undefined}
                price={product.raw_json?.variants?.[0]?.price ?? "N/A"}
                domain={product.domain}
                id={String(product.product_id)}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
