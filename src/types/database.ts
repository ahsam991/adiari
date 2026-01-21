// Custom types that extend the auto-generated Supabase types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type AppRole = 'admin' | 'super_admin';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  weight: number | null;
  weight_unit: string | null;
  category_id: string | null;
  brand: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_organic: boolean;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  images?: ProductImage[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string | null;
  product_image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  template_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  status: string;
  error_message: string | null;
  metadata: any;
  sent_at: string | null;
  created_at: string;
}
