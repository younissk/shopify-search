import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/navigation/PaginationControls";
import { StateCard } from "@/components/feedback/StateCard";
import { StatsSummary } from "@/components/StatsSummary";
import { shortenDomain } from "@/lib/utils";
import { getCatalogueStatistics, getUniqueProductDomains } from "@/supabase/stats";

const ITEMS_PER_PAGE = 36;

type DomainsPageProps = {
  searchParams?: {
    page?: string;
  };
};

const parsePageParam = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? "1", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

export default async function DomainsPage({ searchParams }: DomainsPageProps) {
  const currentPage = parsePageParam(searchParams?.page);
  const [domainsResponse, statsResponse] = await Promise.all([
    getUniqueProductDomains(),
    getCatalogueStatistics(),
  ]);
  const { data: domains, error } = domainsResponse;
  const { data: stats } = statsResponse;

  if (error) {
    return (
      <PageContainer className="flex items-center justify-center">
        <StateCard
          tone="danger"
          title="Unable to load domains"
          description="We couldn’t fetch the store directory. Please try again shortly."
        />
      </PageContainer>
    );
  }

  const allDomains = domains ?? [];
  const totalPages = Math.max(1, Math.ceil(allDomains.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const pageDomains = allDomains.slice(start, start + ITEMS_PER_PAGE);

  return (
    <PageContainer className="space-y-10">
      <PageHeader
        eyebrow="Store directory"
        title="All Shopify domains"
        description={`${allDomains.length.toLocaleString()} stores tracked across the catalogue.`}
        meta={
          <span className="rounded-full border border-[rgba(15,23,42,0.1)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-soft)]">
            {`Page ${safePage} of ${totalPages}`}
          </span>
        }
      />

      {stats ? <StatsSummary stats={stats} /> : null}

      {pageDomains.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <StateCard
            icon={null}
            title="No domains yet"
            description="We’ll populate this list as soon as products are indexed."
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pageDomains.map((domain) => {
            const displayDomain = shortenDomain(domain, 34);

            return (
              <Link
                key={domain}
                href={`/domain/${domain}`}
                className="flex items-center justify-between rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-4 py-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <span className="max-w-[80%] truncate text-sm font-semibold text-secondary" title={domain}>
                  {displayDomain}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">View</span>
              </Link>
            );
          })}
        </div>
      )}

      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        hasNextPage={safePage < totalPages}
        makeHref={(page) => `/domains?page=${page}`}
        className="border bg-white"
      />
    </PageContainer>
  );
}
