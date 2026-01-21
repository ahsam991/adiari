-- =====================================================
-- FreshCart Grocery E-Commerce Database Schema
-- Complete production-ready schema with security
-- =====================================================

-- Create custom types
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');

-- =====================================================
-- 1. PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. USER ROLES TABLE (admin roles - SEPARATE from profiles!)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CATEGORIES TABLE
-- =====================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. PRODUCTS TABLE
-- =====================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  cost_price DECIMAL(10,2) CHECK (cost_price IS NULL OR cost_price >= 0),
  sku TEXT UNIQUE,
  barcode TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  weight DECIMAL(10,3),
  weight_unit TEXT DEFAULT 'kg',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_organic BOOLEAN DEFAULT false,
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. PRODUCT IMAGES TABLE
-- =====================================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CART TABLE
-- =====================================================
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CART ITEMS TABLE
-- =====================================================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. ORDERS TABLE
-- =====================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_amount DECIMAL(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending',
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'India',
  notes TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_image_url TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. EMAIL LOGS TABLE
-- =====================================================
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 12. WEBSITE SETTINGS TABLE
-- =====================================================
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is any type of admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Check if order is cancellable (pending or confirmed only)
CREATE OR REPLACE FUNCTION public.is_order_cancellable(_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = _order_id
      AND status IN ('pending', 'confirmed')
  )
$$;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.orders;
  new_number := 'FC' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(counter::TEXT, 5, '0');
  RETURN new_number;
END;
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- PROFILES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- USER ROLES
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- CATEGORIES
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all categories"
  ON public.categories FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin(auth.uid()));

-- PRODUCTS
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin(auth.uid()));

-- PRODUCT IMAGES
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin(auth.uid()));

-- CARTS
CREATE POLICY "Users can view own cart"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create cart"
  ON public.carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON public.carts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON public.carts FOR DELETE
  USING (auth.uid() = user_id);

-- CART ITEMS
CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT
  USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own cart items"
  ON public.cart_items FOR ALL
  USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

-- ORDERS
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own pending orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND public.is_order_cancellable(id));

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin(auth.uid()));

-- ORDER ITEMS
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin(auth.uid()));

-- EMAIL TEMPLATES
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (public.is_admin(auth.uid()));

-- EMAIL LOGS
CREATE POLICY "Admins can view email logs"
  ON public.email_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);

-- SETTINGS
CREATE POLICY "Anyone can read public settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX idx_carts_user ON public.carts(user_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('store_name', '"FreshCart"', 'Store name'),
  ('store_email', '"contact@freshcart.com"', 'Store contact email'),
  ('store_phone', '"+91 1234567890"', 'Store contact phone'),
  ('store_address', '"123 Fresh Street, Mumbai, India"', 'Store physical address'),
  ('currency', '"INR"', 'Default currency'),
  ('currency_symbol', '"₹"', 'Currency symbol'),
  ('tax_rate', '18', 'GST tax rate percentage'),
  ('free_shipping_threshold', '500', 'Minimum order for free shipping'),
  ('shipping_fee', '40', 'Default shipping fee'),
  ('min_order_amount', '100', 'Minimum order amount')
ON CONFLICT (key) DO NOTHING;

-- Default email templates
INSERT INTO public.email_templates (name, subject, html_content, variables) VALUES
  ('welcome', 'Welcome to FreshCart!', '<h1>Welcome {{name}}!</h1><p>Thank you for creating an account with FreshCart.</p>', ARRAY['name', 'email']),
  ('order_placed', 'Order Confirmed - {{order_number}}', '<h1>Order Confirmed!</h1><p>Your order {{order_number}} has been placed successfully.</p>', ARRAY['name', 'order_number', 'total']),
  ('order_delivered', 'Order Delivered - {{order_number}}', '<h1>Order Delivered!</h1><p>Your order {{order_number}} has been delivered.</p>', ARRAY['name', 'order_number']),
  ('order_cancelled', 'Order Cancelled - {{order_number}}', '<h1>Order Cancelled</h1><p>Your order {{order_number}} has been cancelled.</p>', ARRAY['name', 'order_number', 'reason']),
  ('admin_new_order', 'New Order Received - {{order_number}}', '<h1>New Order!</h1><p>A new order {{order_number}} has been placed.</p>', ARRAY['order_number', 'customer_name', 'total'])
ON CONFLICT (name) DO NOTHING;