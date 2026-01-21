import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CategoryCard } from '@/components/category/CategoryCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { Category, Product } from '@/types/database';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Categories() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch all categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as Category[];
    }
  });

  // If we have a slug, get the specific category and its products
  const { data: currentCategory } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as Category | null;
    },
    enabled: !!slug
  });

  const { data: categoryProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'category', currentCategory?.id],
    queryFn: async () => {
      if (!currentCategory) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('category_id', currentCategory.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!currentCategory
  });

  // If viewing a specific category
  if (slug && currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/categories" className="hover:text-foreground">Categories</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{currentCategory.name}</span>
        </nav>

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6"
        >
          <Link to="/categories">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Categories
          </Link>
        </Button>

        {/* Category header */}
        <div className="mb-8">
          {currentCategory.image_url && (
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
              <img
                src={currentCategory.image_url}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  {currentCategory.name}
                </h1>
                {currentCategory.description && (
                  <p className="text-white/80 mt-2 max-w-lg">
                    {currentCategory.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {!currentCategory.image_url && (
            <>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                {currentCategory.name}
              </h1>
              {currentCategory.description && (
                <p className="text-muted-foreground">
                  {currentCategory.description}
                </p>
              )}
            </>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            {categoryProducts.length} products
          </p>
        </div>

        {/* Products */}
        <ProductGrid products={categoryProducts} isLoading={loadingProducts} />
      </div>
    );
  }

  // All categories view
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Categories</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">
        Shop by Category
      </h1>

      {loadingCategories ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No categories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories
            .filter(c => !c.parent_id) // Only show top-level categories
            .map((category) => (
              <CategoryCard key={category.id} category={category} size="lg" />
            ))}
        </div>
      )}
    </div>
  );
}
