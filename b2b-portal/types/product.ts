export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  unit: string;          // e.g. "per doos", "per stuk"
  category: string;
  inStock: boolean;
  minOrderQty: number;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
