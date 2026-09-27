# Design Tokens

Source of truth extracted from `docs/layout/` (UXPilot images).
Every agent MUST use these tokens — never hardcoded values in components.
Tokens are declared in `src/app/globals.css` via Tailwind v4's `@theme`.

---

## Colors

| CSS Token | Value | Semantic Use |
|---|---|---|
| `--color-primary` | `#2e7d32` | AppBar, FAB, active checkmark, active nav tab, active card border |
| `--color-primary-light` | `#43a047` | "Check" swipe (green), budget bar 0–79% |
| `--color-primary-dark` | `#1b5e20` | FAB pressed state (ripple, focus) |
| `--color-warning` | `#f57c00` | Budget bar 80–99%, unit price badge |
| `--color-warning-surface` | `#fff3e0` | Unit price badge background (light orange pill) |
| `--color-danger` | `#c62828` | "Delete" swipe, budget bar ≥100%, overage text |
| `--color-surface` | `#ffffff` | Card, bottom sheet, item row, and input backgrounds |
| `--color-background` | `#f7f8f6` | Overall screen background (light greenish off-white) |
| `--color-text-primary` | `#1a1a1a` | Main text: item name, totals |
| `--color-text-secondary` | `#595959` | Subtitles, captions, inactive nav icons |
| `--color-text-disabled` | `#9e9e9e` | Strikethrough text of a checked item |
| `--color-border` | `#e0e0e0` | Input borders, progress bar track, dividers |
| `--color-overlay` | `rgba(0,0,0,0.50)` | Darkened background when opening the bottom sheet |

### Budget bar color logic

```
0% – 79%   → --color-primary-light  (#43a047) green
80% – 99%  → --color-warning        (#f57c00) orange
≥ 100%     → --color-danger         (#c62828) red + "budget exceeded" label
```

Implement in `src/components/atoms/ProgressBar.tsx` via a helper function:
```typescript
function barColor(pct: number): string {
  if (pct >= 100) return 'bg-danger';
  if (pct >= 80)  return 'bg-warning';
  return 'bg-primary-light';
}
```

---

## Typography

Font: **Inter** (via Google Fonts) — sans-serif, faithful to the design's visual style.
Fallback: `system-ui, -apple-system, sans-serif`

| CSS Token | Size | Weight | Use |
|---|---|---|---|
| `--font-size-2xl` | `1.5rem` (24px) | 700 bold | Grand total (`R$ 630,97`) |
| `--font-size-xl` | `1.25rem` (20px) | 500 medium | Section total (`R$ 150,20`) |
| `--font-size-lg` | `1.125rem` (18px) | 500 medium | Per-item line total (`R$ 22,99`) |
| `--font-size-base` | `1rem` (16px) | 400 regular | Item name, list title |
| `--font-size-sm` | `0.875rem` (14px) | 400 regular | Card subtitle, last-updated date |
| `--font-size-xs` | `0.75rem` (12px) | 400 regular | Caption, unit price (`R$ 9,99/L`), label |

Weights used: `400` (regular), `500` (medium), `700` (bold).
Use `font-variant-numeric: tabular-nums` on every monetary value (`tabular-nums` in Tailwind).

---

## Spacing (4px grid)

| CSS Token | Value | Typical Use |
|---|---|---|
| `--spacing-1` | `0.25rem` (4px) | Minimum space between icon and text in nav |
| `--spacing-2` | `0.5rem` (8px) | Badge inner padding, gap between subtitles |
| `--spacing-3` | `0.75rem` (12px) | Vertical padding of item row |
| `--spacing-4` | `1rem` (16px) | Default lateral padding (screen gutter) |
| `--spacing-5` | `1.25rem` (20px) | Inner padding of list card |
| `--spacing-6` | `1.5rem` (24px) | Space between list sections |
| `--spacing-8` | `2rem` (32px) | Large section margin |

The default lateral gutter (`--spacing-4`, 16px) is applied as `px-4` on the main container of each screen.

---

## Fixed Component Sizes

| CSS Token | Value | Component |
|---|---|---|
| `--size-touch-min` | `3rem` (48px) | Minimum touch area (WCAG AA) — every button/checkbox |
| `--size-fab` | `3.5rem` (56px) | FAB diameter |
| `--size-app-bar` | `3.5rem` (56px) | AppBar height |
| `--size-bottom-nav` | `3.5rem` (56px) | Bottom navigation height |
| `--size-sticky-footer` | `5.5rem` (88px) | Footer bar height (3 lines) |
| `--size-budget-bar` | `0.25rem` (4px) | Budget bar thickness |
| `--size-sheet-handle-w` | `2rem` (32px) | Bottom sheet handle width |
| `--size-sheet-handle-h` | `0.25rem` (4px) | Bottom sheet handle height |
| `--size-app-max-w` | `30rem` (480px) | Maximum width of the application container |

---

## Border Radius

| CSS Token | Value | Use |
|---|---|---|
| `--radius-sm` | `0.5rem` (8px) | Unit price badge (small pill) |
| `--radius-md` | `0.75rem` (12px) | List cards, item row container |
| `--radius-lg` | `1rem` (16px) | Bottom sheet (top-left and top-right only) |
| `--radius-full` | `9999px` | FAB, progress bar track and fill |

---

## Shadows

| CSS Token | CSS Value | Use |
|---|---|---|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | List cards, item row container |
| `--shadow-fab` | `0 4px 12px rgba(0,0,0,0.20)` | FAB |
| `--shadow-sheet` | `0 -4px 20px rgba(0,0,0,0.12)` | Bottom sheet (upward shadow) |

---

## Z-index (layers)

| CSS Token | Value | Layer |
|---|---|---|
| `--z-content` | `0` | Scrollable content |
| `--z-sticky-footer` | `10` | Sticky footer bar |
| `--z-fab` | `20` | FAB (above the footer) |
| `--z-bottom-nav` | `30` | Bottom navigation |
| `--z-overlay` | `40` | Bottom sheet dark overlay |
| `--z-bottom-sheet` | `50` | Bottom sheet (topmost) |

---

## Responsiveness

The app is **mobile-first** (375–430px). On larger screens, the layout stays in a centered single column.

| CSS Token | Value | Context |
|---|---|---|
| `--breakpoint-sm` | `480px` | Large phones |
| `--breakpoint-md` | `768px` | Tablets |
| `--breakpoint-lg` | `1024px` | Desktop |

**Container strategy:**
- Root wrapper with `max-width: var(--size-app-max-w)` + `margin: 0 auto`
- `position: relative` on the wrapper to contain `absolute` elements
- On mobile: sticky/fixed elements use `position: sticky` or `position: absolute` inside the wrapper
- On desktop: never use plain `position: fixed` — the element would leak outside the centered container

```css
/* Container pattern — applied in app/layout.tsx */
.app-container {
  max-width: var(--size-app-max-w);
  margin-inline: auto;
  min-height: 100dvh;
  position: relative;
}
```

---

## Mapping to `globals.css`

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* --- Typography --- */
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;

  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;

  /* --- Colors --- */
  --color-primary:         #2e7d32;
  --color-primary-light:   #43a047;
  --color-primary-dark:    #1b5e20;
  --color-warning:         #f57c00;
  --color-warning-surface: #fff3e0;
  --color-danger:          #c62828;
  --color-surface:         #ffffff;
  --color-background:      #f7f8f6;
  --color-text-primary:    #1a1a1a;
  --color-text-secondary:  #595959;
  --color-text-disabled:   #9e9e9e;
  --color-border:          #e0e0e0;
  --color-overlay:         rgba(0, 0, 0, 0.50);

  /* --- Spacing --- */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* --- Fixed sizes --- */
  --size-touch-min:    3rem;
  --size-fab:          3.5rem;
  --size-app-bar:      3.5rem;
  --size-bottom-nav:   3.5rem;
  --size-sticky-footer:5.5rem;
  --size-budget-bar:   0.25rem;
  --size-app-max-w:    30rem;

  /* --- Border radius --- */
  --radius-sm:   0.5rem;
  --radius-md:   0.75rem;
  --radius-lg:   1rem;
  --radius-full: 9999px;

  /* --- Shadows --- */
  --shadow-card:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-fab:   0 4px 12px rgba(0,0,0,0.20);
  --shadow-sheet: 0 -4px 20px rgba(0,0,0,0.12);

  /* --- Z-index --- */
  --z-content:        0;
  --z-sticky-footer:  10;
  --z-fab:            20;
  --z-bottom-nav:     30;
  --z-overlay:        40;
  --z-bottom-sheet:   50;

  /* --- Breakpoints --- */
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}
```

Automatically generated Tailwind classes include:
`bg-primary`, `text-primary`, `border-primary`, `bg-danger`, `text-warning`,
`bg-background`, `bg-surface`, `text-text-primary`, `text-text-secondary`,
`min-h-touch-min`, `min-w-touch-min`, `w-fab`, `h-fab`,
`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`,
`shadow-card`, `shadow-fab`, `shadow-sheet`.
