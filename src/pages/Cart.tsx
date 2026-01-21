import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, isLoading } = useCart();
  const { formatPrice, settings } = useSettings();
  const { user } = useAuth();

  const shippingFee = subtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_fee;
  const total = subtotal + shippingFee;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to view your cart</h1>
        <p className="text-muted-foreground mb-6">Please sign in to add items to your cart</p>
        <Button asChild><Link to="/login">Sign In</Link></Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started</p>
        <Button asChild><Link to="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">Shopping Cart ({itemCount})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.product?.images?.[0]?.url || '/placeholder.svg'} alt={item.product?.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product?.slug}`} className="font-medium hover:text-primary line-clamp-1">{item.product?.name}</Link>
                <p className="text-sm text-muted-foreground">{formatPrice(item.product?.price || 0)}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="quantity-selector">
                    <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= (item.product?.stock_quantity || 0)}><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="text-right font-medium">{formatPrice((item.product?.price || 0) * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/50 rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span></div>
              {shippingFee > 0 && <p className="text-xs text-muted-foreground">Free shipping on orders over {formatPrice(settings.free_shipping_threshold)}</p>}
              <div className="border-t pt-3 flex justify-between font-semibold text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <Button className="w-full mt-6" size="lg" onClick={() => navigate('/checkout')}>Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
