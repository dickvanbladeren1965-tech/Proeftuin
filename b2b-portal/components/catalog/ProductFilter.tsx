'use client';

import type { Category, SortOption } from '@/types/product';

interface ProductFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Naam A–Z' },
  { value: 'name-desc', label: 'Naam Z–A' },
  { value: 'price-asc', label: 'Prijs laag–hoog' },
  { value: 'price-desc', label: 'Prijs hoog–laag' },
];

export default function ProductFilter({
  categories,
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: ProductFilterProps) {
  return (
    <div className="product-filter">
      <div className="product-filter__categories">
        <button
          type="button"
          className={activeCategory === '' ? 'product-filter__cat-btn product-filter__cat-btn--active' : 'product-filter__cat-btn'}
          onClick={() => onCategoryChange('')}
        >
          Alle categorieën
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={
              activeCategory === cat.id
                ? 'product-filter__cat-btn product-filter__cat-btn--active'
                : 'product-filter__cat-btn'
            }
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="product-filter__sort">
        <label htmlFor="sort-select" className="product-filter__sort-label">
          Sorteren op:
        </label>
        <select
          id="sort-select"
          className="product-filter__sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
