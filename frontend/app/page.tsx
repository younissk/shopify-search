import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { getTotalProductCount, getTotalDomainCount, formatCount } from "@/lib/counts";

// Note: This page requires the PostgreSQL counting functions to be installed.
// Run: sql/counting_functions.sql in your Supabase SQL editor

export default async function Home() {
  // Fetch counts in parallel for better performance
  const [productCountResult, domainCountResult] = await Promise.all([
    getTotalProductCount(),
    getTotalDomainCount(),
  ]);

  // Use fallback values if there are errors
  const productCount = productCountResult.error 
    ? "~0" 
    : formatCount(productCountResult.count, productCountResult.isApproximate);
  const domainCount = domainCountResult.error 
    ? "~0" 
    : formatCount(domainCountResult.count, domainCountResult.isApproximate);

  return (
    <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center gap-12 text-center">
      <div className="space-y-6">
        <span className="pill-badge">Unified Shopify catalogue</span>
        <h1 className="text-4xl font-semibold tracking-tight text-secondary sm:text-5xl">
          Search every product with a single query
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--color-foreground-soft)] sm:text-lg">
          Compare pricing, spot trends, and uncover new inventory from trusted Shopify stores in real time.
        </p>
      </div>
      
      {/* Dynamic counts display */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <div className="rounded-lg bg-[var(--color-background-soft)] px-6 py-4">
          <div className="text-2xl font-bold text-secondary">{productCount}</div>
          <div className="text-sm text-[var(--color-foreground-soft)]">Products</div>
        </div>
        <div className="rounded-lg bg-[var(--color-background-soft)] px-6 py-4">
          <div className="text-2xl font-bold text-secondary">{domainCount}</div>
          <div className="text-sm text-[var(--color-foreground-soft)]">Stores</div>
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        <p className="text-sm text-[var(--color-foreground-soft)]">
          Use the search bar above to find products, brands, or stores across the Shopify universe.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="min-w-[180px]">
          <Link href="/search">Start exploring</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="min-w-[180px] border-[rgba(15,23,42,0.12)]">
          <Link href="/domains">Browse all stores</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
