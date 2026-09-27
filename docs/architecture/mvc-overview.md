# MVC Architecture — Overview

---

## Core Principles

| Layer | Technology | Responsibility | Golden Rule |
|--------|-----------|-----------------|---------------|
| **Model** | TS interfaces + Dexie.js | Type definitions and IndexedDB schema | No business logic |
| **View** | React components (Next.js) | Rendering, visual states, gestures | No direct database access |
| **Controller** | Singleton TS modules | Mutations, validations | Single source of changes |
| **Hook** | Custom hooks (`useLiveQuery`) | Bridge between Dexie and React components | Only liveQuery wrappers |

**Unidirectional flow**:
```
Component → Controller → IndexedDB (Dexie) → useLiveQuery (hook) → Component
```

The component never writes directly to the database.
The database notifies the component via `useLiveQuery` — the only update channel for the View.
Controllers know nothing about React; hooks know nothing about business logic.

---

## Main Flow — Adding an Item

```
[User taps FAB]
        │
        ▼
[View: item-form-sheet opens]         ← bottom sheet animation
[View: auto-focus on the name field]
[View: suggestions from history/catalog appear as the user types]
        │
        ▼ (user fills in name, qty, price)
[View: lineTotal preview updates in real time]  ← optimistic UI
        │
        ▼ (tap on "Add")
[ItemFormSheet calls: ListItemController.addItem(listId, formData)]
        │
        ▼
[Controller: validates inputs]
[Controller: computes lineTotal = qty × price]
[Controller: assigns position (gap encoding)]
[Controller: writes to IndexedDB via Dexie]
[Controller: calls ShoppingListController.recomputeTotals(listId)]
        │
        ▼
[ShoppingListController: sums all lineTotals]
[ShoppingListController: updates totalCost + checkedTotal on the list]
        │
        ▼
[Dexie liveQuery detects change in listItems + shoppingList]
        │
        ▼
[useLiveQuery re-runs → new snapshot delivered to the component]
[React re-renders: item appears with fade-in via Tailwind class]
[StickyTotalFooter re-renders with pulse animation]
[ItemFormSheet: closes via local state (useState)]
```

**Why this is correct offline**: IndexedDB is always local. There is no step
that depends on the network. The View never waits for a server response.

---

## Screen Inventory

| ID | Route | Description | Usage Frequency |
|----|------|-----------|------------------|
| `lists-screen` | `/` | Home: all active lists | Low (1x per app visit) |
| `list-detail-screen` | `/lista/:id` | Active shopping session | **High** (main use) |
| `item-form-sheet` | modal bottom sheet | Add / edit item | **Very high** (per item purchased) |
| `budget-setup-sheet` | modal bottom sheet | Set budget goal | Low |
| `list-settings-sheet` | modal bottom sheet | Rename, archive, delete | Low |
| `analytics-screen` | `/analytics` (V1) | Spending evolution charts | Medium |
| `settings-screen` | `/configuracoes` | App settings | Low |
| `barcode-scan-screen` | `/scanner` (V1) | Camera + BarcodeDetector | High (V1) |
| `nfe-scan-screen` | `/nfe` (V2) | QR code scan for the tax receipt | Medium (V2) |

The `list-detail-screen` is where the user spends 90%+ of their usage time. All design
and performance investment goes primarily into this screen.

---

## Component Hierarchy — Main Screen

```
<ListDetailScreen>                        ← src/app/lista/[id]/page.tsx
  ├── <ListHeader>
  │     ├── [back button] [list name] [overflow menu]
  │     └── <BudgetProgressBar>           ← visible if a budget is set
  │
  ├── <ItemList>
  │     ├── <UncheckedSection>
  │     │     └── <ItemRow> × N           ← sorted by position ASC
  │     └── <CheckedSection>              ← collapsed by default
  │           └── <ItemRow checked> × M
  │
  ├── <StickyTotalFooter>                 ← ALWAYS visible, fixed at the bottom
  │     ├── "In cart: R$ X.XX"
  │     ├── "Total: R$ X.XX"
  │     └── "Remaining: R$ X.XX"          ← if a budget is set
  │
  └── <FabAddItem>                        ← opens <ItemFormSheet>
```

---

## `<ItemRow>` Component (the most interactive one in the app)

```
<ItemRow>
  └── <SwipeContainer>
        ├── [green background — check]     ← appears on right swipe
        ├── [red background — delete]      ← appears on left swipe
        └── <div> (item-content)
              ├── <button> check-circle  ← min-h/w 48px (thumb zone)
              ├── <p> item-name          ← text-base, flex-1
              ├── <p> item-unit-price    ← price/unit, text-sm text-gray-500
              └── <span> item-line-total ← text-base font-medium, text-right
```

Tapping the price/quantity area: opens an inline edit overlay with a stepper.
Tapping the name: opens `<ItemFormSheet>` for full editing.

---

## Controller Inventory

| Controller | Responsibility | Main Methods |
|------------|-----------------|-------------------|
| `ShoppingListController` | List CRUD + totals | `createList`, `renameList`, `setBudgetGoal`, `archiveList`, `deleteList`, `recomputeTotals` |
| `ListItemController` | Item CRUD + toggleCheck | `addItem`, `updateItem`, `toggleCheck`, `deleteItem`, `updateQuantity` |
| `AutocompleteController` | Product name suggestions | `getSuggestions`, `buildLocalIndex`, `loadBundledCatalog` |
| `PriceComparisonController` | Best-price calculator | `calcPricePerUnit`, `comparePrices`, `suggestBestValue` |
| `OfflineQueueController` | Sync queue (V0 stub) | `enqueue`, `processQueue`, `clearQueue` |
| `ProductController` | EAN lookup + Open Food Facts (V1) | `lookupByBarcode`, `recordPriceObservation` |
| `AnalyticsController` | Aggregation for charts (V1) | `getWeeklyTotals`, `getMonthlyTotals`, `getYearlyTotals`, `getCategoryBreakdown` |
| `NfeController` | Parsing + fetching of tax receipts (V2) | `parseQrCode`, `fetchReceipt`, `importReceiptToList` |

**Note**: There is no `AppController` — the Next.js bootstrap is done in `layout.tsx` (Service Worker registration via `useEffect`) and routing is natively managed by the App Router.

---

## V1 Extension Point: Autocomplete

The `AutocompleteController` has two data sources, queried in cascade:

```
[User types in the name field]
         │
         ▼
[1. IndexedDB: items from the user's previous lists]
         │ (fastest, offline, personalized)
         │
         ▼ (if few suggestions)
[2. Bundled catalog: list of ~5,000 BR products in memory]
         │ (zero latency, zero internet, bundled with the app)
         │
         ▼ (V1: if still no match)
[3. Open Food Facts API — search by name/text]
         │ (requires internet, caches result)
```

The bundled catalog is a gzip-compressed JSON with the most common products in
Brazilian retail: rice, beans, pasta, oils, well-known brands (Boa Vita, Tio João,
Camil, Sadia, Friboi, etc.). Estimate: ~5k entries, ~200KB compressed.

---

## V1 Extension Point: Package Comparison

`PriceComparisonController.calcPricePerUnit()` is called whenever an item has
`unitPrice > 0` and `unit != 'un'`:

```javascript
// Reference units for normalization
REFERENCIA = {
  kg:  { ref: 'kg',  fator: 1      },
  g:   { ref: 'kg',  fator: 0.001  },  // → R$/kg
  L:   { ref: 'L',   fator: 1      },
  ml:  { ref: 'L',   fator: 0.001  },  // → R$/L
  un:  { ref: 'un',  fator: 1      },
  cx:  { ref: 'un',  fator: 1      },
  pct: { ref: 'pct', fator: 1      },
}

pricePerUnit = unitPrice / (quantity × fator)
```

The View displays this value as secondary text below the item name:
`"Soybean Oil 900ml — R$ 9.99 · R$ 11.10/L"`

---

## V1 Extension Point: Analytics

The `AnalyticsController` aggregates data from IndexedDB with no network calls at all.
All archived and active lists are the source of truth for the charts.

The `analytics-screen` renders charts using only inline SVG (no heavy charting
library) or, if greater visual richness is needed, Chart.js via CDN lazy-loaded
only when the screen is opened.

---

## V2 Extension Point: NF-e

```
[User opens nfe-scan-screen]
         │
         ▼
[BarcodeDetector reads QR code]
         │
         ▼
[NfeController.parseQrCode(qrContent)]
→ extracts chaveNfe (44 digits) from the QR URL
→ determines the state (UF) from digits 3–4 of the key
         │
         ▼
[NfeController.fetchReceipt(chaveNfe)]
→ calls proxy: https://nfe.supermercadobrasil.app/sefaz/{uf}/{chave}
→ proxy forwards to the correct state's SEFAZ endpoint
→ returns the tax receipt's XML/JSON
→ persists to the receipts store (IndexedDB)
         │
         ▼
[NfeController.importReceiptToList(receiptId, listId)]
→ parses NF-e fields: xProd (name), qCom (qty), vUnCom (unit price)
→ creates ListItems via ListItemController.addItem() in batch
→ priceSource = 'nfe' on each item
```

The proxy is the only component that needs a server in V2. It is stateless — it stores
nothing, it just proxies the call to SEFAZ with the correct CORS header.

---

## File Structure

```
src/
├── app/                        ← Next.js App Router
│   ├── layout.tsx              ← RootLayout: providers, PWA metadata
│   ├── page.tsx                ← lists-screen (home)
│   ├── lista/[id]/page.tsx     ← list-detail-screen
│   ├── configuracoes/page.tsx  ← settings-screen
│   └── globals.css             ← Tailwind @import + @theme tokens
│
├── components/                 ← Reusable React components
│   ├── AppHeader.tsx
│   ├── BottomNavBar.tsx
│   ├── ListCard.tsx
│   ├── ItemRow.tsx
│   ├── BudgetProgressBar.tsx
│   ├── StickyTotalFooter.tsx
│   ├── ItemFormSheet.tsx
│   ├── BottomSheet.tsx         ← generic reusable container
│   ├── SwipeContainer.tsx      ← swipe gestures
│   ├── AutocompleteInput.tsx   ← input with suggestions
│   └── PriceComparisonBadge.tsx ← "R$ 11.10/L"
│
├── controllers/
│   ├── ShoppingListController.ts
│   ├── ListItemController.ts
│   ├── AutocompleteController.ts   ← V0 (local history + catalog)
│   ├── PriceComparisonController.ts ← V0 (per-unit calculation)
│   ├── OfflineQueueController.ts   ← V0 stub, active in V1+
│   ├── ProductController.ts        ← V1
│   ├── AnalyticsController.ts      ← V1
│   └── NfeController.ts            ← V2
│
├── hooks/                      ← Custom hooks (useLiveQuery wrappers)
│   ├── useShoppingLists.ts
│   ├── useShoppingList.ts
│   ├── useListItems.ts
│   ├── useListTotal.ts
│   └── useAutocomplete.ts
│
├── models/
│   ├── db.ts                   ← Dexie schema (versions 1, 2, 3)
│   ├── ShoppingList.ts         ← interface + factory function
│   ├── ListItem.ts             ← interface + factory function
│   ├── Category.ts             ← scaffold for V1
│   ├── Product.ts              ← V1
│   ├── PriceHistory.ts         ← V1
│   ├── Receipt.ts              ← V2
│   └── SyncQueueItem.ts        ← scaffold for V1+
│
├── utils/
│   ├── currency.ts             ← Intl.NumberFormat pt-BR
│   ├── uuid.ts                 ← crypto.randomUUID + fallback
│   ├── validation.ts           ← shared constants + functions
│   ├── haptics.ts              ← navigator.vibrate wrapper
│   └── units.ts                ← unit conversion and normalization
│
└── data/
    └── produtos-br.json        ← offline catalog of ~5k BR products (V0)
```

The Service Worker is automatically generated by `@ducanh2912/next-pwa` at `public/sw.js` during the build.
Cache strategies are configured in `next.config.ts` via the plugin's options.

---

## Anticipated Technical Challenges

### 1. Bottom sheet + Android keyboard
When the numeric keyboard opens, Chrome in `resize` mode shifts the viewport. Solution:
use `interactive-widget=resizes-visual` in `<meta name="viewport">` and listen for
`visualViewport.resize` to reposition the sheet independently of the viewport layout.

### 2. Swipe vs. Android back gesture
Chrome uses a swipe from the left edge to navigate. Solution: only start swipe detection
when `touchstart.clientX > 20px` from the left edge.

### 3. IndexedDB in private mode
Quota is aggressively limited. Solution: detect with `navigator.storage.persist()` and
show a warning before the user starts using the app in private mode.

### 4. Dexie liveQuery + React
The `useLiveQuery` hook from the `dexie-react-hooks` package automatically manages the subscription lifecycle — it cancels on component unmount. No manual subscription management is needed.

### 5. Bundled BR product catalog
The ~5k product JSON needs to be loaded non-blockingly. Solution: lazy import
of `AutocompleteController`, loaded only when the user opens the add-item form.
