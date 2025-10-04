import ProductCard from "@/components/ProductCard";
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
    console.error(error);
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No products found</div>;
  }

  const productsWithValidIds = data.map((product) => ({
    ...product,
    id:
      product.product_id ||
      `${product.domain}-${product.title}-${Math.random()}`,
  }));

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1>{domainId}</h1>
        <p>
          Showing {data.length} of {total} products
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {productsWithValidIds.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            price={product.product_id}
            domain={domainId}
            image={product.images?.[0]?.src || ""}
            id={product.product_id.toString()}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "1rem",
          }}
        >
          {currentPage > 1 && (
            <a
              href={`/domain/${domainId}?page=${currentPage - 1}`}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                textDecoration: "none",
                color: "#007bff",
              }}
              data-testid="prev-page"
            >
              Previous
            </a>
          )}

          <span style={{ padding: "0.5rem 1rem" }}>
            Page {currentPage} of {totalPages}
          </span>

          {hasMore && (
            <a
              href={`/domain/${domainId}?page=${currentPage + 1}`}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                textDecoration: "none",
                color: "#007bff",
              }}
              data-testid="next-page"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
