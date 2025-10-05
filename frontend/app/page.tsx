import Link from "next/link";

import SearchBar from "@/components/SearchBar";
import { StatsSummary } from "@/components/StatsSummary";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { getCatalogueStatistics } from "@/supabase/stats";

export default async function Home() {
  const { data: stats } = await getCatalogueStatistics();

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
      <div className="w-full max-w-2xl space-y-4">
        <SearchBar className="w-full max-w-2xl" />
        <p className="text-sm text-[var(--color-foreground-soft)]">
          Tip: start with a product name or store URL for the fastest results.
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
      {stats ? <StatsSummary stats={stats} className="w-full" /> : null}
    </PageContainer>
  );
}
