export interface ProductImage {
  domain: string;
  product_id: number;
  image_id: number;
  src: string;
  position: number;
}

export interface Product {
  domain: string;
  product_id: number;
  handle: string;
  title: string;
  vendor: string;
  product_type: string;
  tags: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  status: string | null;
  admin_graphql_api_id: string | null;
  template_suffix: string | null;
  published_scope: string | null;
  fetched_at: string;
  images?: ProductImage[];
}