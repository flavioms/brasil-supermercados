# Product Roadmap

The product evolves across 3 versions with clear "done" criteria before moving to the next.
Each version delivers independent value — the user doesn't need to wait for V2 to benefit.

---

## Guiding Principle

> Every feature must answer the question: **"does this help the user save money?"**
>
> If the answer is no, or uncertain, the feature is out of scope.

---

## V0 — MVP: Price Logger

**Goal**: A person enters the supermarket, logs items as they put them in the cart,
and knows exactly how much they'll spend before reaching the checkout. Zero surprises. Zero required internet.

### Features

**Shopping List**
- [ ] Create and name a shopping list
- [ ] Edit the name and archive old lists
- [ ] Set a budget goal (optional)
- [ ] View all lists on the home screen

**Adding Items**
- [ ] Add item: name, quantity, unit (un/kg/g/L/ml/cx/pct), unit price
- [ ] **Autocomplete from local history**: as the user types, suggest items from their previous lists
- [ ] **Autocomplete from built-in catalog**: offline list of ~5,000 of the most common Brazilian grocery products (names and brands, bundled with the app), with no internet dependency
- [ ] Edit item inline (name, quantity, price)
- [ ] Quick quantity adjustment with a stepper (+ / −)

**Real-Time Total**
- [ ] **Sticky footer with overall total** — always visible, never disappears ← non-negotiable feature
- [ ] Session subtotal (checked items only / "in cart")
- [ ] Pulse animation when the total changes
- [ ] Budget progress bar (green/amber/red)

**Package Comparison (Best Price Calculator)**
- [ ] Inline calculator: given `price` and `quantity + unit`, displays **price per reference unit** (R$/kg, R$/L, R$/100g, R$/100ml)
- [ ] When adding items from the same category with different units, highlights which is cheaper per unit of measure
- [ ] Example: 900ml oil for R$ 8.99 vs. 2L oil for R$ 18.00 → shows R$ 9.99/L vs. R$ 9.00/L → highlights that the 2L is cheaper per liter

**Checking and Organization**
- [ ] Swipe right to mark item as "in cart"
- [ ] Swipe left to delete item
- [ ] Checked items collapse to the end of the list (not removed)

**PWA and Offline**
- [ ] 100% functional offline (IndexedDB + Service Worker)
- [ ] Installable via "Add to Home Screen" (manifest.json)
- [ ] Discreet notice when offline
- [ ] Warning about data loss in incognito mode

**V0 success criteria**:
> A user completes a shopping trip from start to finish without needing internet,
> knows the exact total before reaching the checkout, and can operate the entire app with their thumb.

---

## V1 — Barcode Scanning + Price Intelligence

**Goal**: Eliminate manual typing of product names and start building the
price history that enables alerting the user to variations — "this product is
R$ 2.50 more expensive than last time".

### Features

**Barcode Scanning**
- [ ] Camera scanner using the native `BarcodeDetector` API (Chrome/Android)
- [ ] Fallback to ZXing.js on browsers without native support
- [ ] Look up local cache (IndexedDB) first — no internet needed for previously seen products
- [ ] Fallback to the Open Food Facts API for new products
- [ ] Pre-fill the form: name, brand, default unit, last known price
- [ ] Feature detection: scan button hidden if API unavailable; manual entry always works

**Price History and Alerts**
- [ ] Price history per product: `{ EAN, price, unit, date, list/store name }`
- [ ] **Variation alert**: "You bought this item for R$ X.XX on [date]. Today it's R$ Y.YY (+Z%)"
- [ ] Visual alert (badge) when adding a product priced higher than its history
- [ ] History stored locally in V1

**Package Comparison — Enhanced**
- [ ] Automatic normalization via EAN: when scanning two packages of the same product (different sizes), suggests which is cheaper per reference unit
- [ ] Comparison history saved per category

**Categorization**
- [ ] Automatic categories via Open Food Facts (`categoryId` on the item)
- [ ] Categories: Dairy, Meats, Produce, Cleaning, Personal Care, Grocery, Beverages, Bakery, Deli, Other

**Spending Evolution Charts**
- [ ] **Weekly** spending chart: total per day of the week over the last 7 days
- [ ] **Monthly** spending chart: total per week in the current month vs. previous month
- [ ] **Annual** spending chart: total per month over the last 12 months
- [ ] Highlight: "You spent X% more/less than the same period before"
- [ ] Breakdown by category (how much on meats, dairy, cleaning, etc.)
- [ ] Export report (JSON or CSV) for external financial tracking

**V1 success criteria**:
> A user is alerted to at least 1 price variation during a shopping trip,
> and can add 10 items via scan in under 2 minutes.

---

## V2 — NF-e + Price Comparison (Real Savings Tool)

**Goal**: Transform the app into a collective consumer advocacy tool —
price transparency using the mandatory fiscal data that stores already
issue, but no app uses.

### Features

**NF-e Import (Electronic Fiscal Invoice)**
- [ ] Scan the fiscal receipt QR code (NFC-e/NF-e) — **exclusive differentiator in the Brazilian market**
- [ ] Automatic import: all purchase items with real prices from the fiscal invoice
- [ ] Option: import into the active list or create a new list from the receipt
- [ ] Fiscal receipt history (local, never leaves the device — LGPD)
- [ ] Serverless proxy for SEFAZ (one Cloudflare Worker per state, stateless)

**Price Comparison**
- [ ] **"Which store is cheapest for my list?"** — before leaving home
- [ ] Store ranking by estimated savings for the user's active list
- [ ] **"This product is R$ X.XX cheaper at [Store Y], X km away"** — in the aisle
- [ ] Anonymous crowd-sourced data with explicit opt-in
- [ ] Comparison by city and state

**Proactive Alerts**
- [ ] "Your 5 most-purchased products rose by an average of X% this month"
- [ ] "Atacadão is X% cheaper than Carrefour for your list this week"
- [ ] Promotion alert: when a historically expensive product drops below average

**Charts — V2 Additions**
- [ ] Personal inflation chart: variation in your paid prices vs. the official IPCA-food index
- [ ] "You paid X% more than your city's average for this product"
- [ ] Price heat map by store and product

**V2 success criteria**:
> A user identifies, before leaving home, which store will cost them the least for their
> list. A user imports a complete fiscal receipt in under 30 seconds.

**Expected social impact**:
With aggregated, anonymous data, the app becomes a public price transparency
tool — collectivizing information that today only supermarkets possess.

---

## Out of Scope (all versions)

| Feature | Reason |
|---------|--------|
| Product delivery | iFood and Rappi already solve this better |
| Integrated payment | Regulatory risk, not the core value |
| Household inventory management | Out of Milk solves this; distracts from focus |
| Recipes and ingredients | Cookpad solves this; high complexity |
| Social list sharing | LGPD risk; outside individual use |
| Store coupons and promotions | Requires complex business partnerships |
| Loyalty programs (CPF at checkout) | Sensitive data; out of initial scope |

---

## Technical Dependencies by Version

| Dependency | V0 | V1 | V2 |
|-------------|-----|-----|-----|
| IndexedDB + Dexie.js | ✅ | ✅ | ✅ |
| Service Worker (Workbox) | ✅ | ✅ | ✅ |
| Offline catalog (~5k BR products) | ✅ | — | — |
| BarcodeDetector API / ZXing.js | — | ✅ | ✅ |
| Open Food Facts API | — | ✅ | ✅ |
| Backend (user/sync) | ❌ | Optional | ✅ |
| SEFAZ Proxy (Cloudflare Worker) | — | — | ✅ |
| Crowd-sourcing infrastructure | — | — | ✅ |
