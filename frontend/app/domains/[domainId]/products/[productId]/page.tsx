"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { StateCard } from "@/components/feedback/StateCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { getProduct, getSimilarProducts } from "@/supabase/product";
import ProductCard from "@/components/ProductCard";
import { Product, ProductImage, ProductVariant } from "@/types/Product";
import Pill from "@/components/ui/pill";

interface ProductPageProps {
  params: Promise<{
    productId: string;
    domainId: string;
  }>;
}

function formatPrice(price: string | null | undefined): string {
  const numericPrice = Number.parseFloat(String(price));

  if (!Number.isNaN(numericPrice) && Number.isFinite(numericPrice)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericPrice);
  }

  return "Price not available";
}

export default function ProductPage({ params }: ProductPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    productId: string;
    domainId: string;
  } | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<Product[] | null>(
    null
  );
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) {
      return;
    }

    const fetchProductData = async () => {
      try {
        const fetchedProduct = await getProduct(
          resolvedParams.domainId,
          resolvedParams.productId
        );

        setProduct(fetchedProduct);

        if (fetchedProduct?.variants?.length) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }

        // Fetch similar products
        if (fetchedProduct) {
          const { data: similar, error: similarError } =
            await getSimilarProducts({
              product_id: String(fetchedProduct.product_id), // Ensure product_id is a string
              domain: fetchedProduct.domain,
              k: 4,
            });

          console.log("Similar products response:", { similar, similarError });

          if (similarError) {
            console.error("Error fetching similar products:", similarError);
          } else if (similar) {
            console.log("Setting similar products:", similar);
            setSimilarProducts(similar);
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
        setLoadingSimilar(false);
      }
    };

    fetchProductData();
  }, [resolvedParams]);

  const variants = useMemo<ProductVariant[]>(() => {
    if (product?.variants?.length) {
      return product.variants;
    }
    if (product?.raw_json?.variants?.length) {
      return product.raw_json.variants as ProductVariant[];
    }
    return [];
  }, [product]);

  const productImages = useMemo<ProductImage[]>(() => {
    if (product?.images?.length) {
      return product.images;
    }
    if (product?.raw_json?.images?.length) {
      return (
        product.raw_json.images as Array<{
          src: string;
          position: number;
          id: number;
          alt?: string;
        }>
      ).map((image) => ({
        domain: product?.domain ?? "",
        product_id: product?.product_id ?? 0,
        image_id: image.id,
        src: image.src,
        position: image.position,
        alt: image.alt ?? `${product?.title} image ${image.position}`,
      }));
    }
    return [];
  }, [product]);

  const currentVariant = selectedVariant || variants[0] || null;

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const descriptionHtml = (product?.raw_json?.body_html ||
    product?.body_html) as string | undefined;

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <StateCard
          icon={<Loader2 className="h-10 w-10 animate-spin" />}
          title="Loading product"
          description="Gathering details directly from the store."
        />
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer className="flex items-center justify-center">
        <StateCard
          tone="danger"
          icon={<AlertCircle className="h-10 w-10" />}
          title="Product not found"
          description="We couldn’t locate this listing. Double-check the URL or explore the store for similar items."
        />
      </PageContainer>
    );
  }

  const priceLabel = formatPrice(
    currentVariant?.price ?? product.variants?.[0]?.price ?? null
  );

  return (
    <PageContainer className="pb-20 md:pb-0">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="w-full overflow-hidden">
          <ProductGallery
            images={productImages}
            currentIndex={currentImageIndex}
            onSelect={handleImageSelect}
            title={product.title}
          />
        </div>

        <div className="min-w-[220px]">
          <p className="text-md text-[var(--secondary)]">
            {`by ${product.vendor || "Unknown vendor"}`}
          </p>
          <h1 className="text-3xl font-semibold text-[var(--primary)]">
            {product.title}
          </h1>

          <div className="mt-3 text-3xl font-semibold text-foreground mb-3">
            {priceLabel}
          </div>

          <ProductVariantSelector
            variants={variants}
            selectedId={currentVariant?.id}
            onSelect={handleVariantSelect}
          />

          <div className="hidden md:flex flex-col gap-8 my-8">
            <Pill
              text="View product on store"
              onClick={() => {
                window.open(
                  `https://${product.domain}/products/${product.handle}`,
                  "_blank"
                );
              }}
            />
          </div>
        </div>

        <section className="space-y-4">
          <p className="text-sm text-[var(--secondary)]">ProductDescription</p>
          {descriptionHtml && (
            <div
              className="rich-text max-h-96 overflow-y-auto pr-2"
              style={{
                // fallback if the Tailwind classes aren't enough
                wordBreak: 'break-word',
                overscrollBehavior: 'contain'
              }}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}
        </section>
      </div>

      {/* <ProductMetaBar updatedAt={product.updated_at} domain={product.domain} /> */}

      {/* Similar Products Section */}
      {(loadingSimilar ||
        (Array.isArray(similarProducts) && similarProducts.length > 0)) && (
        <section className="px-6 py-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              Similar Products
            </h2>
          </div>

          {loadingSimilar ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts?.map((similarProduct) => (
                <ProductCard
                  key={similarProduct.product_id}
                  id={String(similarProduct.product_id)}
                  title={similarProduct.title}
                  price={similarProduct.variants?.[0]?.price ?? "N/A"}
                  domain={similarProduct.domain}
                  image={similarProduct.images?.[0]?.src}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Mobile Fixed Button */}
      <div className="md:hidden">
        <Pill
          text="To the Store"
          fixed={true}
          onClick={() => {
            window.open(
              `https://${product.domain}/products/${product.handle}`,
              "_blank"
            );
          }}
        />
      </div>
    </PageContainer>
  );
}
