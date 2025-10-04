import ProductCard from "@/components/ProductCard";
import { PageHeader } from "@/components/layout/PageHeader";
import SearchBar from "@/components/SearchBar";

export default function Search() {
  return (
    <div className="space-y-12">
      <PageHeader
        tone="muted"
        eyebrow="Catalogue search"
        title="Search across every Shopify store"
        description="Use filters and keywords to narrow in on the exact products you need. Results update instantly as you refine your query."
      />

      <div className="rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-6 shadow-sm">
        <SearchBar className="w-full" />
      </div>

      <div
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        data-testid="product-card-grid"
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <ProductCard
            key={index}
            title={`Sample Product ${index + 1}`}
            price={(29.99 + index * 10).toFixed(2)}
            domain="example.com"
            id={`${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
