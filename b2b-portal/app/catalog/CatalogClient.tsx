'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Category, SortOption } from '@/types/product';
import ProductFilter from '@/components/catalog/ProductFilter';

interface CatalogClientProps {
  categories: Category[];
  activeCategory: string;
  sortBy: SortOption;
}

export default function CatalogClient({
  categories,
  activeCategory,
  sortBy,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleCategoryChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('category', id);
    } else {
      params.delete('category');
    }
    router.push(`/catalog?${params.toString()}`);
  }

  function handleSortChange(s: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', s);
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <ProductFilter
      categories={categories}
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
      sortBy={sortBy}
      onSortChange={handleSortChange}
    />
  );
}
