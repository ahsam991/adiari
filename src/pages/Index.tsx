import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, Leaf, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryCard } from '@/components/category/CategoryCard';
import { useSettings } from '@/hooks/useSettings';
import type { Product, Category } from '@/types/database';

export default function Index() {
  const { settings, formatPrice } = useSettings();

  // Fetch featured products
  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(10);

      if (error) throw error;
      return data as Product[];
    }
  });

  // Fetch categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order');

      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch organic products
  const { data: organicProducts = [], isLoading: loadingOrganic } = useQuery({
    queryKey: ['products', 'organic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('is_active', true)
        .eq('is_organic', true)
        .limit(10);

      if (error) throw error;
      return data as Product[];
    }
  });

  // Fetch all products for "Shop Now" section
  const { data: allProducts = [], isLoading: loadingAll } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Product[];
    }
  });

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="hero-gradient py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" />
              Fresh & Organic
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
              Fresh Groceries Delivered to Your Doorstep
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Shop from our wide selection of fresh fruits, vegetables, dairy, and more. 
              Free delivery on orders over {formatPrice(settings.free_shipping_threshold)}.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-fresh-light flex items-center justify-center">
                <Truck className="h-5 w-5 text-fresh" />
              </div>
              <div>
                <p className="font-medium text-sm">Free Delivery</p>
                <p className="text-xs text-muted-foreground">Orders over {formatPrice(settings.free_shipping_threshold)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-fresh-light flex items-center justify-center">
                <Leaf className="h-5 w-5 text-fresh" />
              </div>
              <div>
                <p className="font-medium text-sm">Fresh Products</p>
                <p className="text-xs text-muted-foreground">100% organic options</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-fresh-light flex items-center justify-center">
                <Shield className="h-5 w-5 text-fresh" />
              </div>
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">Cash on delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-fresh-light flex items-center justify-center">
                <Clock className="h-5 w-5 text-fresh" />
              </div>
              <div>
                <p className="font-medium text-sm">Same Day Delivery</p>
                <p className="text-xs text-muted-foreground">Order before 2 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-display font-bold">Shop by Category</h2>
            <Link 
              to="/categories" 
              className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-8 md:py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-display font-bold">Featured Products</h2>
              <Link 
                to="/products?featured=true" 
                className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} isLoading={loadingFeatured} />
          </div>
        </section>
      )}

      {/* Organic Products */}
      {organicProducts.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-fresh flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-display font-bold">Organic Products</h2>
              </div>
              <Link 
                to="/products?organic=true" 
                className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductGrid products={organicProducts} isLoading={loadingOrganic} />
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="py-8 md:py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-display font-bold">Shop Now</h2>
            <Link 
              to="/products" 
              className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={allProducts} isLoading={loadingAll} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-fresh rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Start Shopping Today!
            </h2>
            <p className="text-white/90 mb-6 max-w-lg mx-auto">
              Join thousands of happy customers who trust us for their daily grocery needs.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
