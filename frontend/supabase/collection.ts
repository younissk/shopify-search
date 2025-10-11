"use server";

import { getCurrentUserId } from "@/lib/auth";
import { getAuthenticatedSupabaseClient } from "./server";
import {
  Collection,
  CollectionItem,
  CollectionListResult,
  CollectionResult,
  CollectionWithProductDetails,
  CollectionWithProductsResult,
  CreateCollectionInput,
  UpdateCollectionInput,
  AddProductToCollectionInput,
  CollectionItemResult,
} from "@/types/Collection";

/**
 * Generate a URL-safe slug from a collection name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

/**
 * Get all collections for the current user
 */
export async function getUserCollections(): Promise<CollectionListResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();
    
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("clerk_user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching collections:", error);
      return { data: null, error: error.message };
    }

    return { data: data as Collection[], error: null };
  } catch (error) {
    console.error("Unexpected error fetching collections:", error);
    return { data: null, error: String(error) };
  }
}

/**
 * Get a collection by slug (public or owned by user)
 */
export async function getCollectionBySlug(
  slug: string
): Promise<CollectionWithProductsResult> {
  try {
    const userId = await getCurrentUserId();
    const supabase = await getAuthenticatedSupabaseClient();

    // First get the collection
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .single();

    if (collectionError) {
      console.error("Error fetching collection:", collectionError);
      return { data: null, error: collectionError.message };
    }

    if (!collection) {
      return { data: null, error: "Collection not found" };
    }

    // Check access: must be public or owned by user
    if (!collection.is_public && collection.clerk_user_id !== userId) {
      return { data: null, error: "Access denied" };
    }

    // Get collection items with product details
    const { data: items, error: itemsError } = await supabase
      .from("collection_items")
      .select(
        `
        *,
        products:products!inner(
          title,
          vendor,
          raw_json->variants,
          raw_json->images
        )
      `
      )
      .eq("collection_id", collection.id)
      .order("position", { ascending: true });

    if (itemsError) {
      console.error("Error fetching collection items:", itemsError);
      return { data: null, error: itemsError.message };
    }

    // Transform the data to match our type
    const itemsWithDetails = (items || []).map((item: any) => ({
      id: item.id,
      collection_id: item.collection_id,
      product_id: item.product_id,
      domain: item.domain,
      position: item.position,
      notes: item.notes,
      added_at: item.added_at,
      product_title: item.products?.title,
      product_image: item.products?.images?.[0]?.src,
      product_price: item.products?.variants?.[0]?.price,
      product_vendor: item.products?.vendor,
    }));

    const result: CollectionWithProductDetails = {
      ...collection,
      items: itemsWithDetails,
      item_count: itemsWithDetails.length,
    };

    return { data: result, error: null };
  } catch (error) {
    console.error("Unexpected error fetching collection:", error);
    return { data: null, error: String(error) };
  }
}

/**
 * Create a new collection
 */
export async function createCollection(
  input: CreateCollectionInput
): Promise<CollectionResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();

    // Generate unique slug
    const baseSlug = generateSlug(input.name);
    let slug = baseSlug;
    let counter = 0;

    // Check for slug uniqueness
    while (true) {
      const { data: existing } = await supabase
        .from("collections")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existing) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const { data, error } = await supabase
      .from("collections")
      .insert({
        clerk_user_id: userId,
        name: input.name,
        description: input.description || null,
        slug,
        is_public: input.is_public ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating collection:", error);
      return { data: null, error: error.message };
    }

    return { data: data as Collection, error: null };
  } catch (error) {
    console.error("Unexpected error creating collection:", error);
    return { data: null, error: String(error) };
  }
}

/**
 * Update a collection
 */
export async function updateCollection(
  id: string,
  input: UpdateCollectionInput
): Promise<CollectionResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("collections")
      .select("clerk_user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.clerk_user_id !== userId) {
      return { data: null, error: "Collection not found or access denied" };
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.is_public !== undefined) updateData.is_public = input.is_public;

    // If name is being updated, regenerate slug
    if (input.name) {
      const baseSlug = generateSlug(input.name);
      let slug = baseSlug;
      let counter = 0;

      while (true) {
        const { data: existingSlug } = await supabase
          .from("collections")
          .select("id")
          .eq("slug", slug)
          .neq("id", id)
          .single();

        if (!existingSlug) break;
        counter++;
        slug = `${baseSlug}-${counter}`;
      }

      updateData.slug = slug;
    }

    const { data, error } = await supabase
      .from("collections")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating collection:", error);
      return { data: null, error: error.message };
    }

    return { data: data as Collection, error: null };
  } catch (error) {
    console.error("Unexpected error updating collection:", error);
    return { data: null, error: String(error) };
  }
}

/**
 * Delete a collection and all its items
 */
export async function deleteCollection(id: string): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from("collections")
      .select("clerk_user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.clerk_user_id !== userId) {
      return { error: "Collection not found or access denied" };
    }

    const { error } = await supabase.from("collections").delete().eq("id", id);

    if (error) {
      console.error("Error deleting collection:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Unexpected error deleting collection:", error);
    return { error: String(error) };
  }
}

/**
 * Add a product to a collection
 */
export async function addProductToCollection(
  input: AddProductToCollectionInput
): Promise<CollectionItemResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();

    // Verify collection ownership
    const { data: collection } = await supabase
      .from("collections")
      .select("clerk_user_id")
      .eq("id", input.collection_id)
      .single();

    if (!collection || collection.clerk_user_id !== userId) {
      return { data: null, error: "Collection not found or access denied" };
    }

    // Get the highest position in the collection
    const { data: maxPosition } = await supabase
      .from("collection_items")
      .select("position")
      .eq("collection_id", input.collection_id)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const position = input.position ?? (maxPosition?.position ?? -1) + 1;

    const { data, error } = await supabase
      .from("collection_items")
      .insert({
        collection_id: input.collection_id,
        product_id: input.product_id,
        domain: input.domain,
        notes: input.notes || null,
        position,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding product to collection:", error);
      return { data: null, error: error.message };
    }

    return { data: data as CollectionItem, error: null };
  } catch (error) {
    console.error("Unexpected error adding product to collection:", error);
    return { data: null, error: String(error) };
  }
}

/**
 * Remove a product from a collection
 */
export async function removeProductFromCollection(
  collectionId: string,
  itemId: string
): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();

    // Verify collection ownership
    const { data: collection } = await supabase
      .from("collections")
      .select("clerk_user_id")
      .eq("id", collectionId)
      .single();

    if (!collection || collection.clerk_user_id !== userId) {
      return { error: "Collection not found or access denied" };
    }

    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("id", itemId)
      .eq("collection_id", collectionId);

    if (error) {
      console.error("Error removing product from collection:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Unexpected error removing product from collection:", error);
    return { error: String(error) };
  }
}

/**
 * Check if a product is in any of the user's collections
 */
export async function getProductCollections(
  productId: string,
  domain: string
): Promise<CollectionListResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { data: null, error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("collection_items")
      .select(
        `
        collection_id,
        collections:collections!inner(*)
      `
      )
      .eq("product_id", productId)
      .eq("domain", domain)
      .eq("collections.clerk_user_id", userId);

    if (error) {
      console.error("Error fetching product collections:", error);
      return { data: null, error: error.message };
    }

    const collections = (data || []).map((item: any) => item.collections) as Collection[];

    return { data: collections, error: null };
  } catch (error) {
    console.error("Unexpected error fetching product collections:", error);
    return { data: null, error: String(error) };
  }
}

/**
 * Reorder items in a collection
 */
export async function reorderCollectionItems(
  collectionId: string,
  itemIds: string[]
): Promise<{ error: string | null }> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { error: "Not authenticated" };
    }

    const supabase = await getAuthenticatedSupabaseClient();

    // Verify collection ownership
    const { data: collection } = await supabase
      .from("collections")
      .select("clerk_user_id")
      .eq("id", collectionId)
      .single();

    if (!collection || collection.clerk_user_id !== userId) {
      return { error: "Collection not found or access denied" };
    }

    // Update positions
    const updates = itemIds.map((itemId, index) =>
      supabase
        .from("collection_items")
        .update({ position: index })
        .eq("id", itemId)
        .eq("collection_id", collectionId)
    );

    await Promise.all(updates);

    return { error: null };
  } catch (error) {
    console.error("Unexpected error reordering collection items:", error);
    return { error: String(error) };
  }
}

