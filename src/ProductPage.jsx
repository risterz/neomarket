import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Heart, RotateCcw, ShoppingBag, Star, Truck } from 'lucide-react';
import { formatPrice, products } from './data.js';
import { formatVariant, getDefaultVariant, getLineId } from './commerce.js';

export function VariantPicker({ product, selected, onChange, cart = [] }) {
  const sizes = [...new Set(product.variants.map((variant) => variant.size))];
  const colors = [...new Set(product.variants.map((variant) => variant.color))];
  const reserved = selected
    ? cart.find((item) => item.lineId === getLineId(product.id, selected.id))?.quantity || 0
    : 0;
  const available = Math.max(0, (selected?.stock || 0) - reserved);

  return (
    <div className="variant-picker">
      <fieldset>
        <legend>Color: <strong>{selected?.color}</strong></legend>
        <div className="variant-options">
          {colors.map((color) => {
            const variant = product.variants.find((item) => item.color === color && item.size === selected?.size)
              || product.variants.find((item) => item.color === color && item.stock > 0);
            return (
              <button type="button" key={color} className={selected?.color === color ? 'selected' : ''} onClick={() => onChange(variant)} aria-pressed={selected?.color === color}>
                {color}
              </button>
            );
          })}
        </div>
      </fieldset>
      {sizes.length > 1 && (
        <fieldset>
          <legend>Size: <strong>{selected?.size}</strong></legend>
          <div className="variant-options">
            {sizes.map((size) => {
              const variant = product.variants.find((item) => item.color === selected?.color && item.size === size);
              return (
                <button type="button" key={size} className={selected?.size === size ? 'selected' : ''} onClick={() => onChange(variant)} disabled={!variant || variant.stock === 0} aria-pressed={selected?.size === size}>
                  {size}{variant?.stock === 0 ? ' — sold out' : ''}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className={`stock ${available === 0 ? 'sold-out' : ''}`} role="status">
        <span />
        {available === 0 ? 'Sold out' : available <= 4 ? `Only ${available} left — ready to ship` : `${available} in stock — ready to ship`}
      </div>
      <span className="variant-name">{formatVariant(selected)}</span>
    </div>
  );
}

export default function ProductPage({ productId, onBack, onOpenProduct, onAdd, favorites, onFavorite, cart }) {
  const product = products.find((item) => item.id === Number(productId));
  const [selected, setSelected] = useState(() => product ? getDefaultVariant(product) : null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setSelected(getDefaultVariant(product));
    setQuantity(1);
    document.title = `${product.name} — NEOMARKET`;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.content;
    if (description) description.content = product.description;
    return () => {
      document.title = 'NEOMARKET — The future, curated.';
      if (description && previousDescription) description.content = previousDescription;
    };
  }, [product]);

  const reserved = product && selected
    ? cart.find((item) => item.lineId === getLineId(product.id, selected.id))?.quantity || 0
    : 0;
  const available = Math.max(0, (selected?.stock || 0) - reserved);
  const related = useMemo(() => product
    ? [...products.filter((item) => item.category === product.category && item.id !== product.id), ...products.filter((item) => item.category !== product.category && item.id !== product.id)].slice(0, 3)
    : [], [product]);

  if (!product) {
    return (
      <main className="product-page section-shell">
        <button className="text-link" onClick={onBack}><ArrowLeft size={18} /> BACK TO SHOP</button>
        <div className="no-results"><h1>Object not found.</h1><p>This product is no longer part of the collection.</p></div>
      </main>
    );
  }

  return (
    <main className="product-page section-shell">
      <button className="text-link product-back" onClick={onBack}><ArrowLeft size={18} /> BACK TO SHOP</button>
      <div className="product-page-layout">
        <div className="product-gallery">
          <img src={product.image} alt={product.name} />
          <span className="product-tag">{product.tag}</span>
          <span className="image-caption">NEOMARKET / OBJECT {String(product.id).padStart(3, '0')}</span>
        </div>
        <section className="product-page-info" aria-labelledby="product-title">
          <span className="eyebrow">{product.category} / {product.color}</span>
          <h1 id="product-title">{product.name}</h1>
          <div className="quick-rating"><Star size={14} fill="currentColor" /> {product.rating} · {product.reviews} reviews</div>
          <div className="quick-price">{formatPrice(product.price)} {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
          <p className="quick-description">{product.description}</p>
          <VariantPicker product={product} selected={selected} onChange={(variant) => { setSelected(variant); setQuantity(1); }} cart={cart} />
          <div className="product-page-actions">
            <div className="quantity" aria-label="Quantity">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((value) => Math.min(available, value + 1))} disabled={quantity >= available} aria-label="Increase quantity">+</button>
            </div>
            <button className="button button-primary" disabled={!selected || available === 0} onClick={() => onAdd(product, quantity, selected)}>
              ADD TO BAG <ShoppingBag size={18} />
            </button>
            <button className={`quick-favorite ${favorites.includes(product.id) ? 'is-favorite' : ''}`} onClick={() => onFavorite(product.id)} aria-label="Toggle wishlist">
              <Heart size={20} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="quick-perks"><span><Truck size={17} /> Free shipping over $150</span><span><RotateCcw size={17} /> 30-day easy returns</span></div>
          <div className="shipping-details"><strong>Delivery and returns</strong><p>Ships in 1–2 business days. Delivery takes 3–5 business days. Return unused items within 30 days.</p></div>
          <ul className="product-details">{product.details.map((detail) => <li key={detail}><Check size={15} /> {detail}</li>)}</ul>
        </section>
      </div>
      {related.length > 0 && (
        <section className="related-products">
          <span className="eyebrow">KEEP EXPLORING</span>
          <h2>Related objects.</h2>
          <div className="related-grid">
            {related.map((item) => (
              <button key={item.id} onClick={() => onOpenProduct(item)}>
                <img src={item.image} alt={item.name} />
                <span>{item.name}</span><strong>{formatPrice(item.price)}</strong>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
