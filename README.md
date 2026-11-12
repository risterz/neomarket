# NEOMARKET

**A modern, responsive e-commerce website template built with React and Vite.**

### [View Live Demo →](https://neomarket-1v5.pages.dev)

A bold storefront with an editorial dark theme, lime accents, and a complete front-end shopping experience. Use it as a portfolio project, storefront prototype, or starting point for a custom e-commerce build.

[![React](https://img.shields.io/badge/React-19-20232a?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Hosted_on-Cloudflare_Pages-f38020?logo=cloudflare&logoColor=white)](https://neomarket-1v5.pages.dev)

## Features

- **Responsive design** — desktop, tablet, and mobile layouts
- **Product discovery** — search, category filters, sorting, and quick views
- **Product details** — shareable URLs, variants, stock limits, and related products
- **Shopping bag** — quantity controls, item removal, and free-shipping progress
- **Wishlist** — favorites saved on the current device
- **Demo checkout** — delivery and payment-form validation with order confirmation
- **Promo codes** — percentage, fixed-value, and free-shipping discounts
- **Order history** — locally saved demo orders with reordering
- **Newsletter form** — email validation and user feedback
- **Accessible interactions** — keyboard-friendly dialogs and reduced-motion support
- **Local media** — product images and hero video included in the project

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19 |
| Build tooling | Vite 6 |
| Styling | Custom CSS |
| Icons | Lucide React |
| Browser testing | Playwright |
| Persistence | Browser `localStorage` |
| Hosting | Cloudflare Pages |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- npm

### Run locally

```bash
# Clone the repository
git clone https://github.com/risterz/neomarket.git
cd neomarket

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the local URL printed by Vite, usually **http://localhost:5173**.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Playwright browser tests |

## Testing

Install Chromium once, build the site, and run the test suite:

```bash
npx playwright install chromium
npm run build
npm test
```

Tests cover the catalog, mobile navigation, cart persistence, product variants, stock limits, promo calculations, demo checkout, order history, browser navigation, video playback, and reduced-motion behavior.

## Project Structure

```text
neomarket/
├── public/
│   ├── favicon.svg
│   └── products/          # Product images and hero video
├── src/
│   ├── App.jsx            # Storefront, cart, checkout, and interactions
│   ├── ProductPage.jsx    # Product details and variant selection
│   ├── commerce.js        # Cart normalization, promotions, and totals
│   ├── data.js            # Demo catalog and inventory
│   ├── main.jsx           # React entry point
│   └── styles.css         # Responsive styles and components
├── tests/                 # Playwright end-to-end tests
├── index.html
├── playwright.config.js
└── vite.config.js
```

## Customization

### Products and media

Edit `src/data.js` to change products, descriptions, prices, images, variants, and inventory. Add media to `public/products/` and reference it with paths such as `/products/your-image.jpg`.

### Branding and styles

Update colors, typography, spacing, and components in `src/styles.css`. Change the page title, meta description, favicon, and web fonts in `index.html`.

### Promotions and totals

Promo codes, shipping thresholds, tax calculations, and order totals are in `src/commerce.js`.

| Demo code | Effect |
| --- | --- |
| `NEO10` | 10% off the subtotal |
| `SAVE20` | $20 off orders over $200 |
| `FREESHIP` | Free shipping |

Orders over **$150** receive free shipping automatically.

## Deployment

The live site is hosted on **Cloudflare Pages** and connected to this GitHub repository.

| Setting | Value |
| --- | --- |
| Repository | [`risterz/neomarket`](https://github.com/risterz/neomarket) |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Live website | **[neomarket-1v5.pages.dev](https://neomarket-1v5.pages.dev)** |

Pushing to `main` triggers a production deployment. Other branches can create preview deployments.

To deploy elsewhere, run `npm run build` and publish the generated `dist/` directory. For hosting under a subpath, configure Vite's `base` option and public asset paths accordingly.

## Demo Limitations

> **This is a front-end template, not a production commerce platform.**

- No real payments are processed.
- No customer accounts or authentication are included.
- Cart, wishlist, and demo orders stay in the current browser.
- Inventory and order history are simulated locally.
- Newsletter submissions and contact links are not connected to a backend service.

Before accepting real orders, connect a secure backend, database, inventory service, and hosted payment provider. Prices, discounts, and stock must be validated server-side.

## Credits

- Icons: [Lucide](https://lucide.dev/)
- Fonts: [DM Sans](https://fonts.google.com/specimen/DM+Sans) and [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) via Google Fonts
- Demo photography: Unsplash — replace demo media with appropriately licensed assets before commercial use
