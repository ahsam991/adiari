import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut, ChevronDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export function Header() {
  const navigate = useNavigate();
  const { itemCount, subtotal } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { settings, formatPrice } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar - mobile */}
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left text-primary font-display text-xl">
                  {settings.store_name}
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 space-y-4">
                <Link
                  to="/categories"
                  className="block py-2 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Categories
                </Link>
                <Link
                  to="/products"
                  className="block py-2 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                </Link>
                <div className="border-t pt-4">
                  <Link
                    to="/contact"
                    className="block py-2 text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/privacy-policy"
                    className="block py-2 text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="block py-2 text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Terms & Conditions
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-fresh flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="hidden sm:block font-display font-bold text-xl text-foreground">
              {settings.store_name}
            </span>
          </Link>

          {/* Desktop Search */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 w-full"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate('/search')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex gap-2"
              onClick={() => navigate('/cart')}
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-2xs font-medium">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              {itemCount > 0 && (
                <span className="font-medium">{formatPrice(subtotal)}</span>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline-block max-w-24 truncate">
                      {profile?.full_name || 'Account'}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/login')}
                className="hidden md:flex"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Desktop category nav */}
        <nav className="hidden md:flex items-center gap-6 h-10 text-sm">
          <Link to="/categories" className="font-medium text-foreground hover:text-primary transition-colors">
            All Categories
          </Link>
          <Link to="/products?featured=true" className="text-muted-foreground hover:text-foreground transition-colors">
            Featured
          </Link>
          <Link to="/products?organic=true" className="text-muted-foreground hover:text-foreground transition-colors">
            Organic
          </Link>
          <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            All Products
          </Link>
        </nav>
      </div>
    </header>
  );
}
