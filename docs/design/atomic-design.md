# Component Inventory — Atomic Design

Based on the screens in `docs/layout/`. Hierarchy: Atoms → Molecules → Organisms → Templates → Pages.

For visual tokens (colors, sizes, spacing) see [`docs/design/tokens.md`](./tokens.md).
For code patterns (props, hooks, controllers) see [`docs/engineering/coding-standards.md`](../engineering/coding-standards.md).

---

## Overview

```
ATOMS           → primitives with no dependencies on other components
MOLECULES       → 2+ atoms with a single cohesive function
ORGANISMS       → complete sections with multiple molecules
TEMPLATES       → screen structure without real data
PAGES           → templates with data via useLiveQuery
```

Directory structure:
```
src/components/
├── atoms/
├── molecules/
├── organisms/
└── templates/
```

Pages live in `src/app/` (Next.js App Router).

---

## Atoms

Primitives with no dependencies on other components in the project.

---

### `CheckCircle`

**File:** `src/components/atoms/CheckCircle.tsx`

Item selection circle. Two visual states:
- **Idle:** gray outline (`--color-border`), no fill
- **Checked:** green fill (`--color-primary`), white check icon

```typescript
interface CheckCircleProps {
  checked: boolean;
  onToggle: () => void;
  label: string; // required aria-label
}
```

Touch area: `min-w-[var(--size-touch-min)] min-h-[var(--size-touch-min)]` (48×48px).
Visual circle size: 24px with a 2px border.

---

### `PriceBadge`

**File:** `src/components/atoms/PriceBadge.tsx`

Orange pill showing price per reference unit. Displayed only for items with a weighable/volumetric unit (`kg`, `g`, `L`, `ml`).

```typescript
interface PriceBadgeProps {
  pricePerRefUnit: number; // already computed by the controller
  unit: 'kg' | 'L';       // normalized reference unit
}
// Visual example: "R$ 9,99/L"
```

Style: `bg-[var(--color-warning-surface)] text-[var(--color-warning)] rounded-full px-2 py-0.5 text-xs font-medium`.

---

### `ProgressBar`

**File:** `src/components/atoms/ProgressBar.tsx`

Budget progress bar with color that changes dynamically based on percentage.

```typescript
interface ProgressBarProps {
  current: number;
  goal: number | null;
}
// When goal === null: renders null (no bar)
```

Height: `var(--size-budget-bar)` (4px). Gray track (`--color-border`). Rounded fill (`rounded-full`).

Color logic (see `docs/design/tokens.md`):
- `< 80%`: `bg-primary-light`
- `80–99%`: `bg-warning`
- `≥ 100%`: `bg-danger`

---

### `FAB`

**File:** `src/components/atoms/FAB.tsx`

Floating action button. Centered "+" icon.

```typescript
interface FABProps {
  onPress: () => void;
  label: string; // "Add item" or "New list" — for aria-label
}
```

Size: `w-[var(--size-fab)] h-[var(--size-fab)]` (56×56px). Color: `bg-primary`. Shadow: `shadow-fab`. Icon: white `+`, 24px.
Positioning: `absolute bottom-[calc(var(--size-bottom-nav)+var(--spacing-4))] left-1/2 -translate-x-1/2 z-[var(--z-fab)]`.

---

### `SectionLabel`

**File:** `src/components/atoms/SectionLabel.tsx`

Uppercase section label. E.g.: "ACTIVE LISTS", "TO GRAB (5)", "ARCHIVED (3)".

```typescript
interface SectionLabelProps {
  text: string;
  count?: number; // shown in parentheses if provided
}
```

Style: `text-xs font-semibold uppercase tracking-wider text-text-secondary px-4 pt-6 pb-2`.

---

### `IconButton`

**File:** `src/components/atoms/IconButton.tsx`

Generic icon button with a guaranteed minimum touch area.

```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;          // required aria-label
  variant?: 'default' | 'ghost'; // ghost has no background
}
```

Touch area: `min-w-[var(--size-touch-min)] min-h-[var(--size-touch-min)]` (48×48px).
Used in: AppBar back arrow, bottom sheet close (×) button, three-dot menu.

---

### `BottomSheetHandle`

**File:** `src/components/atoms/BottomSheetHandle.tsx`

Gray drag handle at the top of the bottom sheet. Purely visual.

```typescript
// No props
```

Style: `w-[var(--size-sheet-handle-w)] h-[var(--size-sheet-handle-h)] rounded-full bg-border mx-auto mt-3 mb-2`.

---

## Molecules

Compositions of 2+ atoms with a single cohesive function.

---

### `ItemRow`

**File:** `src/components/molecules/ItemRow.tsx`

List item row with swipe support. The most complex component in the app.

```typescript
interface ItemRowProps {
  item: ListItem;
  onToggle: () => void;
  onDelete: () => void;
}
```

**Visual states:**
- **Idle (unchecked):** empty `CheckCircle`, normal name, right-aligned price
- **Checked:** filled green `CheckCircle`, strikethrough name + `text-text-disabled`, strikethrough price
- **Swipe right (reveal "Check"):** green background `bg-primary-light` appears on the left; swipe indicator with a green ✓ icon
- **Swipe left (reveal "Delete"):** red background `bg-danger` appears on the right; white trash icon

**Composition:**
- `CheckCircle` (left)
- Item name (`text-base`) + optional `PriceBadge` + unit/unit price (`text-xs text-text-secondary`)
- Total price (`text-lg font-medium tabular-nums`, right-aligned)

**Dependencies:** `CheckCircle`, `PriceBadge`

---

### `ListCard`

**File:** `src/components/molecules/ListCard.tsx`

Clickable list card on the home screen.

```typescript
interface ListCardProps {
  list: ShoppingList;
  onClick: () => void;
}
```

**Layout:**
```
┌──────────────────────────────────┐
│ Carrefour Semanal      R$ 234,90 │ ← name (bold) + total (text-primary bold)
│ ████████████░░░░░░░░░░░   hoje > │ ← ProgressBar + relative date + chevron
│ R$ 234,90 / R$ 300,00      78%  │ ← absolute values + percentage
└──────────────────────────────────┘
```

When `budgetGoal === null`: omits `ProgressBar` and shows "No budget goal" in `text-text-secondary`.
Card style: `bg-surface rounded-md shadow-card px-5 py-4`.

**Dependencies:** `ProgressBar`

---

### `BudgetBarHeader`

**File:** `src/components/molecules/BudgetBarHeader.tsx`

Budget bar attached directly below the AppBar on the shopping session screen.

```typescript
interface BudgetBarHeaderProps {
  current: number;
  goal: number;
}
// Shown only when goal > 0
```

**Layout:**
```
[████████████████░░░░]  R$ 487,50 / R$ 600,00
```

`ProgressBar` (4px) + right-aligned label `text-xs text-text-secondary tabular-nums`.

**Dependencies:** `ProgressBar`

---

### `FooterRow`

**File:** `src/components/molecules/FooterRow.tsx`

A single row of the totals footer.

```typescript
interface FooterRowProps {
  label: string;
  value: number;
  variant: 'default' | 'highlight' | 'total';
}
// default:    text-sm text-text-secondary + value text-sm text-text-secondary
// highlight:  text-sm text-text-secondary + value text-base font-medium text-primary
// total:      text-base text-text-primary  + value text-2xl font-bold text-text-primary
```

Examples:
- `variant="highlight"` → "In cart" / "R$ 30,49" (green)
- `variant="total"` → "Grand total" / "R$ 70,97" (large bold)
- `variant="default"` → "Remaining to goal" / "R$ 529,03"

---

### `AutocompleteOption`

**File:** `src/components/molecules/AutocompleteOption.tsx`

A suggestion in the autocomplete dropdown of the item form.

```typescript
interface AutocompleteOptionProps {
  text: string;
  type: 'history' | 'suggestion';
  onSelect: (text: string) => void;
}
// history:    clock icon (recently added items)
// suggestion: magnifying-glass icon (from the produtos-br.json catalog)
```

Minimum touch area: 48px height. Selected item receives `bg-background`.

---

### `NavItem`

**File:** `src/components/molecules/NavItem.tsx`

A tab in the bottom navigation.

```typescript
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
}
// Active: icon and label in text-primary
// Inactive: icon and label in text-text-secondary
```

Icons for the 3 tabs:
- **Lists** (active on home/session): list-with-check icon
- **Analytics**: bar chart icon
- **Settings**: gear icon

---

## Organisms

Complete UI sections composed of multiple molecules.

---

### `AppBar`

**File:** `src/components/organisms/AppBar.tsx`

Top navigation bar. Two variants:

```typescript
interface AppBarProps {
  variant: 'home' | 'session';
  title: string;
  // home: title only + offline icon
  // session: back arrow + title + three-dot menu
  onBack?: () => void;       // variant='session'
  onMenu?: () => void;       // variant='session'
  offlineIndicator?: boolean; // variant='home'
}
```

Style: `bg-primary text-white h-[var(--size-app-bar)] px-4 flex items-center`.
Offline icon: empty circle in the right corner (indicates connection status).

**Dependencies:** `IconButton`

---

### `ListSection`

**File:** `src/components/organisms/ListSection.tsx`

Active lists section + collapsible archived section.

```typescript
interface ListSectionProps {
  lists: ShoppingList[];
  archivedCount: number;
  onListClick: (id: string) => void;
}
```

**Layout:**
```
ACTIVE LISTS
[ListCard]
[ListCard]
[ListCard]
ARCHIVED (3) ↓   ← collapsible
```

**Dependencies:** `SectionLabel`, `ListCard`

---

### `ItemSection`

**File:** `src/components/organisms/ItemSection.tsx`

Item section with a title and a list of `ItemRow`.

```typescript
interface ItemSectionProps {
  title: string;         // "TO GRAB (5)" or "IN CART (2)"
  items: ListItem[];
  collapsible?: boolean; // "IN CART" can be collapsed
  defaultCollapsed?: boolean;
}
```

**Dependencies:** `SectionLabel`, `ItemRow`

---

### `StickyTotalFooter`

**File:** `src/components/organisms/StickyTotalFooter.tsx`

Sticky footer bar with shopping session totals.

```typescript
interface StickyTotalFooterProps {
  totalCost: number;
  checkedTotal: number;
  budgetGoal: number | null;
}
// When budgetGoal === null: omits the "Remaining to goal" line
```

**Layout:**
```
In cart                  R$ 30,49   ← FooterRow variant="highlight"
Grand total               R$ 70,97   ← FooterRow variant="total"
Remaining to goal         R$ 529,03  ← FooterRow variant="default" (conditional)
```

Positioning: `sticky bottom-0 z-[var(--z-sticky-footer)] bg-surface border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-4 py-3`.

**Dependencies:** `FooterRow`

---

### `BottomNav`

**File:** `src/components/organisms/BottomNav.tsx`

Bottom navigation with 3 tabs. Detects the active route via `usePathname()`.

```typescript
// No props — routes and icons are fixed
```

Positioning: `sticky bottom-0 z-[var(--z-bottom-nav)] bg-surface border-t border-border`.
Height: `h-[var(--size-bottom-nav)]`.

**Dependencies:** `NavItem`

---

### `ItemFormSheet`

**File:** `src/components/organisms/ItemFormSheet.tsx`

Bottom sheet for adding/editing an item. Contains the full form.

```typescript
interface ItemFormSheetProps {
  listId: string;
  onClose: () => void;
  editItemId?: string; // if set, edit mode
}
```

**Fields:**
1. **Product name** — text input + `AutocompleteOption` dropdown
2. **Quantity** — numeric input
3. **Unit** — select (`un | kg | g | L | ml | cx | pct`)
4. **Price** — numeric input with "R$" prefix
5. **Total preview** — `lineTotal` computed in real time (green)
6. **Action button** — "Add" / "Save" (full width, `bg-primary`)

Android keyboard visible below the sheet — form fields must scroll above the keyboard.
Dark overlay behind: `bg-[var(--color-overlay)] z-[var(--z-overlay)]`.

**Dependencies:** `BottomSheetHandle`, `IconButton`, `AutocompleteOption`
**Controller:** `ListItemController.addItem()` / `ListItemController.updateItem()`

---

## Templates

Screen structure without real data. Compose organisms in the correct layout.

---

### `HomeTemplate`

**File:** `src/components/templates/HomeTemplate.tsx`

```typescript
interface HomeTemplateProps {
  lists: ShoppingList[];
  archivedCount: number;
  onListClick: (id: string) => void;
  onNewList: () => void;
}
```

**Structure:**
```
AppBar (variant="home", title="Supermercado Brasil")
─────────────────────────────────────────────────
[scrollable content]
  ListSection
─────────────────────────────────────────────────
FAB ("New list", onPress=onNewList)
BottomNav (active="lists")
```

**Responsiveness:**
- Mobile: full-width layout
- Desktop: container with `max-w-[var(--size-app-max-w)] mx-auto`

---

### `BuyingSessionTemplate`

**File:** `src/components/templates/BuyingSessionTemplate.tsx`

```typescript
interface BuyingSessionTemplateProps {
  list: ShoppingList;
  pendingItems: ListItem[];
  checkedItems: ListItem[];
  onBack: () => void;
  onAddItem: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Structure:**
```
AppBar (variant="session", title=list.name)
BudgetBarHeader (when budgetGoal !== null)
─────────────────────────────────────────────────
[scrollable content]
  ItemSection ("TO GRAB", pendingItems)
  ItemSection ("IN CART", checkedItems, collapsible)
─────────────────────────────────────────────────
StickyTotalFooter
FAB ("Add item", onPress=onAddItem)
BottomNav (active="lists")
[ItemFormSheet — conditional, when FAB is pressed]
```

---

## Pages

Templates connected to real data via `useLiveQuery`.

---

### `app/page.tsx` — Home

```typescript
'use client';
// Connects: useShoppingLists() → HomeTemplate
// Shows: active lists + archived count
// Navigates: router.push('/lista/[id]') on card click
```

---

### `app/lista/[id]/page.tsx` — Shopping Session

```typescript
'use client';
// Connects: useShoppingList(id) + useListItems(id) → BuyingSessionTemplate
// generateStaticParams: returns [] (id read client-side via useParams)
// Splits: items into pendingItems (isChecked=false) and checkedItems (isChecked=true)
```

---

## Component × Screen Matrix

| Component | Home | Session | Form |
|---|:---:|:---:|:---:|
| `AppBar` | ✓ | ✓ | — |
| `BudgetBarHeader` | — | ✓ | — |
| `SectionLabel` | ✓ | ✓ | — |
| `ListCard` | ✓ | — | — |
| `ProgressBar` | ✓ | ✓ | — |
| `ItemRow` | — | ✓ | — |
| `CheckCircle` | — | ✓ | — |
| `PriceBadge` | — | ✓ | — |
| `StickyTotalFooter` | — | ✓ | — |
| `FooterRow` | — | ✓ | — |
| `FAB` | ✓ | ✓ | — |
| `BottomNav` | ✓ | ✓ | — |
| `ItemFormSheet` | — | ✓ (modal) | ✓ |
| `BottomSheetHandle` | — | — | ✓ |
| `AutocompleteOption` | — | — | ✓ |
