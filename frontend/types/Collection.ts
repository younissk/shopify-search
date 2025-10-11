export interface Collection {
  id: string;
  clerk_user_id: string;
  name: string;
  description?: string | null;
  slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  product_id: string;
  domain: string;
  position: number;
  notes?: string | null;
  added_at: string;
}

export interface CollectionWithProducts extends Collection {
  items: CollectionItem[];
  item_count: number;
}

export interface CollectionWithProductDetails extends Collection {
  items: Array<
    CollectionItem & {
      product_title?: string;
      product_image?: string;
      product_price?: string;
      product_vendor?: string;
    }
  >;
  item_count: number;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface AddProductToCollectionInput {
  collection_id: string;
  product_id: string;
  domain: string;
  notes?: string;
  position?: number;
}

export interface CollectionResult {
  data: Collection | null;
  error: string | null;
}

export interface CollectionListResult {
  data: Collection[] | null;
  error: string | null;
}

export interface CollectionWithProductsResult {
  data: CollectionWithProductDetails | null;
  error: string | null;
}

export interface CollectionItemResult {
  data: CollectionItem | null;
  error: string | null;
}

