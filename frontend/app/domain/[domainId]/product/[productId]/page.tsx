"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, ShoppingCart, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StateCard } from "@/components/feedback/StateCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import {
  ProductOptionsList,
  type ProductOptionsListProps,
} from "@/components/product/ProductOptionsList";
import { ProductMetaBar } from "@/components/product/ProductMetaBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProduct, getSimilarProducts } from "@/supabase/product";
import ProductCard from "@/components/ProductCard";
import { Product, ProductImage, ProductVariant } from "@/types/Product";

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
  const [similarProducts, setSimilarProducts] = useState<Product[] | null>(null);
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
          const { data: similar, error: similarError } = await getSimilarProducts({
            product_id: String(fetchedProduct.product_id), // Ensure product_id is a string
            domain: fetchedProduct.domain,
            k: 4
          });
          
          console.log('Similar products response:', { similar, similarError });
          
          if (similarError) {
            console.error('Error fetching similar products:', similarError);
          } else if (similar) {
            console.log('Setting similar products:', similar);
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
      return (product.raw_json.images as Array<{
        src: string;
        position: number;
        id: number;
        alt?: string;
      }>).map((image) => ({
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

  const options = useMemo(
    () => (product?.raw_json?.options as ProductOptionsListProps["options"] | undefined) ?? [],
    [product?.raw_json?.options]
  );

  const currentVariant = selectedVariant || variants[0] || null;

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const descriptionHtml = (product?.raw_json?.body_html || product?.body_html) as
    | string
    | undefined;

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
    <PageContainer className="space-y-12">
      <PageHeader
        eyebrow="Product spotlight"
        title={product.title}
        description={`by ${product.vendor || "Unknown vendor"}`}
        meta={
          <div className="min-w-[220px] rounded-[var(--radius-lg)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 text-left shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground-soft)]">
              Current price
            </span>
            <div className="mt-3 text-3xl font-semibold text-foreground">
              {priceLabel}
            </div>
            {currentVariant ? (
              <span className="mt-1 block text-xs text-[var(--color-foreground-soft)]">
                Selected variant: {currentVariant.title}
              </span>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <ProductGallery
          images={productImages}
          currentIndex={currentImageIndex}
          onSelect={handleImageSelect}
          title={product.title}
        />

        <div className="flex flex-col gap-8">
          <div className="rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-[rgba(15,23,42,0.12)] bg-white px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--color-foreground-soft)]"
              >
                {product.domain}
              </Badge>
              {currentVariant ? (
                <span className="rounded-full border border-[rgba(15,23,42,0.12)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground-soft)]">
                  {currentVariant.title}
                </span>
              ) : null}
            </div>
            <p className="text-base leading-relaxed text-[var(--color-foreground-soft)]">
              Select a variant to explore materials, sizing, and real-time pricing direct from the Shopify catalogue.
            </p>
            <Button asChild size="lg" className="w-full gap-2">
              <a
                href={`https://${product.domain}/products/${product.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                View product on store
              </a>
            </Button>
          </div>

          <ProductVariantSelector
            variants={variants}
            selectedId={currentVariant?.id}
            onSelect={handleVariantSelect}
          />

          <ProductOptionsList options={options} />
        </div>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-8 shadow-sm space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Product description
        </h2>
        {descriptionHtml ? (
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-[rgba(15,23,42,0.08)] bg-[rgba(248,250,252,0.8)] px-6 py-5 text-[var(--color-foreground-soft)]">
            Discover exquisite craftsmanship and comfort engineered for everyday living.
          </div>
        )}
      </section>

      <ProductMetaBar updatedAt={product.updated_at} domain={product.domain} />

      {/* Similar Products Section */}
      <section className="rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Similar Products</h2>
        </div>
        
        {loadingSimilar ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : Array.isArray(similarProducts) && similarProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((similarProduct) => (
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
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-[rgba(15,23,42,0.08)] bg-[rgba(248,250,252,0.8)] px-6 py-5 text-[var(--color-foreground-soft)]">
            No similar products found at this time.
          </div>
        )}
      </section>
    </PageContainer>
  );
}
