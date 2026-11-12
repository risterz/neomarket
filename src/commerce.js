import { products } from './data.js';

export const promoCodes = {
  NEO10: { label: '10% off', minimum: 0 },
  SAVE20: { label: '$20 off orders over $200', minimum: 200 },
  FREESHIP: { label: 'Free shipping', minimum: 0 },
};

export const getDefaultVariant = (product) =>
  product.variants.find((variant) => variant.stock > 0) || null;

export const formatVariant = (variant) =>
  [variant?.color, variant?.size && `Size ${variant.size}`].filter(Boolean).join(' / ');

export const getLineId = (productId, variantId) => `${productId}:${variantId}`;

export function normalizeCart(items) {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.id);
    if (!product) return [];
    const variant = product.variants.find((candidate) => candidate.id === item.variant?.id)
      || product.variants.find((candidate) => candidate.color === item.color && candidate.stock > 0)
      || getDefaultVariant(product);
    if (!variant) return [];
    const quantity = Math.min(Math.max(1, Number(item.quantity) || 1), variant.stock);
    return [{ ...product, variant, quantity, lineId: getLineId(product.id, variant.id) }];
  });
}

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function validatePromo(code, subtotal) {
  const normalized = code.trim().toUpperCase();
  const promo = promoCodes[normalized];
  if (!promo) return 'That promo code is not valid.';
  if (subtotal < promo.minimum) return `${normalized} requires a subtotal of at least $${promo.minimum}.`;
  return null;
}

export function getOrderTotals(cart, promoCode = '') {
  const subtotal = roundMoney(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  let discount = 0;

  if (promoCode === 'NEO10') discount = roundMoney(subtotal * 0.1);
  if (promoCode === 'SAVE20' && subtotal >= promoCodes.SAVE20.minimum) discount = Math.min(20, subtotal);

  const shipping = subtotal >= 150 || promoCode === 'FREESHIP' || subtotal === 0 ? 0 : 12;
  const tax = roundMoney((subtotal - discount) * 0.08);
  const total = roundMoney(subtotal - discount + shipping + tax);

  return { subtotal, discount, shipping, tax, total };
}
