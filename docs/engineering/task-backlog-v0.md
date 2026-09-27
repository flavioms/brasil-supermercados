# Backlog V0 — MVP

Each task is a unit of work for an agent. Order matters — respect dependencies.
When starting any task, read [`CLAUDE.md`](../../CLAUDE.md) first.

**Status legend**: `[ ]` pending · `[x]` done · `[~]` in progress

---

## Phase 0: Project Setup

### TASK-001 — Initialize Next.js + TypeScript + Tailwind project
**Estimate**: 45 min
**Done criteria**: `npm run lint`, `npm run build`, and `npm test` pass with no errors
**References**: [`setup-tooling.md`](setup-tooling.md)

```bash
npx create-next-app@latest supermercado-brasil \
  --typescript --tailwind --app --src-dir --import-alias "@/*" --no-turbopack
```

After creating the project:
- Update `next.config.ts` with `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`, and the `@ducanh2912/next-pwa` plugin
- Update `tsconfig.json` with `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `exactOptionalPropertyTypes: true`
- Create `eslint.config.mjs` as per `setup-tooling.md`
- Create `.prettierrc` with `prettier-plugin-tailwindcss`
- Create `.editorconfig` and `.gitignore`
- Create `vitest.config.ts` with `environment: 'jsdom'`, React plugin, `@/*` alias
- Create `tests/setup.ts` with `fake-indexeddb/auto` and `@testing-library/jest-dom`
- Create the directory structure: `src/{controllers,hooks,utils,data}` and `tests/unit/{controllers,models,utils,components}`
- Install dependencies: `dexie`, `dexie-react-hooks`, `@ducanh2912/next-pwa`
- Install devDependencies: `vitest`, `@vitest/coverage-v8`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `fake-indexeddb`, `jsdom`, `prettier-plugin-tailwindcss`

---

### TASK-002 — Design tokens and globals.css
**Estimate**: 30 min
**Done criteria**: `text-primary`, `bg-danger`, `min-h-touch`, `text-body` classes work in JSX
**References**: [`coding-standards.md`](coding-standards.md) — Tailwind section, [`ux-guidelines.md`](../ux-guidelines.md)

Update `src/app/globals.css`:
- `@import "tailwindcss"`
- `@theme` block with complete tokens: colors (primary, danger, warning, surface), typography (caption, body, title, headline), spacing (touch: 48px)
- `pulse-quick` animation for the totals footer
- Minimal reset: `box-sizing: border-box`, `font-family: system-ui`, scroll behavior

---

### TASK-003 — PWA: manifest and metadata
**Estimate**: 20 min
**Done criteria**: Lighthouse PWA — "Installable" ✓ after `npm run build`
**References**: [`technical-stack.md`](../architecture/technical-stack.md) — PWA Manifest section

- Create `public/manifest.json` with `name`, `short_name`, `display: standalone`, `orientation: portrait`, `theme_color: #2e7d32`, icons (192, 512, maskable)
- Create placeholder SVG icons in `public/icons/`
- Add PWA metadata in `src/app/layout.tsx`: `<link rel="manifest">`, `<meta name="theme-color">`, `viewport` with `interactive-widget=resizes-visual`
- Register the Service Worker in `layout.tsx` via `useEffect` (client-only)

---

## Phase 1: Models and Database

### TASK-004 — Dexie schema (`src/models/db.ts`)
**Estimate**: 20 min
**Done criteria**: Unit test verifies that the database opens, accepts a record, and returns the correct one
**References**: [`data-model.md`](../architecture/data-model.md) — IndexedDB Schema section

- Create a Dexie instance with `version(1)`: `shoppingLists`, `listItems`, `categories`
- Export the `db` instance as a singleton
- The `db.ts` file is the **only** place where the Dexie instance is created

---

### TASK-005 — Interfaces and factory functions: ShoppingList and ListItem
**Estimate**: 30 min
**Done criteria**: Tests cover creation, default fields, computed `lineTotal`, generated UUID
**References**: [`data-model.md`](../architecture/data-model.md), [`coding-standards.md`](coding-standards.md) — Models section

- `src/models/ShoppingList.ts` — `ShoppingList` interface + `createShoppingList()`
- `src/models/ListItem.ts` — `ListItem` interface, `PriceSource`, `ItemUnit` types + `createListItem()`
- `src/models/Category.ts` — interface + `CATEGORIAS_PADRAO` constant (10 BR categories)

Tests in `tests/unit/models/`

---

### TASK-006 — Utils: currency, uuid, validation, units, haptics
**Estimate**: 45 min
**Done criteria**: Coverage ≥ 90% on utils
**References**: [`business-rules.md`](../business-rules.md) — Validations section

- `src/utils/currency.ts` — `formatBRL(value: number): string` with a single `Intl.NumberFormat` instance
- `src/utils/uuid.ts` — `generateUUID(): string` via `crypto.randomUUID()` with fallback
- `src/utils/validation.ts` — constants `LISTA_NOME_MIN/MAX`, `ITEM_NOME_MIN/MAX`, `ITEM_QUANTIDADE_MIN/MAX`, `ITEM_PRECO_MIN/MAX`, `UNIDADES_VALIDAS`; functions `validateListName()`, `validateItemFields()` return `{ valid: boolean; error: string | null }`
- `src/utils/units.ts` — `calcPricePerRefUnit(unitPrice, quantity, unit): number | null`, `getRefUnit(unit): string | null`, `UNIT_CONVERSION_TABLE`
- `src/utils/haptics.ts` — `hapticFeedback(pattern?: number[]): void` with feature detection

Tests in `tests/unit/utils/`

---

## Phase 2: Hooks (Dexie → React bridge)

### TASK-007 — liveQuery custom hooks
**Estimate**: 30 min
**Done criteria**: Hooks return correct data in tests with React Testing Library + fake-indexeddb
**References**: [`coding-standards.md`](coding-standards.md) — Hooks section

All with `'use client'` at the top and a safe initial value:

- `src/hooks/useShoppingLists.ts` — active lists ordered by `createdAt DESC`
- `src/hooks/useShoppingList.ts` — a single list by id
- `src/hooks/useListItems.ts` — items of a list ordered by `position ASC`
- `src/hooks/useListTotal.ts` — returns `{ totalCost, checkedTotal, budgetGoal }` for a list

---

## Phase 3: Controllers

### TASK-008 — ShoppingListController
**Estimate**: 1h
**Done criteria**: Coverage ≥ 80%; `recomputeTotals` tested with multiple items
**References**: [`business-rules.md`](../business-rules.md) BR-01 to BR-08, BR-17 to BR-19

Required methods:
- `createList(name, budgetGoal?)` → `Promise<string>`
- `renameList(listId, newName)` → `Promise<void>`
- `setBudgetGoal(listId, goal)` → `Promise<void>`
- `archiveList(listId)` → `Promise<void>`
- `restoreList(listId)` → `Promise<void>`
- `deleteList(listId)` → `Promise<void>` (cascades to ListItems — BR-05)
- `recomputeTotals(listId)` → `Promise<void>` (BR-17)

Tests in `tests/unit/controllers/ShoppingListController.test.ts`

---

### TASK-009 — ListItemController
**Estimate**: 1h 30min
**Done criteria**: Coverage ≥ 80%; `recomputeTotals` called after every mutation
**References**: [`business-rules.md`](../business-rules.md) BR-09 to BR-16

Required methods:
- `addItem(input)` → `Promise<string>` — validates, creates, calls `recomputeTotals`
- `updateItem(itemId, changes)` → `Promise<void>` — recalculates `lineTotal`, calls `recomputeTotals`
- `toggleCheck(itemId)` → `Promise<void>` — calls `recomputeTotals`
- `deleteItem(itemId)` → `Promise<void>` — calls `recomputeTotals`
- `updateQuantity(itemId, quantity)` → `Promise<void>` — shortcut for the stepper

**Position gap encoding**:
- Empty list: `position = 1000`
- New item: `position = last.position + 1000`

Tests in `tests/unit/controllers/ListItemController.test.ts`

---

### TASK-010 — PriceComparisonController
**Estimate**: 45 min
**Done criteria**: Coverage ≥ 90%; g→kg, ml→L normalization tested
**References**: [`data-model.md`](../architecture/data-model.md) — conversion table

Methods:
- `calcPricePerUnit(unitPrice, quantity, unit)` → `{ value: number; refUnit: string } | null`
- `comparePrices(items)` → `string | null` (id of the cheapest item)
- `suggestBestValue(item, allItemsInList)` → `{ hasBetter: boolean; betterItemId: string | null }`

Tests in `tests/unit/controllers/PriceComparisonController.test.ts`

---

### TASK-011 — AutocompleteController
**Estimate**: 1h
**Done criteria**: `getSuggestions('arr')` returns suggestions; catalog loaded lazily
**References**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Autocomplete section

Methods:
- `getSuggestions(query, limit?)` → `Promise<Suggestion[]>` — cascade: local history → bundled catalog
- `buildLocalIndex()` — reads distinct items from IndexedDB, keeps them in memory
- `loadBundledCatalog()` — imports `data/produtos-br.json` lazily (dynamic import), caches in memory

Type `Suggestion`: `{ name: string; unit: ItemUnit; lastPrice?: number }`

Tests in `tests/unit/controllers/AutocompleteController.test.ts`

---

### TASK-012 — OfflineQueueController (stub)
**Estimate**: 15 min
**Done criteria**: Methods exist, are typed, do not throw errors

```typescript
export const OfflineQueueController = {
  async enqueue(_entityType: string, _entityId: string, _operation: string, _payload: unknown): Promise<void> {},
  async processQueue(): Promise<void> {},
  async clearQueue(): Promise<void> {},
};
```

---

## Phase 4: Service Worker

### TASK-013 — PWA offline via next-pwa
**Estimate**: 45 min
**Done criteria**: App 100% functional offline after first load; Lighthouse PWA ≥ 90
**References**: [`technical-stack.md`](../architecture/technical-stack.md) — Service Worker section

Configure in `next.config.ts` via `@ducanh2912/next-pwa` options:

```typescript
// Cache strategies to configure:
// - App HTML/JS/CSS: StaleWhileRevalidate
// - Images/icons: CacheFirst (30 days)
// - produtos-br.json: CacheFirst (permanent)
// - Open Food Facts API: NetworkFirst + 24h fallback (V1)
```

Update toast: React component that detects the SW's `waiting` state and shows "New version available" with a refresh button.

---

## Phase 5: React Components

### TASK-014 — `<BottomSheet>` (generic container)
**Estimate**: 1h 30min
**Done criteria**: Opens/closes via `translate-y` with Tailwind; closes with Escape; repositions with Android keyboard
**References**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Technical Challenge #1

```tsx
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}
```

- Animation with Tailwind classes: `translate-y-0` (open) / `translate-y-full` (closed) + `transition-transform`
- Overlay with `backdrop-blur-sm` closes on outside click
- `role="dialog"`, `aria-label={label}`, `aria-modal="true"`
- Listens to `visualViewport.resize` (not `window.resize`) to reposition when the Android keyboard opens
- `useEffect` with `addEventListener('keydown')` to close with Escape

---

### TASK-015 — `<SwipeContainer>` (swipe gestures)
**Estimate**: 2h
**Done criteria**: Swipe right reveals green action; swipe left reveals red action; does not trigger within 20px of the edge
**References**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Technical Challenge #2

```tsx
interface SwipeContainerProps {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  rightLabel: string;
  leftLabel: string;
  children: React.ReactNode;
}
```

Implementation via `useRef` + `touchstart`/`touchmove`/`touchend`:
```tsx
// Ignore swipes that start less than 20px from the left edge
if (touchStartX < 20) return;
```

Transform via `style={{ transform: `translateX(${deltaX}px)` }}` — not via Tailwind (dynamic value).

---

### TASK-016 — `<PriceComparisonBadge>`
**Estimate**: 20 min
**Done criteria**: Renders "R$ 9.99/L"; hidden when `pricePerRefUnit` is null

```tsx
interface PriceComparisonBadgeProps {
  pricePerRefUnit: number | null;
  refUnit: string | null;
}
```

---

### TASK-017 — `<BudgetProgressBar>`
**Estimate**: 30 min
**Done criteria**: Green < 75%, amber ≥ 75%, red ≥ 100%; hidden without `goal`; tests cover thresholds
**References**: [`business-rules.md`](../business-rules.md) BR-18/BR-19

```tsx
interface BudgetProgressBarProps {
  current: number;
  goal: number | null;
}
```

Use `data-testid="progress-bar"` to simplify selection in tests.

---

### TASK-018 — `<StickyTotalFooter>`
**Estimate**: 45 min
**Done criteria**: Always visible; values formatted with `formatBRL`; "Remaining" line conditional; pulse animation on change
**References**: [`business-rules.md`](../business-rules.md) BR-06/BR-07; [`coding-standards.md`](coding-standards.md)

```tsx
interface StickyTotalFooterProps {
  totalCost: number;
  checkedTotal: number;
  budgetGoal: number | null;
}
```

- `position: sticky; bottom: 0` via `className="sticky bottom-0 ..."`
- Pulse animation: `useEffect` adds an animation class when `totalCost` changes, removes it after 300ms

Tests in `tests/unit/components/StickyTotalFooter.test.tsx`

---

### TASK-019 — `<AutocompleteInput>`
**Estimate**: 1h 30min
**Done criteria**: Suggestions after 2 characters with 150ms debounce; selection fills the field; dismisses on outside tap
**References**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Autocomplete section

```tsx
interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: Suggestion) => void;
  placeholder?: string;
  minChars?: number;
}
```

- `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`
- Maximum of 5 suggestions in the dropdown
- `useRef` to detect outside clicks and close the dropdown

---

### TASK-020 — `<ItemFormSheet>`
**Estimate**: 3h
**Done criteria**: Form validates, real-time `lineTotal` preview; closes on confirm; add and edit modes
**References**: [`business-rules.md`](../business-rules.md) BR-09 to BR-16

```tsx
interface ItemFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  itemId?: string;  // undefined = add mode; defined = edit mode
}
```

Fields:
- Name: `<AutocompleteInput>` — required
- Quantity: `<input type="number" inputMode="decimal">` — min 0.001
- Unit: `<select>` — un/kg/g/L/ml/cx/pct
- Unit price: `<input type="number" inputMode="decimal">` — min 0

Real-time preview:
- `lineTotal` = `qty * price` — updates on every keystroke via local `useState`
- `pricePerRefUnit` — calculated via `PriceComparisonController.calcPricePerUnit()`

On confirm:
- Add mode: calls `ListItemController.addItem()`
- Edit mode: calls `ListItemController.updateItem()`
- In both cases: closes the sheet

---

### TASK-021 — `<ItemRow>`
**Estimate**: 1h 30min
**Done criteria**: Renders name, price, total; swipe works; price/unit badge visible
**References**: [`mvc-overview.md`](../architecture/mvc-overview.md) — ItemRow section

Composition:
- Uses `<SwipeContainer>` — swipe right = `toggleCheck`, swipe left = `deleteItem`
- Shows `<PriceComparisonBadge>` if `pricePerRefUnit !== null`
- Tapping the name: calls `onEditRequest(item.id)`

```tsx
interface ItemRowProps {
  item: ListItem;
  onEditRequest: (itemId: string) => void;
}
```

Tests in `tests/unit/components/ItemRow.test.tsx`

---

### TASK-022 — `<ListCard>`
**Estimate**: 45 min
**Done criteria**: Shows name, total, mini progress bar, relative date
**References**: [`ux-guidelines.md`](../ux-guidelines.md)

```tsx
interface ListCardProps {
  list: ShoppingList;
  onClick: () => void;
}
```

---

## Phase 6: Screens (Next.js pages)

### TASK-023 — `src/app/page.tsx` (home screen — lists)
**Estimate**: 1h 30min
**Done criteria**: Shows active lists via `useShoppingLists`; "New list" button opens creation sheet; empty state with CTA
**References**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Screen Inventory

```
'use client'
→ useShoppingLists() → list of <ListCard>
→ FAB "+" → BottomSheet with new-list form
→ Navigate to /lista/[id] when a card is clicked
```

Empty state: inline SVG illustration + "Create first list" button.

---

### TASK-024 — `src/app/lista/[id]/page.tsx` (main screen)
**Estimate**: 4h
**Done criteria**: Complete flow — add item → check it → see total update; footer always visible; swipe functional
**References**: [`mvc-overview.md`](../architecture/mvc-overview.md) — component hierarchy

This is the most critical screen in the app. 90% of usage happens here.

```
'use client'
→ useParams() to get listId
→ useShoppingList(listId) → list data
→ useListItems(listId) → items split into checked/unchecked
→ <BudgetProgressBar current={list.totalCost} goal={list.budgetGoal} />
→ unchecked section: <ItemRow> × N
→ checked section: collapsed by default, toggle to expand
→ <StickyTotalFooter totalCost checkedTotal budgetGoal />
→ FAB "+" → opens <ItemFormSheet isOpen listId />
```

`generateStaticParams()` returns `[]` — the id is read on the client via `useParams()`.

---

### TASK-025 — `src/app/configuracoes/page.tsx` (settings)
**Estimate**: 45 min
**Done criteria**: Theme toggle works (localStorage); "Delete all data" works with confirmation
**References**: [`business-rules.md`](../business-rules.md) — LGPD-03/LGPD-04

Minimum features:
- Light/dark toggle (saved to `localStorage`)
- "Delete all data" — `window.confirm()` → `db.delete()` + redirect to home
- App version (from `package.json`)

---

## Phase 7: Data

### TASK-026 — BR product catalog (V0 subset)
**Estimate**: 1h 30min
**Done criteria**: `getSuggestions('arr')` returns "Arroz"; `getSuggestions('ole')` returns "Óleo de Soja"

Create `src/data/produtos-br.json` with 200–300 entries covering:
- Grains: rice (1kg/5kg/10kg types), carioca/black beans, pasta, oats
- Oils: soybean 900ml/2L, olive oil, canola
- Dairy: whole/skim/lactose-free milk, mozzarella/prato cheese, butter, yogurt
- Meats: chicken breast, ground beef, calabrese sausage
- Produce: tomato, onion, garlic, potato, carrot, lettuce, banana, orange
- Cleaning: detergent, fabric softener, laundry soap, disinfectant
- Personal care: soap, shampoo, conditioner, toothpaste, toilet paper
- Beverages: 2L soda, juice, mineral water
- Bakery: sliced bread, cream cracker biscuits

Format:
```json
[{ "name": "Arroz Branco Tipo 1 1kg", "unit": "kg", "aliases": ["arroz", "arroz tipo 1"] }]
```

---

## Phase 8: CI/CD and Final Quality

### TASK-027 — GitHub Actions
**Estimate**: 30 min
**Done criteria**: Push to `main` triggers deploy; PR generates a preview URL; lint + tests run in CI
**References**: [`setup-tooling.md`](setup-tooling.md)

Create `.github/workflows/ci.yml` exactly as specified in `setup-tooling.md`.

---

### TASK-028 — PWA + Lighthouse checklist
**Estimate**: 1h
**Done criteria**: Lighthouse PWA ≥ 90; Performance ≥ 70 on the Pixel 5 profile; all items checked

**PWA**
- [ ] Valid, complete manifest
- [ ] Service Worker registered and functional
- [ ] App installable
- [ ] 100% functional offline after first load

**Performance**
- [ ] TTI < 3s on Android 4G profile (Lighthouse DevTools)
- [ ] `produtos-br.json` loaded lazily (not in the initial bundle)
- [ ] No render-blocking in `<head>`

**Accessibility**
- [ ] Touch targets ≥ 48px on all interactive controls
- [ ] Contrast ≥ 4.5:1 (WCAG AA)
- [ ] `BottomSheet` with `role="dialog"` + `aria-label`
- [ ] Buttons without visible text have `aria-label`
- [ ] Works with keyboard navigation (Tab, Enter, Escape)

**LGPD**
- [ ] No personal data in IndexedDB
- [ ] "Delete all data" functional
- [ ] No external third-party tracking

**Security**
- [ ] No `dangerouslySetInnerHTML` with user data
- [ ] HTTPS active on deploy (Cloudflare Pages guarantees this automatically)

---

## Recommended Execution Order

```
TASK-001 → TASK-002 → TASK-003
    ↓
TASK-004 → TASK-005 → TASK-006
    ↓
TASK-007 (hooks — depends on models)
    ↓
TASK-008 → TASK-009 → TASK-010 → TASK-011 → TASK-012
    ↓
TASK-013 (Service Worker — can run parallel with controllers)
    ↓
TASK-014 → TASK-015 (BottomSheet + SwipeContainer — base for the others)
    ↓
TASK-016 → TASK-017 → TASK-018 → TASK-019
    ↓
TASK-020 → TASK-021 → TASK-022
    ↓
TASK-023 → TASK-024 → TASK-025
    ↓
TASK-026 (data — can run parallel with screens)
    ↓
TASK-027 → TASK-028
```

**Critical dependencies**:
- TASK-007 (hooks) depends on TASK-004/005 (models + db)
- TASK-009 (ListItemController) depends on TASK-008 (ShoppingListController)
- TASK-020 (ItemFormSheet) depends on TASK-014 (BottomSheet) and TASK-019 (AutocompleteInput)
- TASK-024 (list-detail-screen) depends on TASK-017, 018, 020, 021
