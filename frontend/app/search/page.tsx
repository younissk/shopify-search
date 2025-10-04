import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";

export default function Search() {
  return (
    <div>
      <SearchBar />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
        data-testid="product-card-grid"
      >
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard /> 
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  );
}
