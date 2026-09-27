# Technical Stack

---

## Overview

The stack was chosen using three criteria, in order of priority:
1. **Performance on mid-range Brazilian devices** (Android, 2–4GB RAM)
2. **Guaranteed offline-first** — zero network dependencies for the main flow
3. **Productivity and code quality** — a familiar stack that enables fast iteration and consistent test coverage

---

## Stack by Layer

### Frontend

| Layer | Technology | Version | Justification |
|--------|-----------|--------|---------------|
| Framework | **Next.js** (`output: 'export'`) | 15.x | Generates pure static HTML — no Node.js server; deployed on Cloudflare Pages; App Router with client components for Dexie |
| Language | **TypeScript** strict | 5.x | Type safety across the whole codebase; `strict: true` eliminates entire classes of bugs |
| CSS | **Tailwind CSS** | 4.x | Utility CSS with design tokens via `@theme`; zero runtime; automatic purge minimizes the CSS bundle |
| Currency formatting | `Intl.NumberFormat` | Native | `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` — zero external dependency |

### Storage

| Technology | Use | Justification |
|-----------|-----|---------------|
| **Dexie.js** | IndexedDB wrapper | Ergonomic transactions, schema migrations, reactive `liveQuery` for automatic View updates; best-maintained in its category |
| **localStorage** | User preferences (theme, simple settings) | Only for small, non-critical data |

### Service Worker

| Technology | Use | Justification |
|-----------|-----|---------------|
| **Workbox** | Declarative caching strategies | Avoids common manual-caching bugs; battle-tested strategies (StaleWhileRevalidate, CacheFirst, NetworkFirst) |

### Barcode Scan (V1)

| Technology | Use | Justification |
|-----------|-----|---------------|
| **BarcodeDetector API** | Native scanning (Android Chrome) | Zero external library; hardware-accelerated; available in Chrome 83+ |
| **ZXing.js** (fallback) | Browsers without BarcodeDetector | Works in 100% of browsers; ~300KB but lazy loaded |

### Product Catalog (V0 + V1)

| Technology | Use | Justification |
|-----------|-----|---------------|
| **Bundled static JSON** | ~5,000 common BR products | Zero latency, works offline; lazy loaded when the form opens |
| **Open Food Facts API** | EAN lookup (online) | Free, 6M+ products, includes Brazilian products with nutrition data |
| **IndexedDB** (local cache) | Already-seen products | Subsequent lookups of the same EAN need no network |

### Charts / Analytics (V1)

| Technology | Use | Justification |
|-----------|-----|---------------|
| **Inline SVG** | Simple charts (bars, lines) | Zero dependency; V0/V1 data is simple enough |
| **Chart.js** (optional V2) | Richer charts | Lazy-loaded only when the analytics screen opens; ~200KB acceptable |

### Backend (V2)

| Technology | Use | Justification |
|-----------|-----|---------------|
| **Cloudflare Workers** | SEFAZ proxy (NF-e) | Stateless, edge computing, zero storage of tax data, LGPD compliance |
| **Cloudflare Workers** | Crowd-sourced pricing API | Global scale, low latency for BR users |
| **Cloudflare D1 or Turso** | Shared pricing database | Serverless SQLite; zero cost at initial scale |

---

## Service Worker — Caching Strategies

```
Resource                          Strategy                Cache TTL
───────────────────────────────────────────────────────────────────
HTML (index.html)                StaleWhileRevalidate    —
CSS / JS (app shell)              StaleWhileRevalidate    —
Images / icons                    CacheFirst              30 days
produtos-br.json (catalog)        CacheFirst              permanent
Open Food Facts API               NetworkFirst + fallback 24 hours
SEFAZ proxy                       NetworkFirst (no cache) —
```

**Silent update**: When a new version of the app is available, the SW installs
in the background without interrupting the session. A discreet "Update" toast is shown
to the user at a convenient moment (when opening a new tab or returning to the home screen).

---

## Performance — Targets and Strategies

### Targets

| Metric | Target | Condition |
|---------|------|----------|
| TTI (Time to Interactive) | < 3s | Mid-range Android, 4G |
| TTI with cache | < 1s | Repeat visits |
| Functional | < 5s | 3G (average in-store signal) |
| Functional offline | 0ms | IndexedDB always local |

### Strategies

- **`next/dynamic` with `ssr: false`**: Heavy components (autocomplete, scanner) loaded lazily
- **`output: 'export'`**: No Next.js server runtime — pure static HTML served via CDN
- **Tailwind CSS with automatic purge**: Final CSS ~5–15KB (only classes used in the build)
- **Virtual list**: For lists with 50+ items, render only visible items (+ buffer via `react-virtual`)
- **`produtos-br.json` catalog via `next/dynamic`**: Loaded only when `AutocompleteInput` mounts
- **`inputmode="decimal"`**: Native numeric keyboard with no extra JavaScript
- **`Intl.NumberFormat` instantiated once**: Create the instance in the `currency.ts` module and reuse it

---

## Target Devices

### Hardware Profile (Brazilian mid-range)

| Characteristic | Target | Reality |
|---------------|------|-----------|
| OS | Android 10+ | 60% of the Brazilian Android market |
| RAM | 3–4 GB | Motorola Moto G, Samsung Galaxy A |
| CPU | Snapdragon 4xx/6xx | Mid-range ARM |
| Available storage | ~1 GB free | Conservative estimate |
| Browser | Chrome 90+ | ~80% of BR mobile traffic |

### Graceful Degradation

| API | Behavior without support |
|-----|--------------------------|
| `BarcodeDetector` | Scan button hidden; manual entry always available |
| `navigator.vibrate` | No haptics; no functional degradation |
| `navigator.storage.persist()` | Warning about possible data loss; works normally |
| `Background Sync` | Local queue persists; drains on next app open |
| CSS Grid | Falls back to Flexbox |

---

## Security and LGPD

### Local Data Model

- **V0/V1**: All data stays on the device (IndexedDB), no transmission
- **V2**: Sharing of pricing data is opt-in with explicit consent
- **NF-e**: Tax receipt data is **never** transmitted to external servers

### HTTPS

Required for Service Workers — without HTTPS, the PWA does not work. All hosting
must have TLS enabled (Cloudflare Pages or similar provides it automatically).

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  connect-src 'self'
    https://world.openfoodfacts.org
    https://nfe.supermercadobrasil.app;
  img-src 'self' data: blob: https://static.openfoodfacts.org;
  style-src 'self' 'unsafe-inline';
```

### Sensitive Data — Checklist

- [ ] No PII (CPF, e-mail, name) in localStorage or IndexedDB (V0/V1)
- [ ] No third-party analytics tracking
- [ ] Privacy policy in PT-BR before any data collection
- [ ] NF-e data in a separate store with explicit access control
- [ ] Granular opt-in per data type (prices, store, location)

---

## PWA Manifest

```json
{
  "name": "Supermercado Brasil",
  "short_name": "SupBrasil",
  "description": "Controle seus gastos no supermercado em tempo real",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#2e7d32",
  "lang": "pt-BR",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**`display: standalone`**: Removes Chrome's address bar when installed as a PWA —
giving the native-app experience without installing anything.

**`orientation: portrait`**: Locks out landscape orientation — the one-handed layout is
designed for portrait; landscape would break the thumb zone.

---

## Deployment Infrastructure (V0)

| Component | Service | Cost |
|-----------|---------|-------|
| Static hosting | Cloudflare Pages | Free |
| CDN + HTTPS | Cloudflare (included) | Free |
| CI/CD | GitHub Actions | Free |
| Domain | Cloudflare Registrar | ~R$ 70/year |

**V0 needs no backend**. All initial infrastructure cost is zero.
