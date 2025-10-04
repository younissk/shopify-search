import { getProduct } from "@/supabase/product";
import Image from "next/image";

interface ProductPageProps {
  params: Promise<{
    productId: string;
    domainId: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await params as required by Next.js dynamic route API
  const { productId, domainId } = await params;

  const product = await getProduct(domainId, productId);

  console.log(product);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Image
        src={product.images?.[0].src || ""}
        alt={product.title}
        width={100}
        height={100}
      />
      <h1>{product.title}</h1>
    </div>
  );
}
