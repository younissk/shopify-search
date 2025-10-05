import ProductCard from "@/components/ProductCard";
import { StatsSummary } from "@/components/StatsSummary";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchPanel } from "@/components/search/SearchPanel";
import { getCatalogueStatistics } from "@/supabase/stats";

type SearchPageProps = {
  searchParams?: {
    query?: string;
  };
};

const DEMO_PRODUCTS = [
  {
    id: "1",
    title: "Minimalist Leather Notebook",
    price: "38.00",
    domain: "artisan-notebooks.shop",
  },
  {
    id: "2",
    title: "Handcrafted Ceramic Mug",
    price: "24.50",
    domain: "coastline-makers.com",
  },
  {
    id: "3",
    title: "Organic Cotton Throw Blanket",
    price: "89.00",
    domain: "slow-living-home.store",
  },
  {
    id: "4",
    title: "Modern Desk Lamp",
    price: "120.00",
    domain: "workspace-provisions.myshopify.com",
  },
  {
    id: "5",
    title: "Reusable Glass Water Bottle",
    price: "32.00",
    domain: "refill-republic.co",
  },
  {
    id: "6",
    title: "Sculptural Accent Chair",
    price: "340.00",
    domain: "design-loft-gallery.com",
  },
  {
    id: "7",
    title: "Artisan Roast Coffee Beans",
    price: "18.75",
    domain: "harbor-coffee-roasters.com",
  },
  {
    id: "8",
    title: "Bluetooth Shelf Speaker",
    price: "210.00",
    domain: "citysound-supplies.com",
  },
  {
    id: "9",
    title: "Ultra-Soft Linen Bedding Set",
    price: "270.00",
    domain: "the-longshopifystore-name-that-keeps-going-example.com",
  },
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const initialQuery = typeof searchParams?.query === "string" ? searchParams.query : "";
  const { data: stats } = await getCatalogueStatistics();

  const mockResultsLabel = initialQuery.trim()
    ? `Showing placeholder results for "${initialQuery}"`
    : "Showing sample products until search is connected.";

  return (
    <PageContainer className="space-y-10">
      <PageHeader
        tone="muted"
        eyebrow="Catalogue search"
        title="Search across every Shopify store"
        description="Use filters and keywords to narrow in on the exact products you need. Results will link directly once search is wired up."
      />

      <SearchPanel initialQuery={initialQuery} />

      <section className="space-y-4" aria-live="polite">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-secondary">Preview results</h2>
          <span className="text-sm text-[var(--color-foreground-soft)]">{mockResultsLabel}</span>
        </div>
        <div
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          data-testid="product-card-grid"
        >
          {DEMO_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              price={product.price}
              domain={product.domain}
              id={product.id}
            />
          ))}
        </div>
      </section>

      {stats ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-secondary">Catalogue snapshot</h2>
          <StatsSummary stats={stats} />
        </section>
      ) : null}
    </PageContainer>
  );
}
