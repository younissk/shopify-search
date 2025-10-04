import { Product, ProductImage } from "@/types/Product";
import { supabase } from "./client";

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
