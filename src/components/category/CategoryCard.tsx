import { Link } from 'react-router-dom';
import type { Category } from '@/types/database';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryCard({ category, size = 'md', className }: CategoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48'
  };

  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        'group relative block overflow-hidden rounded-xl',
        sizeClasses[size],
        className
      )}
    >
      {/* Background image */}
      <div className="absolute inset-0 bg-muted">
        {category.image_url && (
          <>
            {!imageLoaded && <div className="absolute inset-0 image-placeholder" />}
            <img
              src={category.image_url}
              alt={category.name}
              className={cn(
                'w-full h-full object-cover transition-all duration-300 group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-end p-4">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-medium text-white text-lg">{category.name}</h3>
          <ChevronRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
