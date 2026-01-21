import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/hooks/useSettings';
import type { Product, Category } from '@/types/database';
import { Filter, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [showFeatured, setShowFeatured] = useState(searchParams.get('featured') === 'true');
  const [showOrganic, setShowOrganic] = useState(searchParams.get('organic') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Category[];
    }
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory, showFeatured, showOrganic, sortBy, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('is_active', true)
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (showFeatured) {
        query = query.eq('is_featured', true);
      }

      if (showOrganic) {
        query = query.eq('is_organic', true);
      }

      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name');
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    }
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (showFeatured) params.set('featured', 'true');
    if (showOrganic) params.set('organic', 'true');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, showFeatured, showOrganic, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 5000]);
    setSelectedCategory('all');
    setShowFeatured(false);
    setShowOrganic(false);
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || showFeatured || showOrganic || priceRange[0] > 0 || priceRange[1] < 5000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          min={0}
          max={5000}
          step={50}
        />
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="featured"
            checked={showFeatured}
            onCheckedChange={(checked) => setShowFeatured(checked as boolean)}
          />
          <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
            Featured products only
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="organic"
            checked={showOrganic}
            onCheckedChange={(checked) => setShowOrganic(checked as boolean)}
          />
          <Label htmlFor="organic" className="text-sm font-normal cursor-pointer">
            Organic products only
          </Label>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {showFeatured ? 'Featured Products' : showOrganic ? 'Organic Products' : 'All Products'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {products.length} products found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort dropdown - desktop */}
          <div className="hidden md:block">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filter button */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <ProductGrid products={products} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
