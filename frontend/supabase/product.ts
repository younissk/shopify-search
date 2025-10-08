import { Product, ProductImage } from "@/types/Product";
import { supabase } from "./client";

interface SimilarProductsRequest {
  product_id: string | number;
  domain?: string;
  k?: number;
}

interface SimilarProductsResponse {
  data: Product[] | null;
  error: string | null;
}

export const getSimilarProducts = async ({
  product_id,
  domain,
  k = 10,
}: SimilarProductsRequest): Promise<SimilarProductsResponse> => {
  try {
    const { data: response, error } = await supabase.functions.invoke("similar-products", {
      body: {
        product_id,
        domain,
        k: Math.min(Math.max(1, k), 100), // Ensure k is between 1 and 100
      },
    });

    console.log('Edge function response:', response);

    if (error) {
      console.error("Error fetching similar products:", error);
      return { data: null, error: error.message };
    }

    if (!response) {
      return { data: null, error: "No response from similar-products function" };
    }

    // The response might be in response.items if it's wrapped
    const items = Array.isArray(response) ? response : response.items;
    
    if (!Array.isArray(items)) {
      console.error("Invalid response format:", response);
      return { data: null, error: "Invalid response format" };
    }

    // Fetch images for all returned products
    const productIds = items.map(p => p.product_id);
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("*")
      .in("product_id", productIds)
      .order("position", { ascending: true });

    if (imagesError) {
      console.error("Error fetching product images:", imagesError);
      return { data: null, error: imagesError.message };
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
    const productsWithImages = items.map(product => ({
      ...product,
      images: imagesByProduct[product.product_id] || []
    }));

    return { data: productsWithImages, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in getSimilarProducts:", errorMessage);
    return { data: null, error: errorMessage };
  }
};

export const getProduct = async (
  domain: string,
  productId: string
): Promise<Product | null> => {
  try {
    // Fetch the product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("domain", domain)
      .eq("product_id", productId)
      .limit(1)
      .single();

    if (productError) {
      console.error("Error fetching product:", productError);
      return null;
    }

    // Fetch associated images
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("*")
      .eq("domain", domain)
      .eq("product_id", productId)
      .order("position", { ascending: true });

    if (imagesError) {
      console.error("Error fetching product images:", imagesError);
      return null;
    }

    // Combine product with its images
    return {
      ...product,
      images: images as ProductImage[]
    } as Product;
  } catch (err) {
    console.error("Error in getProduct:", err);
    return null;
  }
};
