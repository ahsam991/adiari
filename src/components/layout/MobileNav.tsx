import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: itemCount },
    { icon: User, label: 'Account', path: user ? '/profile' : '/login' },
  ];

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 touch-target',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge ? (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-2xs font-medium">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
