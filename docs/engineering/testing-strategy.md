# Testing Strategy

Stack: **Vitest + React Testing Library + Playwright + fake-indexeddb**

---

## Philosophy

- Tests prove that **business behavior** is correct, not that code exists
- Test via the public interface: Controller methods, utils exports, user interaction on components
- A failing test should say **what broke for the user**, not which line of code changed
- **Never mock IndexedDB** — use `fake-indexeddb`, which implements the real API in memory

---

## Test Pyramid

```
         /\
        /E2E\          ← Playwright (V1+) — complete critical flows in the browser
       /------\
      / Component\    ← React Testing Library (V0+) — components with real DOM
     /--------------\
    /   Unit Tests   \  ← Vitest (V0+) — Controllers, utils, models, hooks
   /________________\
```

**V0**: unit tests for controllers/utils/models + critical components are mandatory.

---

## Setup (`tests/setup.ts`)

```typescript
import 'fake-indexeddb/auto';      // injects in-memory IndexedDB into jsdom
import '@testing-library/jest-dom'; // matchers: toBeInTheDocument, toHaveTextContent, etc.
```

---

## Unit Tests — Controllers (Vitest)

```typescript
// tests/unit/controllers/ShoppingListController.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/models/db';
import { ShoppingListController } from '@/controllers/ShoppingListController';

describe('ShoppingListController', () => {

  beforeEach(async () => {
    await db.shoppingLists.clear();
    await db.listItems.clear();
  });

  describe('createList', () => {
    it('creates a list with a name and returns the id', async () => {
      const id = await ShoppingListController.createList('Carrefour 14/09');
      const list = await db.shoppingLists.get(id);
      expect(list?.name).toBe('Carrefour 14/09');
      expect(list?.status).toBe('active');
      expect(list?.totalCost).toBe(0);
    });

    it('trims the name before saving', async () => {
      const id = await ShoppingListController.createList('  Compras  ');
      const list = await db.shoppingLists.get(id);
      expect(list?.name).toBe('Compras');
    });

    it('throws an error if the name exceeds 60 characters', async () => {
      await expect(ShoppingListController.createList('A'.repeat(61))).rejects.toThrow();
    });

    it('throws an error if the name is empty', async () => {
      await expect(ShoppingListController.createList('')).rejects.toThrow();
      await expect(ShoppingListController.createList('   ')).rejects.toThrow();
    });

    it('accepts an optional budgetGoal', async () => {
      const id = await ShoppingListController.createList('Feira', 300);
      const list = await db.shoppingLists.get(id);
      expect(list?.budgetGoal).toBe(300);
    });
  });

  describe('recomputeTotals', () => {
    it('recalculates totalCost and checkedTotal correctly', async () => {
      const listId = await ShoppingListController.createList('Teste');
      await db.listItems.bulkAdd([
        { ...minimalItem(listId), id: '1', lineTotal: 15.00, isChecked: false },
        { ...minimalItem(listId), id: '2', lineTotal: 22.50, isChecked: true  },
        { ...minimalItem(listId), id: '3', lineTotal:  8.00, isChecked: true  },
      ]);
      await ShoppingListController.recomputeTotals(listId);
      const list = await db.shoppingLists.get(listId);
      expect(list?.totalCost).toBe(45.50);
      expect(list?.checkedTotal).toBe(30.50);
    });
  });
});

function minimalItem(listId: string) {
  return {
    listId, name: 'Item', quantity: 1, unit: 'un' as const,
    unitPrice: 0, pricePerRefUnit: null, isChecked: false,
    position: 1000, categoryId: null, barcodeEan: null,
    priceSource: 'manual' as const, createdAt: Date.now(), updatedAt: Date.now(),
  };
}
```

---

## Unit Tests — Utils (Vitest)

```typescript
// tests/unit/utils/currency.test.ts
import { formatBRL } from '@/utils/currency';

describe('formatBRL', () => {
  it('formats zero', () => expect(formatBRL(0)).toBe('R$ 0,00'));
  it('formats thousands with a dot', () => expect(formatBRL(1234.56)).toBe('R$ 1.234,56'));
  it('rounds correctly', () => expect(formatBRL(1.005)).toBe('R$ 1,01'));
});
```

```typescript
// tests/unit/utils/units.test.ts
import { calcPricePerRefUnit } from '@/utils/units';

describe('calcPricePerRefUnit', () => {
  it('normalizes 900ml to R$/L', () =>
    expect(calcPricePerRefUnit(8.99, 900, 'ml')).toBeCloseTo(9.99, 1));
  it('normalizes 250g to R$/kg', () =>
    expect(calcPricePerRefUnit(2.50, 250, 'g')).toBeCloseTo(10.00, 1));
  it('returns null for the "un" unit', () =>
    expect(calcPricePerRefUnit(5.00, 1, 'un')).toBeNull());
});
```

---

## Component Tests (React Testing Library)

```typescript
// tests/unit/components/StickyTotalFooter.test.tsx

import { render, screen } from '@testing-library/react';
import { StickyTotalFooter } from '@/components/StickyTotalFooter';

describe('StickyTotalFooter', () => {
  it('displays the overall total and the cart subtotal', () => {
    render(
      <StickyTotalFooter
        totalCost={45.50}
        checkedTotal={30.50}
        budgetGoal={null}
      />
    );
    expect(screen.getByText('R$ 45,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 30,50')).toBeInTheDocument();
  });

  it('shows the "Remaining" line when budgetGoal is set', () => {
    render(
      <StickyTotalFooter totalCost={45.50} checkedTotal={30.50} budgetGoal={100} />
    );
    expect(screen.getByText(/falta/i)).toBeInTheDocument();
    expect(screen.getByText('R$ 54,50')).toBeInTheDocument();
  });

  it('does not show the "Remaining" line without a budgetGoal', () => {
    render(
      <StickyTotalFooter totalCost={45.50} checkedTotal={30.50} budgetGoal={null} />
    );
    expect(screen.queryByText(/falta/i)).not.toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/components/BudgetProgressBar.test.tsx

import { render } from '@testing-library/react';
import { BudgetProgressBar } from '@/components/BudgetProgressBar';

describe('BudgetProgressBar', () => {
  it('renders nothing when goal is null', () => {
    const { container } = render(<BudgetProgressBar current={50} goal={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('applies the danger class when exceeding 100%', () => {
    const { container } = render(<BudgetProgressBar current={110} goal={100} />);
    // check that the bar has the danger color class
    expect(container.querySelector('[data-testid="progress-bar"]'))
      .toHaveClass('bg-danger');
  });
});
```

### Pattern for Components Using `useLiveQuery`

Components that use Dexie hooks need the database mocked via `fake-indexeddb`:

```typescript
// tests/unit/components/ItemRow.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { db } from '@/models/db';
import { ItemRow } from '@/components/ItemRow';
import { createListItem } from '@/models/ListItem';

describe('ItemRow', () => {
  beforeEach(() => db.listItems.clear());

  it('displays the item name and total', () => {
    const item = createListItem({
      listId: 'list-1',
      name: 'Arroz Camil 5kg',
      quantity: 1,
      unit: 'kg',
      unitPrice: 22.99,
      position: 1000,
    });

    render(<ItemRow item={item} />);

    expect(screen.getByText('Arroz Camil 5kg')).toBeInTheDocument();
    expect(screen.getByText('R$ 22,99')).toBeInTheDocument();
  });
});
```

---

## What to Test in Each Module

### Controllers (mandatory coverage ≥ 80%)
- Happy path for every public method
- Validations: required fields, min/max limits (BR-09 to BR-16)
- `recomputeTotals` is called after add/update/delete/toggle
- Edge cases: empty list, zero price, fractional quantity

### Utils (coverage ≥ 90%)
- `formatBRL`: zero, thousands, rounding
- `calcPricePerRefUnit`: all units + null return for 'un'/'cx'/'pct'
- `validateListName`: empty, too short, too long, with trim
- `generateUUID`: UUID v4 format

### Models (coverage ≥ 85%)
- Factory creates all required fields
- `lineTotal` = `quantity * unitPrice`
- `id` is UUID v4
- `createdAt` and `updatedAt` are recent timestamps

### Components (critical for V0)
- `StickyTotalFooter`: displays correct values, conditional "Remaining" line
- `BudgetProgressBar`: correct colors at thresholds, hidden without a goal
- `ItemRow`: renders name, price, line total; accessible check button
- `ItemFormSheet`: inline validation, real-time lineTotal preview

---

## E2E — Playwright (V1+)

### Mandatory Flows

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete flow: create list → add item → check → verify total', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Nova lista' }).click();
  await page.getByLabel('Nome da lista').fill('Atacadão');
  await page.getByRole('button', { name: 'Criar' }).click();

  await expect(page.getByText('Atacadão')).toBeVisible();
  await page.getByText('Atacadão').click();

  await page.getByRole('button', { name: 'Adicionar item' }).click();
  await page.getByLabel('Nome').fill('Arroz Camil 5kg');
  await page.getByLabel('Quantidade').fill('1');
  await page.getByLabel('Preço').fill('22,99');
  await page.getByRole('button', { name: 'Adicionar' }).click();

  await expect(page.getByText('R$ 22,99')).toBeVisible();  // line total
  await expect(page.getByText('Total')).toBeVisible();           // footer

  // check the item
  await page.getByRole('button', { name: 'Marcar como no carrinho' }).click();
  await expect(page.getByText('No carrinho')).toBeVisible();
});
```

---

## Directory Structure

```
tests/
├── setup.ts
├── unit/
│   ├── controllers/
│   │   ├── ShoppingListController.test.ts
│   │   ├── ListItemController.test.ts
│   │   ├── AutocompleteController.test.ts
│   │   └── PriceComparisonController.test.ts
│   ├── models/
│   │   ├── ShoppingList.test.ts
│   │   └── ListItem.test.ts
│   ├── utils/
│   │   ├── currency.test.ts
│   │   ├── units.test.ts
│   │   └── validation.test.ts
│   └── components/
│       ├── StickyTotalFooter.test.tsx
│       ├── BudgetProgressBar.test.tsx
│       ├── ItemRow.test.tsx
│       └── ItemFormSheet.test.tsx
└── e2e/                              ← V1+
    └── shopping-flow.spec.ts
```

---

## Testing Rules

1. **Never mock IndexedDB** — use `fake-indexeddb`
2. **Never mock Controllers in component tests** — test the real integration
3. **`beforeEach` clears the database** — each test starts from scratch
4. Name tests in PT-BR: `it('cria lista com nome e retorna id')`
5. One behavior assertion per `it` (multiple values from the same behavior are fine)
6. Do not test internal implementation — if you need to access internal state to test, the design is wrong

---

## Mandatory Minimum Coverage

| Layer | Lines | Functions | Branches |
|--------|--------|---------|----------|
| `src/controllers/` | 80% | 80% | 70% |
| `src/utils/` | 90% | 90% | 85% |
| `src/models/` | 85% | 85% | 75% |
| `src/hooks/` | 70% | 70% | — |
| `src/components/` | — | — | — (not measured in V0) |

---

## Commands

```bash
npm test                # all unit tests
npm run test:coverage   # with coverage report
npm run test:watch      # watch mode during development
npm run test:e2e        # E2E with Playwright (V1+)
```
