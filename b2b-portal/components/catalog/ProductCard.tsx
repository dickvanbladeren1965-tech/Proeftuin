import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number): string {
  return '€' + price.toFixed(2).replace('.', ',');
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card">
      <span className="product-card__sku">{product.sku}</span>
      <h2 className="product-card__name">{product.name}</h2>
      <p className="product-card__price">
        {formatPrice(product.price)}{' '}
        <span className="product-card__unit">{product.unit}</span>
      </p>
      <span
        className={
          product.inStock
            ? 'product-card__badge product-card__badge--in-stock'
            : 'product-card__badge product-card__badge--out-of-stock'
        }
      >
        {product.inStock ? 'Op voorraad' : 'Niet op voorraad'}
      </span>
      <p className="product-card__min-order">
        Min. bestelling: {product.minOrderQty} {product.unit}
      </p>
      <div className="product-card__actions">
        <button className="product-card__button" type="button" disabled={!product.inStock}>
          Bestellen
        </button>
      </div>
    </div>
  );
}
