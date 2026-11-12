import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown,
  CircleUserRound, CreditCard, Headphones,
  Heart, Instagram, LockKeyhole, Menu, Minus, Package, Pause, Play, Plus, RotateCcw,
  Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Star,
  Tag, Trash2, Truck, Twitter, X, Zap,
} from 'lucide-react';
import { categories, formatPrice, products } from './data.js';
import { formatVariant, getDefaultVariant, getLineId, getOrderTotals, normalizeCart, promoCodes, validatePromo } from './commerce.js';
import ProductPage, { VariantPicker } from './ProductPage.jsx';

function useLocalStorage(key, initialValue, normalize = (stored) => stored) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? normalize(JSON.parse(stored)) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private browser contexts.
    }
  }, [key, value]);

  return [value, setValue];
}

function Logo({ light = false }) {
  return (
    <a href="#top" className={`logo ${light ? 'logo-light' : ''}`} aria-label="Neomarket home">
      <span className="logo-mark">N</span>
      <span>NEO<span>MARKET</span></span>
    </a>
  );
}

function ProductCard({ product, isFavorite, onFavorite, onQuickView, onAdd, onOpenProduct, style }) {
  const inStock = product.variants.some((variant) => variant.stock > 0);
  return (
    <article className="product-card" style={style}>
      <div className="product-image-wrap">
        <button className="image-button" onClick={() => onQuickView(product)} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        </button>
        <span className="product-tag">{product.tag}</span>
        <button
          className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onFavorite(product.id)}
          aria-label={isFavorite ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button className="quick-view" onClick={() => onQuickView(product)}>
          QUICK VIEW <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="rating"><Star size={12} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></span>
        </div>
        <button className="product-name" onClick={() => onOpenProduct(product)}>{product.name}</button>
        <div className="product-bottom">
          <div className="product-price">
            <strong>{formatPrice(product.price)}</strong>
            {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
          </div>
          <button className="add-button" disabled={!inStock} onClick={() => onAdd(product, 1, getDefaultVariant(product))} aria-label={`Add ${product.name} to bag`}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Quantity({ value, onChange, label = 'Quantity', max = Infinity }) {
  return (
    <div className="quantity" aria-label={label}>
      <button onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Decrease quantity"><Minus size={15} /></button>
      <span>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity"><Plus size={15} /></button>
    </div>
  );
}

function Modal({ children, onClose, className = '', label }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll('button:not([disabled]), a, input, select, [tabindex="0"]');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-panel ${className}`} ref={panelRef} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        {children}
      </section>
    </div>
  );
}

function PromoForm({ promoCode, subtotal, onApply }) {
  const [code, setCode] = useState(promoCode);
  const [error, setError] = useState('');
  const inputId = useId();

  useEffect(() => {
    setCode(promoCode);
    setError('');
  }, [promoCode]);

  const submit = (event) => {
    event.preventDefault();
    const message = validatePromo(code, subtotal);
    setError(message || '');
    if (!message) onApply(code.trim().toUpperCase());
  };

  return (
    <div className="promo-form">
      <label htmlFor={inputId}>Promo code</label>
      <div><Tag size={16} /><input id={inputId} value={code} onChange={(event) => { setCode(event.target.value); setError(''); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submit(event); } }} placeholder="NEO10" /><button type="button" onClick={submit}>APPLY</button></div>
      {promoCode && <span className="promo-success" role="status">{promoCode}: {promoCodes[promoCode].label} <button type="button" onClick={() => { setCode(''); onApply(''); }}>Remove</button></span>}
      {error && <span className="form-error" role="alert">{error}</span>}
      {!promoCode && !error && <span className="promo-hint">Try NEO10, SAVE20, or FREESHIP.</span>}
    </div>
  );
}

function CartDrawer({ cart, onClose, updateQuantity, removeItem, onCheckout, promoCode, onApplyPromo }) {
  const { subtotal } = getOrderTotals(cart, promoCode);
  const freeShippingRemaining = Math.max(0, 150 - subtotal);

  return (
    <Modal onClose={onClose} className="cart-drawer" label="Shopping bag">
      <div className="drawer-header">
        <div><span className="eyebrow">YOUR SELECTION</span><h2>Shopping bag <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Close shopping bag"><X /></button>
      </div>
      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><ShoppingBag size={32} /></div>
          <h3>Your bag is feeling light.</h3>
          <p>Explore our latest arrivals and find your next favorite thing.</p>
          <button className="button button-primary" onClick={onClose}>START EXPLORING <ArrowRight size={18} /></button>
        </div>
      ) : (
        <>
          <div className="shipping-progress">
            <p>{freeShippingRemaining > 0 ? <>You’re <strong>{formatPrice(freeShippingRemaining)}</strong> away from free shipping.</> : <><strong>You unlocked free shipping.</strong> Nice one.</>}</p>
            <div><span style={{ width: `${Math.min(100, (subtotal / 150) * 100)}%` }} /></div>
          </div>
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.lineId}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-details">
                  <span className="item-category">{item.category}</span>
                  <h3>{item.name}</h3>
                  <span className="item-color">{formatVariant(item.variant)}</span>
                  <div className="cart-item-bottom">
                    <Quantity value={item.quantity} max={item.variant.stock} onChange={(value) => updateQuantity(item.lineId, value)} label={`Quantity for ${item.name}`} />
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                </div>
                <button className="remove-button" onClick={() => removeItem(item.lineId)} aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <PromoForm promoCode={promoCode} subtotal={subtotal} onApply={onApplyPromo} />
            <div className="cart-subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <p>Shipping and taxes calculated at checkout.</p>
            <button className="button button-primary checkout-button" onClick={onCheckout}>CHECKOUT <ArrowRight size={19} /></button>
            <span className="secure-note"><LockKeyhole size={13} /> Secure checkout · 30-day returns</span>
          </div>
        </>
      )}
    </Modal>
  );
}

function Checkout({ cart, onClose, onComplete, promoCode, onApplyPromo }) {
  const [step, setStep] = useState('details');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const { subtotal, discount, shipping, tax, total } = getOrderTotals(cart, promoCode);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.get('email').includes('@') || !data.get('name').trim() || !data.get('address').trim() || !data.get('city').trim() || !data.get('zip').trim()) {
      setError('Please complete all required fields.');
      return;
    }
    if (data.get('card').replace(/\s/g, '').length < 15 || data.get('expiry').length < 5 || data.get('cvc').length < 3) {
      setError('Please enter valid demo payment details.');
      return;
    }
    setEmail(data.get('email'));
    setError('');
    setStep('processing');
    window.setTimeout(() => {
      const completedOrder = {
        id: `NEO-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        email: data.get('email'),
        items: cart,
        promoCode,
        ...getOrderTotals(cart, promoCode),
      };
      setOrder(completedOrder);
      setStep('success');
      onComplete(completedOrder);
    }, 1200);
  };

  return (
    <Modal onClose={onClose} className="checkout-modal" label="Checkout">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close checkout"><X /></button>
      {step === 'success' ? (
        <div className="success-state">
          <div className="success-icon"><Check size={40} strokeWidth={2} /></div>
          <span className="eyebrow">ORDER CONFIRMED</span>
          <h2>You’re all set.</h2>
          <p>Thanks for your demo order. A confirmation has been prepared for <strong>{email}</strong>.</p>
          <div className="order-number">DEMO ORDER #{order?.id}</div>
          <button className="button button-primary" onClick={onClose}>BACK TO THE STORE <ArrowRight size={18} /></button>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-form-wrap">
            <Logo />
            <div className="checkout-title"><span className="eyebrow">ALMOST YOURS</span><h2>Checkout</h2><p>Demo checkout. No real payment will be processed.</p></div>
            <form onSubmit={handleSubmit} className="checkout-form">
              <PromoForm promoCode={promoCode} subtotal={subtotal} onApply={onApplyPromo} />
              <h3><span>01</span> Contact & delivery</h3>
              <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
              <div className="form-row">
                <label>Full name<input name="name" type="text" placeholder="Alex Morgan" required /></label>
                <label>Country<select name="country" defaultValue="United States"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option><option>Germany</option><option>France</option></select></label>
              </div>
              <label>Street address<input name="address" type="text" placeholder="123 Neon Street" required /></label>
              <div className="form-row">
                <label>City<input name="city" type="text" placeholder="New York" required /></label>
                <label>ZIP code<input name="zip" type="text" placeholder="10001" required /></label>
              </div>
              <h3><span>02</span> Payment <LockKeyhole size={15} /></h3>
              <div className="demo-notice"><Zap size={16} /> Use any valid-looking details. This is a demo only.</div>
              <label>Card number<div className="input-with-icon"><input name="card" inputMode="numeric" placeholder="4242 4242 4242 4242" maxLength={19} required /><CreditCard size={19} /></div></label>
              <div className="form-row">
                <label>Expiry<input name="expiry" placeholder="12 / 28" maxLength={7} required /></label>
                <label>CVC<input name="cvc" inputMode="numeric" placeholder="123" maxLength={4} required /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary pay-button" disabled={step === 'processing'}>
                {step === 'processing' ? <><span className="spinner" /> PROCESSING DEMO ORDER</> : <>PLACE DEMO ORDER · {formatPrice(total)} <ArrowRight size={18} /></>}
              </button>
              <p className="checkout-terms"><ShieldCheck size={14} /> Protected by 256-bit encryption. Demo only.</p>
            </form>
          </div>
          <aside className="order-summary">
            <span className="eyebrow">IN YOUR BAG</span>
            <h3>Order summary</h3>
            <div className="summary-items">
              {cart.map((item) => (
                <div className="summary-item" key={item.lineId}>
                  <div className="summary-image"><img src={item.image} alt="" /><span>{item.quantity}</span></div>
                  <div><strong>{item.name}</strong><span>{formatVariant(item.variant)}</span></div>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="discount-line"><span>Discount ({promoCode})</span><span>−{formatPrice(discount)}</span></div>}
              <div><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div><span>Estimated tax</span><span>{formatPrice(tax)}</span></div>
              <div className="summary-total"><strong>Total</strong><strong>{formatPrice(total)} <small>USD</small></strong></div>
            </div>
            <div className="summary-promise"><RotateCcw size={20} /><div><strong>Changed your mind?</strong><span>Easy returns within 30 days.</span></div></div>
          </aside>
        </div>
      )}
    </Modal>
  );
}

function HeroVideo() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (event) => setReducedMotion(event.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      video.currentTime = 0;
    } else {
      video.play().catch(() => setPlaying(false));
    }
  }, [reducedMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  return (
    <>
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/products/headphones.jpg"
        aria-label="SonicForm 01 headphones product film"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/products/sonicform-promo.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-controls">
        <span><i className={playing ? 'is-live' : ''} /> PRODUCT FILM / 00:08</span>
        <button onClick={togglePlayback} aria-label={playing ? 'Pause product video' : 'Play product video'} aria-pressed={playing}>
          {playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
      </div>
    </>
  );
}

function QuickView({ product, onClose, onAdd, isFavorite, onFavorite, onOpenProduct, cart }) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(() => getDefaultVariant(product));
  const reserved = cart.find((item) => item.lineId === getLineId(product.id, selected?.id))?.quantity || 0;
  const available = Math.max(0, (selected?.stock || 0) - reserved);

  return (
    <Modal onClose={onClose} className="quick-view-modal" label={product.name}>
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close product view"><X /></button>
      <div className="quick-view-layout">
        <div className="quick-view-image"><img src={product.image} alt={product.name} /><span className="product-tag">{product.tag}</span></div>
        <div className="quick-view-info">
          <span className="eyebrow">{product.category} / {product.color}</span>
          <h2>{product.name}</h2>
          <div className="quick-rating"><span><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></span> {product.rating} · {product.reviews} reviews</div>
          <div className="quick-price">{formatPrice(product.price)} {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
          <p className="quick-description">{product.description}</p>
          <VariantPicker product={product} selected={selected} onChange={(variant) => { setSelected(variant); setQuantity(1); }} cart={cart} />
          <div className="quick-actions">
            <Quantity value={quantity} max={available} onChange={setQuantity} />
            <button className="button button-primary" disabled={!selected || available === 0} onClick={() => { onAdd(product, quantity, selected); onClose(); }}>ADD TO BAG <ShoppingBag size={18} /></button>
            <button className={`quick-favorite ${isFavorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(product.id)} aria-label="Toggle wishlist"><Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="quick-perks"><span><Truck size={17} /> Free shipping over $150</span><span><RotateCcw size={17} /> 30-day easy returns</span></div>
          <button className="text-link full-details-link" onClick={() => onOpenProduct(product)}>FULL PRODUCT DETAILS <ArrowUpRight size={18} /></button>
        </div>
      </div>
    </Modal>
  );
}

function OrderHistory({ orders, onClose, onReorder }) {
  return (
    <Modal onClose={onClose} className="orders-modal" label="Order history">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close order history"><X /></button>
      <span className="eyebrow">YOUR NEOMARKET</span>
      <h2>Order history.</h2>
      {orders.length === 0 ? (
        <div className="empty-state"><Package size={35} /><h3>No demo orders yet.</h3><p>Your completed demo orders will appear on this device.</p></div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <article key={order.id} className="history-order">
              <div className="history-order-heading"><div><strong>#{order.id}</strong><span>{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div><strong>{formatPrice(order.total)}</strong></div>
              <div className="history-items">{order.items.map((item) => <span key={item.lineId}>{item.quantity} × {item.name} <small>{formatVariant(item.variant)}</small></span>)}</div>
              <button className="button button-outline" onClick={() => onReorder(order)}>REORDER <ShoppingBag size={17} /></button>
            </article>
          ))}
        </div>
      )}
      <p className="orders-note">Demo orders are stored only on this device. No real orders are processed.</p>
    </Modal>
  );
}

function App() {
  const [cart, setCart] = useLocalStorage('neomarket-cart', [], normalizeCart);
  const [favorites, setFavorites] = useLocalStorage('neomarket-favorites', []);
  const [orders, setOrders] = useLocalStorage('neomarket-orders', []);
  const [promoCode, setPromoCode] = useLocalStorage('neomarket-promo', '');
  const [selectedProductId, setSelectedProductId] = useState(() => new URLSearchParams(window.location.search).get('product'));
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [category, setCategory] = useState('All products');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState('Featured');
  const [visibleCount, setVisibleCount] = useState(4);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [toast, setToast] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const toastTimer = useRef(null);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory = category === 'All products' || product.category === category;
      const matchesSearch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search.toLowerCase());
      const matchesFavorites = !showFavorites || favorites.includes(product.id);
      return matchesCategory && matchesSearch && matchesFavorites;
    });
    if (sort === 'Price: low to high') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Price: high to low') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'Top rated') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, search, sort, showFavorites, favorites]);

  useEffect(() => setVisibleCount(4), [category, search, showFavorites]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const handleHistory = () => setSelectedProductId(new URLSearchParams(window.location.search).get('product'));
    window.addEventListener('popstate', handleHistory);
    return () => window.removeEventListener('popstate', handleHistory);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = document.querySelector('.hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame;
    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        hero.style.setProperty('--pointer-x', x.toFixed(3));
        hero.style.setProperty('--pointer-y', y.toFixed(3));
      });
    };
    const resetPointer = () => {
      hero.style.setProperty('--pointer-x', 0);
      hero.style.setProperty('--pointer-y', 0);
    };

    hero.addEventListener('pointermove', handlePointerMove);
    hero.addEventListener('pointerleave', resetPointer);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerleave', resetPointer);
    };
  }, []);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  };

  const addToCart = (product, quantity = 1, variant = getDefaultVariant(product)) => {
    if (!variant) return;
    const lineId = getLineId(product.id, variant.id);
    const existingQuantity = cart.find((item) => item.lineId === lineId)?.quantity || 0;
    const allowed = Math.min(quantity, variant.stock - existingQuantity);
    if (allowed <= 0) {
      notify(`No more ${product.name} stock in this variant.`);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.lineId === lineId);
      return existing
        ? current.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + allowed } : item)
        : [...current, { ...product, variant, quantity: allowed, lineId }];
    });
    notify(`${product.name} added to your bag.`);
  };

  const openProduct = (product) => {
    setQuickView(null);
    setSelectedProductId(String(product.id));
    window.history.pushState({}, '', `/?product=${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeProduct = () => {
    setSelectedProductId(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const reorder = (order) => {
    let added = 0;
    const nextCart = [...cart];
    order.items.forEach((orderedItem) => {
      const product = products.find((item) => item.id === orderedItem.id);
      const variant = product?.variants.find((item) => item.id === orderedItem.variant.id);
      if (!product || !variant) return;
      const lineId = getLineId(product.id, variant.id);
      const existing = nextCart.find((item) => item.lineId === lineId);
      const allowed = Math.min(orderedItem.quantity, variant.stock - (existing?.quantity || 0));
      if (allowed <= 0) return;
      if (existing) existing.quantity += allowed;
      else nextCart.push({ ...product, variant, lineId, quantity: allowed });
      added += allowed;
    });
    setCart(nextCart);
    setOrdersOpen(false);
    setCartOpen(true);
    notify(added ? `${added} item${added === 1 ? '' : 's'} added from your order.` : 'Those items are out of stock.');
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const scrollToShop = () => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subscribe = (event) => {
    event.preventDefault();
    if (!newsletterEmail.includes('@')) {
      setNewsletterMessage('Enter a valid email address.');
      return;
    }
    setNewsletterMessage('You’re on the list. Welcome to the future.');
    setNewsletterEmail('');
  };

  return (
    <>
      <div className="announcement" id="top">
        <span><Zap size={13} fill="currentColor" /> FREE SHIPPING ON ORDERS OVER $150</span>
        <span className="announcement-right">NEW SEASON. NEW ENERGY. <a href="#shop">SHOP THE DROP <ArrowUpRight size={13} /></a></span>
      </div>
      <header className="site-header">
        <Logo />
        <nav className={`main-nav ${mobileMenu ? 'mobile-open' : ''}`} aria-label="Main navigation">
          <a href="#shop" onClick={() => { setCategory('All products'); setShowFavorites(false); setMobileMenu(false); }}>Shop <span className="nav-dot" /></a>
          <a href="#shop" onClick={() => { setCategory('Tech'); setShowFavorites(false); setMobileMenu(false); }}>Tech</a>
          <a href="#shop" onClick={() => { setCategory('Style'); setShowFavorites(false); setMobileMenu(false); }}>Style</a>
          <a href="#story" onClick={() => setMobileMenu(false)}>Our world</a>
        </nav>
        <div className="header-actions">
          <div className={`header-search ${searchOpen ? 'is-open' : ''}`}>
            {searchOpen && <input autoFocus value={search} onChange={(event) => { setSearch(event.target.value); scrollToShop(); }} placeholder="Search the future..." aria-label="Search products" />}
            <button className="icon-button" onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearch(''); }} aria-label={searchOpen ? 'Close search' : 'Search'}>{searchOpen ? <X size={20} /> : <Search size={20} />}</button>
          </div>
          <div className="account-wrap">
            <button className="icon-button account-button" onClick={() => setAccountOpen(!accountOpen)} aria-label="Account menu"><CircleUserRound size={21} /></button>
            {accountOpen && (
              <div className="account-menu">
                <span className="eyebrow">YOUR NEOMARKET</span>
                <button onClick={() => { setShowFavorites(true); setAccountOpen(false); setVisibleCount(8); scrollToShop(); }}><Heart size={17} /> Wishlist <span>{favorites.length}</span></button>
                <button onClick={() => { setCartOpen(true); setAccountOpen(false); }}><Package size={17} /> Your bag <span>{cartCount}</span></button>
                <button onClick={() => { setOrdersOpen(true); setAccountOpen(false); }}><RotateCcw size={17} /> Order history <span>{orders.length}</span></button>
                <p>No account needed. Your bag and demo orders are saved on this device.</p>
              </div>
            )}
          </div>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag with ${cartCount} items`}><ShoppingBag size={20} /><span>BAG</span><b key={cartCount}>{cartCount}</b></button>
          <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      {selectedProductId ? (
        <ProductPage productId={selectedProductId} onBack={closeProduct} onOpenProduct={openProduct} onAdd={addToCart} favorites={favorites} onFavorite={toggleFavorite} cart={cart} />
      ) : (
      <main>
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-copy">
            <div className="hero-kicker"><span /><span>INDEPENDENTLY CURATED. FUTURE FOCUSED.</span></div>
            <h1>NOT JUST<br />THINGS.<br /><span>YOUR NEXT<br />CHAPTER.</span></h1>
            <p>Considered objects for a life in motion.<br />Less noise. More of what moves you.</p>
            <a className="button button-primary hero-button" href="#shop">EXPLORE THE COLLECTION <ArrowRight size={19} /></a>
            <div className="hero-proof">
              <div className="avatar-stack"><span>JD</span><span>MK</span><span>AS</span></div>
              <div><div className="proof-stars"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div><span>Loved by 12,000+ good humans.</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-frame"><HeroVideo /><div className="hero-image-overlay" /></div>
            <div className="hero-outline-text" aria-hidden="true">NEO</div>
            <div className="hero-product-label"><span className="eyebrow">OBJECT 001 / AUDIO</span><h2>SonicForm 01</h2><div><strong>$249</strong><button onClick={() => setQuickView(products[0])} aria-label="View SonicForm 01"><ArrowUpRight size={22} /></button></div></div>
            <div className="hero-sticker"><span>GOOD DESIGN.</span><strong>NO BAD<br />VIBES.</strong><Sparkles size={22} /></div>
            <span className="hero-side-note">DESIGNED TO FEEL DIFFERENT</span>
          </div>
          <a href="#shop" className="scroll-cue"><span>SCROLL TO DISCOVER</span><ArrowDown size={16} /></a>
          <div className="hero-index">01 <span>/</span> 04</div>
        </section>

        <div className="ticker" aria-hidden="true"><div className="ticker-track"><div className="ticker-group"><span>CURATED, NOT CROWDED</span><Sparkles /><span>DESIGN WITH INTENT</span><Sparkles /><span>THE FUTURE IS YOURS</span><Sparkles /><span>CURATED, NOT CROWDED</span><Sparkles /><span>DESIGN WITH INTENT</span><Sparkles /><span>THE FUTURE IS YOURS</span><Sparkles /></div><div className="ticker-group"><span>CURATED, NOT CROWDED</span><Sparkles /><span>DESIGN WITH INTENT</span><Sparkles /><span>THE FUTURE IS YOURS</span><Sparkles /><span>CURATED, NOT CROWDED</span><Sparkles /><span>DESIGN WITH INTENT</span><Sparkles /><span>THE FUTURE IS YOURS</span><Sparkles /></div></div></div>

        <section className="shop-section section-shell" id="shop" data-reveal>
          <div className="section-heading">
            <div><span className="eyebrow"><span className="tiny-square" /> FRESH PERSPECTIVES</span><h2>{showFavorites ? 'Your saved objects.' : <>Find your next<br /><span>favorite thing.</span></>}</h2></div>
            <p>A tightly curated mix of tech, style, and everyday<br className="desktop-break" /> objects. Chosen for how they work—and how they feel.</p>
          </div>
          <div className="shop-toolbar">
            <div className="category-tabs" role="group" aria-label="Product categories">
              {categories.map((item) => <button key={item} className={category === item && !showFavorites ? 'active' : ''} onClick={() => { setCategory(item); setShowFavorites(false); }}>{item}</button>)}
            </div>
            <div className="sort-wrap"><SlidersHorizontal size={16} /><select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option><option>Top rated</option></select><ChevronDown size={15} /></div>
          </div>
          {search && <div className="search-result-note">Results for “{search}” <button onClick={() => setSearch('')}><X size={15} /> Clear</button></div>}
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.slice(0, visibleCount).map((product, index) => <ProductCard key={product.id} product={product} style={{ '--card-delay': `${(index % 4) * 80}ms` }} isFavorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onQuickView={setQuickView} onAdd={addToCart} onOpenProduct={openProduct} />)}
            </div>
          ) : (
            <div className="no-results"><Search size={30} /><h3>Nothing here. Yet.</h3><p>Try another search, category, or add something to your wishlist.</p><button className="button button-primary" onClick={() => { setSearch(''); setCategory('All products'); setShowFavorites(false); }}>VIEW ALL PRODUCTS</button></div>
          )}
          {visibleCount < filteredProducts.length && <div className="load-more"><button className="button button-outline" onClick={() => setVisibleCount(filteredProducts.length)}>LOAD MORE OBJECTS <Plus size={17} /></button><span>Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} objects</span></div>}
        </section>

        <section className="feature-section section-shell" id="story" data-reveal>
          <div className="feature-image"><img src="/products/console.jpg" alt="A gaming setup illuminated by purple ambient light" loading="lazy" /><span className="image-caption">AFTER HOURS / VOL. 01</span><button onClick={() => setQuickView(products[4])}><ArrowUpRight size={24} /></button></div>
          <div className="feature-copy"><span className="eyebrow"><span className="tiny-square" /> THE NIGHT SHIFT</span><h2>Your space.<br />Your rules.<br /><span>Your world.</span></h2><p>When the day ends, the good stuff begins. Build a setup that’s entirely yours—one considered object at a time.</p><button className="text-link" onClick={() => setQuickView(products[4])}>MEET NIGHTSTATION X <ArrowUpRight size={18} /></button><div className="feature-stats"><div><strong>4K<span>/120</span></strong><span>ULTRA-SMOOTH PLAY</span></div><div><strong>01<span>TB</span></strong><span>ROOM FOR EVERYTHING</span></div></div></div>
        </section>

        <section className="values-section section-shell" data-reveal>
          <div><Truck /><h3>Fast. Free. On us.</h3><p>Free shipping on orders over $150.<br />No small print. No surprises.</p></div>
          <div><RotateCcw /><h3>Take your time.</h3><p>30 days to make sure it’s right.<br />Easy returns, zero awkwardness.</p></div>
          <div><ShieldCheck /><h3>Built to be kept.</h3><p>Quality checked. People approved.<br />A 2-year warranty on every object.</p></div>
          <div><Headphones /><h3>Real humans. Really.</h3><p>Questions? We’re here 24/7.<br />Good support, without the script.</p></div>
        </section>

        <section className="newsletter section-shell" data-reveal>
          <div className="newsletter-spark" aria-hidden="true">✳</div>
          <div><span className="eyebrow">NO SPAM. JUST GOOD STUFF.</span><h2>Stay in the loop.<br /><span>Skip the noise.</span></h2></div>
          <div className="newsletter-form-wrap"><p>New drops, thoughtful finds, and 10% off your first order.<br />Straight to your inbox, once in a while.</p><form onSubmit={subscribe} className="newsletter-form"><input type="email" placeholder="Your email address" aria-label="Email address" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} required /><button type="submit" aria-label="Subscribe"><ArrowRight /></button></form>{newsletterMessage && <span className="newsletter-message" role="status">{newsletterMessage}</span>}<span className="privacy-note">By subscribing, you agree to our privacy policy. Unsubscribe anytime.</span></div>
        </section>
      </main>
      )}

      <footer className="site-footer">
        <div className="footer-main section-shell"><div className="footer-brand"><Logo light /><p>Less noise. More good things.<br />Objects for your next chapter.</p><div className="social-links"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a><a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={18} /></a></div></div><div className="footer-links"><div><h3>SHOP</h3><a href="#shop" onClick={() => setCategory('All products')}>All products</a><a href="#shop" onClick={() => setCategory('Tech')}>Tech</a><a href="#shop" onClick={() => setCategory('Audio')}>Audio</a><a href="#shop" onClick={() => setCategory('Style')}>Style</a></div><div><h3>ABOUT</h3><a href="#story">Our world</a><a href="#story">Our standards</a><a href="mailto:hello@neomarket.example">Contact</a></div><div><h3>HELP</h3><a href="mailto:hello@neomarket.example">Shipping & delivery</a><a href="mailto:hello@neomarket.example">Returns & exchanges</a><a href="mailto:hello@neomarket.example">FAQ</a></div></div></div>
        <div className="footer-bottom section-shell"><span>© 2026 NEOMARKET. GOOD THINGS, AHEAD.</span><span>MADE WITH INTENTION <span className="lime">✳</span></span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BACK TO TOP <ArrowUpRight size={14} /></button></div>
      </footer>

      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} updateQuantity={(lineId, quantity) => setCart((current) => current.map((item) => item.lineId === lineId ? { ...item, quantity: Math.min(item.variant.stock, quantity) } : item))} removeItem={(lineId) => setCart((current) => current.filter((item) => item.lineId !== lineId))} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} promoCode={promoCode} onApplyPromo={setPromoCode} />}
      {checkoutOpen && <Checkout cart={cart} onClose={() => setCheckoutOpen(false)} onComplete={(order) => { setOrders((current) => [order, ...current]); setCart([]); setPromoCode(''); }} promoCode={promoCode} onApplyPromo={(code) => { setPromoCode(code); setCheckoutOpen(false); setCartOpen(true); }} />}
      {ordersOpen && <OrderHistory orders={orders} onClose={() => setOrdersOpen(false)} onReorder={reorder} />}
      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} isFavorite={favorites.includes(quickView.id)} onFavorite={toggleFavorite} onOpenProduct={openProduct} cart={cart} />}
      {toast && <div className="toast" role="status"><Check size={18} /> {toast}<button onClick={() => { setToast(''); setCartOpen(true); }}>VIEW BAG</button></div>}
    </>
  );
}

export default App;
