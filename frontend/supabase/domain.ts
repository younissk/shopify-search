import { supabase } from "./client";
import { Product, ProductImage } from "@/types/Product";

interface PaginationResult {
  data: Product[] | null;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export const ITEMS_PER_PAGE = 12;

export const getProductsByDomain = async (
  domainId: string,
  page: number = 1
): Promise<PaginationResult> => {
  try {
    // Calculate start and end for pagination
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    // Get total count first
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("domain", domainId);

    if (countError) {
      console.error("Supabase count error:", countError);
      return {
        data: null,
        error: countError.message,
        total: 0,
        hasMore: false,
      };
    }

    // Get paginated data
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("domain", domainId)
      .range(start, end)
      .order("title", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return { data: null, error: error.message, total: 0, hasMore: false };
    }

    if (!products || products.length === 0) {
      return { data: [], error: null, total: 0, hasMore: false };
    }

    // Get images for all products in the current page
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("*")
      .eq("domain", domainId)
      .in("product_id", products.map(p => p.product_id))
      .order("position", { ascending: true });

    if (imagesError) {
      console.error("Error fetching images:", imagesError);
      return { data: null, error: imagesError.message, total: 0, hasMore: false };
    }

    // Group images by product_id
    const imagesByProduct = (images || []).reduce((acc, img) => {
      if (!acc[img.product_id]) {
        acc[img.product_id] = [];
      }
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, ProductImage[]>);

    // Combine products with their images
    const productsWithImages = products.map(product => ({
      ...product,
      images: imagesByProduct[product.product_id] || []
    }));

    const total = count || 0;
    const hasMore = total > page * ITEMS_PER_PAGE;

    return { data: productsWithImages, error: null, total, hasMore };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching products:", errorMessage);
    return { data: null, error: errorMessage, total: 0, hasMore: false };
  }
};
