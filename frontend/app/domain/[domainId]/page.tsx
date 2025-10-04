import { AlertCircle, PackageSearch } from "lucide-react";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/navigation/PaginationControls";
import { StateCard } from "@/components/feedback/StateCard";
import { Button } from "@/components/ui/button";
import { getProductsByDomain, ITEMS_PER_PAGE } from "@/supabase/domain";

interface DomainPageProps {
  params: {
    domainId: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function DomainPage({
  params,
  searchParams,
}: DomainPageProps) {
  const { domainId } = params;
  const currentPage = Number(searchParams.page) || 1;

  const { data, error, total, hasMore } = await getProductsByDomain(
    domainId,
    currentPage
  );

  if (error) {
    return (
      <PageContainer className="flex items-center justify-center">
        <StateCard
          tone="danger"
          icon={<AlertCircle className="h-10 w-10" />}
          title="Unable to load products"
          description="Something went wrong while reaching the store catalogue. Please try again in a moment."
          action={
            <Button variant="outline" asChild>
              <Link href={`/domain/${domainId}`}>Refresh page</Link>
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
          icon={<PackageSearch className="h-10 w-10" />}
          title="No products found"
          description="We couldn’t locate any listings for this store just yet. Check back soon as new products are ingested."
        />
      </PageContainer>
    );
  }

  const normalizedProducts = data.map((product, index) => ({
    ...product,
    normalizedId: (product.product_id ?? `${product.domain}-${index}`).toString(),
  }));

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <PageContainer className="space-y-12">
      <PageHeader
        eyebrow="Store catalogue"
        title={<span className="text-balance">{domainId}</span>}
        description={`${total.toLocaleString()} products indexed — here are ${normalizedProducts.length} highlights.`}
        meta={
          <span className="inline-flex items-center rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-soft)] shadow-sm">
            Page {currentPage} / {totalPages}
          </span>
        }
        actions={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary/20 bg-white/80 text-xs font-semibold uppercase tracking-[0.18em] text-primary hover:bg-primary/10"
          >
            <a href={`https://${domainId}`} target="_blank" rel="noopener noreferrer">
              Visit store
            </a>
          </Button>
        }
      />

      <section className="glass-panel rounded-[var(--radius-xl)] border border-white/40 px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-secondary">
              Curated selection
            </p>
            <p className="text-sm text-[var(--color-foreground-soft)]">
              Fresh from {domainId} — explore featured inventory below.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-foreground-soft)]">
            {normalizedProducts.length} products today
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {normalizedProducts.map((product) => (
            <ProductCard
              key={product.normalizedId}
              title={product.title}
              price={product.raw_json?.variants?.[0]?.price ?? "N/A"}
              domain={domainId}
              image={product.images?.[0]?.src ?? undefined}
              id={product.normalizedId}
            />
          ))}
        </div>
      </section>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasMore}
        makeHref={(page) => `/domain/${domainId}?page=${page}`}
      />
    </PageContainer>
  );
}
