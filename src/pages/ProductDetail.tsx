import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import type { Product } from '@/types/database';
import { useState } from 'react';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Leaf, 
  Truck, 
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, settings } = useSettings();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Product not found');
      return data as Product;
    }
  });

  const cartItem = items.find(item => item.product_id === product?.id);
  const isInCart = !!cartItem;
  const isOutOfStock = product ? product.stock_quantity <= 0 : false;
  const hasDiscount = product?.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount && product?.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const images = product?.images?.sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  }) || [];

  const currentImage = images[selectedImageIndex]?.url || '/placeholder.svg';

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    await addToCart(product, quantity);
    setQuantity(1);
  };

  const handleQuantityChange = async (delta: number) => {
    if (!cartItem) return;
    const newQuantity = cartItem.quantity + delta;
    if (newQuantity <= 0) {
      await removeFromCart(cartItem.id);
    } else if (newQuantity <= (product?.stock_quantity || 0)) {
      await updateQuantity(cartItem.id, newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.description || '',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-32" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.is_organic && (
              <div className="fresh-badge flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                Organic
              </div>
            )}
            {hasDiscount && (
              <div className="sale-badge">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.category && (
            <span className="inline-block text-sm text-muted-foreground uppercase tracking-wide">
              {product.category.name}
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {product.name}
          </h1>

          {/* SKU & Brand */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {product.sku && <span>SKU: {product.sku}</span>}
            {product.brand && <span>Brand: {product.brand}</span>}
            {product.weight && (
              <span>{product.weight} {product.weight_unit}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock status */}
          {isOutOfStock ? (
            <span className="stock-badge out-of-stock">Out of Stock</span>
          ) : product.stock_quantity <= (product.low_stock_threshold || 10) ? (
            <span className="stock-badge low-stock">
              Only {product.stock_quantity} left in stock
            </span>
          ) : (
            <span className="stock-badge in-stock">In Stock</span>
          )}

          {/* Description */}
          {(product.short_description || product.description) && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.short_description || product.description}</p>
            </div>
          )}

          {/* Add to Cart */}
          <div className="space-y-4 pt-4 border-t">
            {!isOutOfStock && (
              <>
                {isInCart ? (
                  <div className="flex items-center gap-4">
                    <div className="quantity-selector">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(-1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {cartItem.quantity}
                      </span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(1)}
                        disabled={cartItem.quantity >= product.stock_quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Total: {formatPrice(cartItem.quantity * product.price)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="quantity-selector">
                      <button
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        className="quantity-btn"
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        disabled={quantity >= product.stock_quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Button size="lg" onClick={handleAddToCart} className="flex-1">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
            </div>
          </div>

          {/* Delivery info */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 text-sm">
            <Truck className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Free delivery on orders over {formatPrice(settings.free_shipping_threshold)}</p>
              <p className="text-muted-foreground">Standard delivery: {formatPrice(settings.shipping_fee)}</p>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
