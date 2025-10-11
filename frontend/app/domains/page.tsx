import { AlertCircle, Store } from "lucide-react";
import Link from "next/link";

import { DomainCard } from "@/components/DomainCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaginationControls } from "@/components/navigation/PaginationControls";
import { StateCard } from "@/components/feedback/StateCard";
import { Button } from "@/components/ui/button";
import { getDomains, DOMAINS_PER_PAGE } from "@/supabase/domain";

interface DomainsPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function DomainsPage({ searchParams }: DomainsPageProps) {
  const currentPage = Number(searchParams.page) || 1;

  const { data, error, total, hasMore } = await getDomains(currentPage);

  if (error) {
    return (
      <PageContainer className="flex items-center justify-center">
        <StateCard
          tone="danger"
          icon={<AlertCircle className="h-10 w-10" />}
          title="Unable to load stores"
          description="Something went wrong while fetching the store directory. Please try again in a moment."
          action={
            <Button variant="outline" asChild>
              <Link href="/domains">Refresh page</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <PageContainer className="flex items-center justify-center">
        <StateCard
          icon={<Store className="h-10 w-10" />}
          title="No stores found"
          description="We couldn't locate any Shopify stores in our directory yet. Check back soon as new stores are added."
        />
      </PageContainer>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / DOMAINS_PER_PAGE));

  return (
    <PageContainer className="space-y-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-3xl font-semibold text-secondary">
          Browse all stores
        </span>
        <span className="inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-soft)] shadow-sm">
          Page {currentPage} / {totalPages}
        </span>
      </div>

      <section className="py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-secondary">
              Featured stores
            </p>
            <p className="text-sm text-[var(--color-foreground-soft)]">
              Explore our curated selection of Shopify stores — sorted by
              product count.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-foreground-soft)]">
            {data.length} stores on this page
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((domain) => (
            <DomainCard key={domain.domain} domain={domain} />
          ))}
        </div>
      </section>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasMore}
        makeHref={(page) => `/domains?page=${page}`}
      />
    </PageContainer>
  );
}
