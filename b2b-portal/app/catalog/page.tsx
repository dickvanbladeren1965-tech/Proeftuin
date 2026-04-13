import { Suspense } from 'react';
import type { SortOption } from '@/types/product';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import ProductGrid from '@/components/catalog/ProductGrid';
import CatalogClient from './CatalogClient';

interface CatalogPageProps {
  searchParams: { category?: string; sort?: string };
}

function isValidSortOption(value: string): value is SortOption {
  return ['name-asc', 'name-desc', 'price-asc', 'price-desc'].includes(value);
}

export default function CatalogPage({ searchParams }: CatalogPageProps) {
  const activeCategory = searchParams.category ?? '';
  const rawSort = searchParams.sort ?? 'name-asc';
  const sortBy: SortOption = isValidSortOption(rawSort) ? rawSort : 'name-asc';

  // Filter
  const filtered = activeCategory
    ? PRODUCTS.filter((p) => p.category === activeCategory)
    : PRODUCTS;

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name, 'nl');
      case 'name-desc':
        return b.name.localeCompare(a.name, 'nl');
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="catalog-page">
      <div className="catalog-page__header">
        <h1>Productcatalogus</h1>
      </div>
      <div className="catalog-page__content">
        <Suspense fallback={null}>
          <CatalogClient
            categories={CATEGORIES}
            activeCategory={activeCategory}
            sortBy={sortBy}
          />
        </Suspense>
        <ProductGrid products={sorted} />
      </div>
    </div>
  );
}
