# Supermercado Brasil

> Personal finance tool for people who shop at Brazilian supermarkets.

[![Status](https://img.shields.io/badge/status-planning-yellow)](docs/roadmap.md)
[![Version](https://img.shields.io/badge/version-V0%20MVP-blue)](docs/roadmap.md#v0--mvp-price-logger)

---

## What it is

Supermercado Brasil is an offline-first PWA (Progressive Web App) that shows the
running total of your purchase **in real time** as you walk through the store aisles.

In a country where food prices rise every week, the app puts the power of
information in the hands of those who need to save the most — no sign-up, no
mandatory internet connection, nothing to install.

https://github.com/user-attachments/assets/e8637c91-8dbd-4f43-901f-1cdbeaeff686

---

## The problem it solves

- You put items in the cart without knowing the total
- You get to the checkout and the amount is a (bad) surprise
- Sometimes you have to put products back while in line
- There's no way to know if a product is more expensive than last week
- You don't know which store is cheapest for **your** products

---

## Documentation

| Document | Description |
|-----------|-----------|
| [Product Vision](docs/product-vision.md) | Problem, personas, value proposition, positioning |
| [Competitive Analysis](docs/competitive-analysis.md) | App landscape map, market gaps, opportunities |
| [Business Rules](docs/business-rules.md) | BR-01 to BR-28: all rules and validations |
| [UX Guidelines](docs/ux-guidelines.md) | UX-01 to UX-26: one-handed use, thumb zone, micro-interactions |
| [Roadmap](docs/roadmap.md) | V0 → V1 → V2: features and success criteria |
| [MVC Architecture](docs/architecture/mvc-overview.md) | Data flow, screen and controller inventory |
| [Data Model](docs/architecture/data-model.md) | Entities, fields, IndexedDB schema |
| [Technical Stack](docs/architecture/technical-stack.md) | Chosen technologies and rationale |

---

## Versions

| Version | Name | Status | Goal |
|--------|------|--------|----------|
| **V0** | Price Tracker | 🟡 In development | Real-time total, 100% offline |
| **V1** | Barcode Scanning | ⬜ Planned | Price history, variation alerts |
| **V2** | NF-e + Comparison | ⬜ Planned | Price transparency, maximum savings |

---

## Non-Negotiable Principles

1. **Offline-first**: works inside the store, even without a signal
2. **One hand only**: all primary actions in the lower third of the screen
3. **Total always visible**: sticky footer with the total never disappears
4. **Zero friction**: no mandatory screen before you start using it
5. **Real savings**: every feature must help the user spend less

---

## For Developers

```bash
# Clone the repository
git clone https://github.com/seu-usuario/supermercado-brasil
cd supermercado-brasil

# Planned project structure (V0)
src/
  models/        # Entities + Dexie schema (IndexedDB)
  controllers/   # Business logic
  views/         # Web Components + screens
  utils/         # Currency, UUID, validation, haptics
  sw/            # Service Worker (Workbox)
  styles/        # Design tokens + global CSS
  index.html
  manifest.json
```

> **Note**: The code doesn't exist yet. This repository contains only product
> and architecture documentation. See the [Roadmap](docs/roadmap.md) for the current status.
