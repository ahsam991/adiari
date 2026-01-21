import { Link } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types/database';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { formatPrice } = useSettings();
  const { addToCart, items, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = items.find(item => item.product_id === product.id);
  const isInCart = !!cartItem;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 10);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compare_at_price!) * 100) 
    : 0;

  const primaryImage = product.images?.find(img => img.is_primary)?.url 
    || product.images?.[0]?.url 
    || '/placeholder.svg';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);
  };

  const handleQuantityChange = async (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    
    const newQuantity = cartItem.quantity + delta;
    if (newQuantity <= 0) {
      await removeFromCart(cartItem.id);
    } else {
      await updateQuantity(cartItem.id, newQuantity);
    }
  };

  return (
    <Link 
      to={`/product/${product.slug}`}
      className={cn('product-card block', className)}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 image-placeholder" />
        )}
        <img
          src={primaryImage}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Badges */}
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

      {/* Content */}
      <div className="p-3">
        {/* Category */}
        {product.category && (
          <span className="text-2xs text-muted-foreground uppercase tracking-wide">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <h3 className="font-medium text-sm line-clamp-2 mt-1 mb-2">
          {product.name}
        </h3>

        {/* Weight/Unit */}
        {product.weight && (
          <span className="text-xs text-muted-foreground">
            {product.weight} {product.weight_unit}
          </span>
        )}

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="price-tag">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="price-original ml-2">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>

          {/* Stock status or Add to cart */}
          {isOutOfStock ? (
            <span className="stock-badge out-of-stock">Out of Stock</span>
          ) : isInCart ? (
            <div className="quantity-selector" onClick={(e) => e.preventDefault()}>
              <button 
                className="quantity-btn"
                onClick={(e) => handleQuantityChange(e, -1)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {cartItem.quantity}
              </span>
              <button 
                className="quantity-btn"
                onClick={(e) => handleQuantityChange(e, 1)}
                disabled={cartItem.quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={handleAddToCart}
              disabled={!user}
              className="h-8 px-3"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Low stock warning */}
        {isLowStock && !isOutOfStock && (
          <span className="stock-badge low-stock mt-2">
            Only {product.stock_quantity} left
          </span>
        )}
      </div>
    </Link>
  );
}
