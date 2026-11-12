# NEOMARKET

### Modern E-commerce Website Template

A bold, responsive storefront template built with **React** and **Vite**. NEOMARKET combines an editorial dark interface with lime accents, immersive product media, and a complete front-end shopping flow.

Use it as a starting point for a design portfolio, storefront prototype, or custom e-commerce project.

---

## Highlights

- **Responsive storefront** — desktop, tablet, and mobile layouts
- **Product discovery** — search, category filters, sorting, and quick views
- **Product pages** — shareable product URLs, variants, stock limits, and related items
- **Shopping bag** — quantities, item removal, and free-shipping progress
- **Wishlist** — persistent favorites on the current device
- **Demo checkout** — delivery details, payment-form validation, and order confirmation
- **Promo codes** — percentage, fixed-value, and free-shipping discounts
- **Order history** — locally stored demo orders with reordering
- **Newsletter form** — email validation and feedback
- **Motion and accessibility** — keyboard-friendly dialogs, reduced-motion support, and accessible controls
- **Local media** — product imagery and hero video served from the project

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19 |
| Build tooling | Vite 6 |
| Styling | Custom CSS |
| Icons | Lucide React |
| Browser tests | Playwright |
| State persistence | Browser localStorage |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- npm

### Run locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
npm test          # Run the Playwright browser test suite
```

## Testing

Install the Chromium browser once, then run the tests:

```bash
npx playwright install chromium
npm run build
npm test
```

The suite covers product variants and stock limits, browser navigation, promo calculations, cart persistence, demo checkout, order history, catalog controls, mobile navigation, product video, and reduced-motion behavior.

## Project Structure

```text
e-commerce/
├── public/
│   ├── favicon.svg
│   └── products/          # Product images and hero video
├── src/
│   ├── App.jsx            # Storefront, cart, checkout, and interactions
│   ├── ProductPage.jsx    # Product details and variant selection
│   ├── commerce.js        # Cart normalization, promos, and totals
│   ├── data.js            # Demo product catalog and inventory
│   ├── main.jsx           # React entry point
│   └── styles.css         # Responsive design system and components
├── tests/                 # Playwright end-to-end tests
├── index.html
├── playwright.config.js
└── vite.config.js
```

## Customization

### Products and inventory

Edit `src/data.js` to change products, descriptions, prices, imagery, variants, and stock. Place new media in `public/products/` and reference it with paths such as `/products/your-image.jpg`.

### Brand and styling

Update colors, typography, spacing, and component styles in `src/styles.css`. Change the page title, description, favicon, and web fonts in `index.html`.

### Promotions and totals

Promo codes, shipping thresholds, tax calculations, and order totals are defined in `src/commerce.js`. These calculations are for demonstration and should be recalculated securely on a backend in a real store.

### Demo promo codes

| Code | Effect |
| --- | --- |
| `NEO10` | 10% off the subtotal |
| `SAVE20` | $20 off orders over $200 |
| `FREESHIP` | Free shipping |

Orders over $150 also receive free shipping automatically.

## Demo Scope

> **This is a front-end website template, not a production commerce platform.**

- No real payments are processed.
- No customer accounts or authentication are provided.
- Cart, wishlist, promo, and demo-order data stay in the current browser.
- Newsletter submissions and contact links are not connected to a service.
- Product inventory and order history are simulated locally.

Before accepting real orders, connect a secure backend, database, inventory service, and hosted payment provider such as Stripe. Never trust client-side prices, discounts, or stock for real transactions.

## Deployment

Build the static site with:

```bash
npm run build
```

Deploy the generated `dist/` directory to services such as Vercel, Netlify, Cloudflare Pages, or GitHub Pages. If hosting under a subpath, configure Vite's `base` option and public asset paths accordingly.

## Acknowledgements

- Interface icons by [Lucide](https://lucide.dev/).
- Fonts: [DM Sans](https://fonts.google.com/specimen/DM+Sans) and [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk), served by Google Fonts.
- Demo product photography sourced from Unsplash. Replace demo media with assets you have the appropriate rights to use before publishing a commercial store.
