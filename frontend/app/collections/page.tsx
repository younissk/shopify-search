import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { Plus } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { getUserCollections } from "@/supabase/collection";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { getAuthenticatedSupabaseClient } from "@/supabase/server";

export default async function CollectionsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/");
  }

  const result = await getUserCollections();
  const collections = result.data || [];

  // Fetch thumbnails for each collection
  const supabase = await getAuthenticatedSupabaseClient();
  
  const collectionsWithThumbnails = await Promise.all(
    collections.map(async (collection) => {
      const { data: items } = await supabase
        .from("collection_items")
        .select(
          `
          products:products!inner(images)
        `
        )
        .eq("collection_id", collection.id)
        .order("position", { ascending: true })
        .limit(4);

      const thumbnails =
        items
          ?.map((item: { products: { images: { src: string }[] }[] }) => item.products?.[0]?.images?.[0]?.src)
          .filter(Boolean) || [];

      // Count items
      const { count } = await supabase
        .from("collection_items")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", collection.id);

      return {
        ...collection,
        thumbnails,
        itemCount: count || 0,
      };
    })
  );

  return (
    <PageContainer>

      <div className="mb-6 flex justify-end">
        <Link href="/collections/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-xl font-semibold  mb-2">
            No collections yet
          </h3>
          <p className=" mb-6 max-w-md">
            Start organizing your favorite products by creating your first
            collection. You can make them private or share them with others.
          </p>
          <Link href="/collections/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Collection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collectionsWithThumbnails.map((collection) => (
            <CollectionCard
              key={collection.id}
              id={collection.id}
              name={collection.name}
              slug={collection.slug}
              description={collection.description}
              isPublic={collection.is_public}
              itemCount={collection.itemCount}
              thumbnails={collection.thumbnails}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

