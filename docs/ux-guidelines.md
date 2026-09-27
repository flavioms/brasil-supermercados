# UX/UI Guidelines

This document defines the interface rules for Supermercado Brasil. Every design decision
must be validated against these guidelines. The context of use is the guiding thread of each rule.

---

## Context of Use

The user is **inside a supermarket**, on the move, with divided attention:

- ✋ Holds products, the cart, or the basket with one hand
- 👍 Uses the **thumb** of the hand holding the phone to interact
- 🔊 Noisy environment — cannot process long text
- 💡 Strong artificial lighting — washes out low-contrast screens
- 📶 Potentially poor or nonexistent data connection
- ⏱️ Scarce time — every tap must be quick and precise

**Core implication**: If an action requires more than 2 taps or moving the thumb to the
top of the screen, it will frustrate the user at the most critical moment.

---

## Thumb Reach Zone

Most users hold the phone with their right hand. The thumb naturally covers
only part of the screen:

```
┌─────────────────────┐
│   ╔═══════════╗     │
│   ║ DEAD      ║     │  ← FORBIDDEN ACTIONS
│   ║ ZONE      ║     │    (hard/impossible to reach)
│   ╚═══════════╝     │
│                     │
│   ┌─────────────┐   │
│   │ MEDIUM ZONE │   │  ← Secondary actions (settings, etc.)
│   └─────────────┘   │
│                     │
│ ┌───────────────────┐│
│ │  PRIMARY ZONE     ││  ← ALL MAIN ACTIONS HERE
│ │  (bottom 40%)     ││    (add, check, edit, view total)
│ └───────────────────┘│
└─────────────────────┘
```

---

## Touch Target Rules

| ID | Rule |
|----|-------|
| **UX-01** | Every interactive element has a minimum of **48×48dp** (Android) / **44×44pt** (iOS) |
| **UX-02** | Minimum spacing between adjacent interactive targets: **8dp** |
| **UX-03** | Critical elements (check, FAB, primary button) must have a tap area larger than the visual suggests |

---

## Navigation

| ID | Rule |
|----|-------|
| **UX-04** | Use a **bottom navigation bar** — never a hamburger menu (which is always in the dead zone) |
| **UX-05** | Every central action reachable in at most **2 taps** from any screen |
| **UX-06** | The "Add Item" button is a **FAB** positioned at the bottom-center of the screen |
| **UX-07** | Secondary navigation links and buttons may be at the top; **never** primary actions |

---

## Item List

| ID | Rule |
|----|-------|
| **UX-08** | **Swipe right** = mark item as "in cart" (the most frequent action during shopping) |
| **UX-09** | **Swipe left** = delete item (50% width threshold to confirm; red strip slides in) |
| **UX-10** | Checked items **do NOT disappear** from the list — they collapse into a section at the end |
| **UX-11** | The **check area** occupies the left 48dp of the item — the natural zone for the right thumb |
| **UX-12** | Checked items display the name with strikethrough; they remain legible (the user may need to reference them) |
| **UX-13** | The checked items section starts collapsed; one tap expands it |

---

## Real-Time Total (core feature — non-negotiable)

| ID | Rule |
|----|-------|
| **UX-14** | **Sticky footer always visible** with grand total and session subtotal — never disappears |
| **UX-15** | When adding or changing any item: the total animates with a **scale pulse** (105%→100%, 150ms) |
| **UX-16** | Minimum footer height: **72dp** |
| **UX-17** | Grand total font size in the footer: **24sp** |
| **UX-18** | Session subtotal font size (checked items): **20sp** |
| **UX-19** | The footer displays two values: "In cart: R$ X.XX" and "Total: R$ X.XX" |
| **UX-20** | If a budget is set: the footer also displays "Remaining: R$ X.XX" or "Over: R$ X.XX" |

---

## Budget and Progress

| ID | Rule |
|----|-------|
| **UX-21** | Progress bar with **3 color stages**: green (0–70%), amber (70–90%), red (90–100%+) |
| **UX-22** | Above 100% of budget: red bar + **pulse animation** to draw attention |
| **UX-23** | The progress bar sits in the header of the list screen, right below the name |
| **UX-24** | The color transition must be gradual (CSS `transition`) so as not to startle the user |

---

## Add Item Form (Bottom Sheet)

| ID | Rule |
|----|-------|
| **UX-25** | The form appears as a **bottom sheet** — bottom half of the screen (snap point 50%) |
| **UX-26** | When the keyboard opens, the sheet expands to **85%** so it doesn't cover the focused field |
| **UX-27** | **Line total preview** (qty × price) updates in real time as the user types |
| **UX-28** | "Add" / "Save" button takes up **full width**, minimum height **56dp** |
| **UX-29** | Price field uses `inputmode="decimal"` — opens the numeric keyboard on Android/iOS |
| **UX-30** | Price field displays the `R$` prefix and uses a comma as the decimal separator (pt-BR locale) |
| **UX-31** | The name field receives automatic focus when the sheet opens |
| **UX-32** | The unit selector (un/kg/g/L...) is a native select — avoids a heavy custom component |

---

## Typography and Contrast

| ID | Rule |
|----|-------|
| **UX-33** | Item name: **16sp**, normal weight |
| **UX-34** | Line total (right side): **18sp** |
| **UX-35** | Session total in the footer: **20sp** |
| **UX-36** | Grand total in the footer: **24sp**, bold |
| **UX-37** | Minimum contrast **WCAG AA (4.5:1)** on all text — store lighting washes out dark screens |
| **UX-38** | Do not use medium gray for text — the minimum is `#595959` on a white background |
| **UX-39** | System font (system-ui) — avoids loading an external font that blocks rendering |

---

## Offline and Connectivity

| ID | Rule |
|----|-------|
| **UX-40** | **Discreet** offline status indicator in the top bar (icon + color) — without blocking use |
| **UX-41** | **Never block an action** due to lack of network — optimistic UI, persists locally and syncs later |
| **UX-42** | On reconnect: silent sync without interrupting the shopping session |
| **UX-43** | In offline mode: barcode scan and NF-e buttons are disabled with an explanatory tooltip |

---

## Haptic Feedback

| ID | Rule |
|----|-------|
| **UX-44** | Short vibration (**10ms**) when checking an item — `navigator.vibrate(10)` |
| **UX-45** | Confirmation vibration (**[50, 30, 50]ms** — two pulses) when completing a delete swipe |
| **UX-46** | Always use feature detection: `if (navigator.vibrate)` — graceful degradation on iOS |

---

## Specific Micro-interactions

### Swipe to Check

```
Initial state:
[  ●  Item name                  R$ 9,99]

During right swipe (up to 30% of width):
[══► ●  Item name                  R$ 9,99]
     green background starts appearing on the left

After threshold (>30%):
[════════════ ✓ CHECKED ═══════════════]
     item moves down to "In Cart" section
     haptic: vibrate(10)
     footer total animates
```

### Total Animation

When the total changes:
- Scale: `1 → 1.05 → 1` over 150ms
- CSS: `transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)`
- If it crosses a budget threshold: simultaneous background-color crossfade

### Bottom Sheet — Opening

```
State: closed (height: 0)
     ↓ tap on FAB
State: opening (translate Y: 100% → 50%, duration: 250ms, ease-out)
     ↓ keyboard opens automatically
State: expanded (translate Y: 50% → 15%, duration: 200ms, ease-out)
```

---

## Design Tokens (CSS Custom Properties)

Tokens that carry the UX requirements into the implementation:

```css
/* Minimum sizes */
--touch-target-min: 48px;
--fab-size: 56px;
--footer-height: 72px;
--sheet-handle-height: 24px;
--button-height: 56px;

/* Typography */
--font-size-item-name: 1rem;        /* 16sp */
--font-size-line-total: 1.125rem;   /* 18sp */
--font-size-session-total: 1.25rem; /* 20sp */
--font-size-grand-total: 1.5rem;    /* 24sp */

/* Colors */
--color-success: #2e7d32;   /* green — 0–70% of budget */
--color-warning: #f57c00;   /* amber — 70–90% */
--color-danger: #c62828;    /* red — 90%+ */
--color-check: #43a047;     /* green for the check swipe */
--color-delete: #e53935;    /* red for the delete swipe */

/* Surfaces */
--color-surface: #ffffff;
--color-on-surface: #1a1a1a;        /* high contrast */
--color-surface-variant: #f5f5f5;
--color-on-surface-secondary: #595959; /* WCAG AA minimum gray */

/* Borders and shapes */
--radius-card: 12px;
--radius-sheet: 16px;
--radius-chip: 8px;

/* Animations */
--transition-check: 300ms ease-out;
--transition-total-pulse: 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
--transition-sheet: 250ms ease-out;
--transition-color: 200ms ease;

/* Zones */
--primary-action-zone: 40%;   /* bottom percentage of the screen for primary actions */
```

---

## Anti-patterns (What NOT to do)

| Anti-pattern | Reason |
|-------------|--------|
| Ads during the shopping session | Destroys focus at the most critical moment |
| Automatically deleting checked items | The user needs to reference what they've already picked up |
| Modal confirmations for quick actions | Makes checking impossible with one hand |
| Full-height bottom sheet (100%) | Doesn't feel contextual, feels like a new screen |
| Destructive actions with a short swipe | Too easy to trigger accidentally |
| Total visible only on a separate screen | Removes the app's core value |
| Menu hierarchy with 3+ levels | Inaccessible while on the move |
| Permission pop-ups during shopping | Never interrupt the main flow |
