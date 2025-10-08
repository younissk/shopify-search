export interface ProductImage {
  domain: string;
  product_id: number;
  image_id: number;
  src: string;
  position: number;
  width?: number;
  height?: number;
  alt?: string | null;
  created_at?: string;
  updated_at?: string;
  fetched_at?: string;
  raw_json?: unknown;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string | null;
  position: number;
  inventory_policy?: string;
  compare_at_price?: string | null;
  fulfillment_service?: string;
  inventory_management?: string | null;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  created_at?: string;
  updated_at?: string;
  taxable?: boolean;
  barcode?: string | null;
  grams?: number;
  weight?: number;
  weight_unit?: string;
  inventory_quantity?: number;
  requires_shipping?: boolean;
  raw_json?: unknown;
}

export interface ProductRawJson {
  id: number;
  tags: string[];
  title: string;
  domain: string;
  handle: string;
  images: Array<{
    id: number;
    src: string;
    width: number;
    height: number;
    position: number;
    created_at: string;
    product_id: number;
    updated_at: string;
    variant_ids: number[];
  }>;
  vendor: string;
  options: Array<{
    name: string;
    values: string[];
    position: number;
  }>;
  variants: Array<{
    id: number;
    sku: string;
    grams: number;
    price: string;
    title: string;
    option1: string;
    option2: string | null;
    option3: string | null;
    taxable: boolean;
    position: number;
    available: boolean;
    created_at: string;
    product_id: number;
    updated_at: string;
    featured_image: unknown | null;
    compare_at_price: string | null;
    requires_shipping: boolean;
  }>;
  body_html: string | TrustedHTML;
  created_at: string;
  updated_at: string;
  product_type: string;
  published_at: string;
}

export interface Product {
  domain: string;
  product_id: number;
  handle: string;
  title: string;
  vendor: string;
  product_type: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at: string;
  status: string | null;
  admin_graphql_api_id: string | null;
  template_suffix: string | null;
  published_scope: string | null;
  fetched_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  body_html?: string;
  raw_json?: ProductRawJson;
  embedding?: number[];
}
