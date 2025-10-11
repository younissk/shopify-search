import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { Edit, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCollectionBySlug } from "@/supabase/collection";
import ProductCard from "@/components/ProductCard";
import { ShareMenu } from "@/components/collection/ShareMenu";

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCollectionBySlug(slug);

  if (!result.data) {
    return {
      title: "Collection Not Found",
    };
  }

  const collection = result.data;
  const firstImage = collection.items[0]?.product_image;

  return {
    title: collection.name,
    description: collection.description || `A curated collection by a user`,
    openGraph: {
      title: collection.name,
      description: collection.description || `A curated collection`,
      type: "website",
      images: firstImage ? [{ url: firstImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: collection.name,
      description: collection.description || `A curated collection`,
      images: firstImage ? [firstImage] : [],
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const userId = await getCurrentUserId();

  const result = await getCollectionBySlug(slug);

  if (result.error || !result.data) {
    notFound();
  }

  const collection = result.data;
  const isOwner = userId === collection.clerk_user_id;

  // If collection is private and user is not the owner, redirect
  if (!collection.is_public && !isOwner) {
    redirect("/");
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold ">
                {collection.name}
              </h1>
              <Badge variant={collection.is_public ? "default" : "secondary"}>
                {collection.is_public ? (
                  <>
                    <Globe className="mr-1 h-3 w-3" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="mr-1 h-3 w-3" />
                    Private
                  </>
                )}
              </Badge>
            </div>

            {collection.description && (
              <p className="text-lg ">{collection.description}</p>
            )}

            <p className="mt-2 text-sm ">
              {collection.item_count}{" "}
              {collection.item_count === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="flex gap-2">
            {collection.is_public && (
              <ShareMenu
                collectionName={collection.name}
                collectionSlug={collection.slug}
                description={collection.description || undefined}
              />
            )}

            {isOwner && (
              <Link href={`/collections/${collection.slug}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {collection.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-xl font-semibold  mb-2">
            No products yet
          </h3>
          <p className=" max-w-md">
            {isOwner
              ? "Start adding products to this collection by clicking the heart icon on any product."
              : "This collection doesn't have any products yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collection.items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.product_id}
              title={item.product_title || "Unknown Product"}
              price={item.product_price || "N/A"}
              domain={item.domain}
              image={item.product_image}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
