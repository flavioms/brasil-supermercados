# Estratégia de Testes

Stack: **Vitest + React Testing Library + Playwright + fake-indexeddb**

---

## Filosofia

- Testes provam que o **comportamento de negócio** está correto, não que o código existe
- Testar via interface pública: métodos de Controller, exports de utils, interação do usuário nos componentes
- Um teste falho deve dizer **o que quebrou para o usuário**, não qual linha de código mudou
- **Nunca mockar o IndexedDB** — usar `fake-indexeddb` que implementa a API real em memória

---

## Pirâmide de Testes

```
         /\
        /E2E\          ← Playwright (V1+) — fluxos críticos completos no browser
       /------\
      / Componente\    ← React Testing Library (V0+) — componentes com DOM real
     /--------------\
    /   Unitários    \  ← Vitest (V0+) — Controllers, utils, models, hooks
   /________________\
```

**V0**: unitários de controllers/utils/models + componentes críticos são obrigatórios.

---

## Setup (`tests/setup.ts`)

```typescript
import 'fake-indexeddb/auto';      // injeta IndexedDB em memória no jsdom
import '@testing-library/jest-dom'; // matchers: toBeInTheDocument, toHaveTextContent, etc.
```

---

## Unitários — Controllers (Vitest)

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
    it('cria lista com nome e retorna id', async () => {
      const id = await ShoppingListController.createList('Carrefour 14/09');
      const list = await db.shoppingLists.get(id);
      expect(list?.name).toBe('Carrefour 14/09');
      expect(list?.status).toBe('active');
      expect(list?.totalCost).toBe(0);
    });

    it('faz trim do nome antes de salvar', async () => {
      const id = await ShoppingListController.createList('  Compras  ');
      const list = await db.shoppingLists.get(id);
      expect(list?.name).toBe('Compras');
    });

    it('lança erro se nome excede 60 caracteres', async () => {
      await expect(ShoppingListController.createList('A'.repeat(61))).rejects.toThrow();
    });

    it('lança erro se nome estiver vazio', async () => {
      await expect(ShoppingListController.createList('')).rejects.toThrow();
      await expect(ShoppingListController.createList('   ')).rejects.toThrow();
    });

    it('aceita budgetGoal opcional', async () => {
      const id = await ShoppingListController.createList('Feira', 300);
      const list = await db.shoppingLists.get(id);
      expect(list?.budgetGoal).toBe(300);
    });
  });

  describe('recomputeTotals', () => {
    it('recalcula totalCost e checkedTotal corretamente', async () => {
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

## Unitários — Utils (Vitest)

```typescript
// tests/unit/utils/currency.test.ts
import { formatBRL } from '@/utils/currency';

describe('formatBRL', () => {
  it('formata zero', () => expect(formatBRL(0)).toBe('R$ 0,00'));
  it('formata milhar com ponto', () => expect(formatBRL(1234.56)).toBe('R$ 1.234,56'));
  it('arredonda corretamente', () => expect(formatBRL(1.005)).toBe('R$ 1,01'));
});
```

```typescript
// tests/unit/utils/units.test.ts
import { calcPricePerRefUnit } from '@/utils/units';

describe('calcPricePerRefUnit', () => {
  it('normaliza 900ml para R$/L', () =>
    expect(calcPricePerRefUnit(8.99, 900, 'ml')).toBeCloseTo(9.99, 1));
  it('normaliza 250g para R$/kg', () =>
    expect(calcPricePerRefUnit(2.50, 250, 'g')).toBeCloseTo(10.00, 1));
  it('retorna null para unidade "un"', () =>
    expect(calcPricePerRefUnit(5.00, 1, 'un')).toBeNull());
});
```

---

## Testes de Componente (React Testing Library)

```typescript
// tests/unit/components/StickyTotalFooter.test.tsx

import { render, screen } from '@testing-library/react';
import { StickyTotalFooter } from '@/components/StickyTotalFooter';

describe('StickyTotalFooter', () => {
  it('exibe total geral e subtotal do carrinho', () => {
    render(
      <StickyTotalFooter
        totalCost={45.50}
        checkedTotal={30.50}
        budgetGoal={null}
      />
    );
    expect(screen.getByText('R$ 45,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 30,50')).toBeInTheDocument();
  });

  it('exibe linha "Falta" quando budgetGoal definido', () => {
    render(
      <StickyTotalFooter totalCost={45.50} checkedTotal={30.50} budgetGoal={100} />
    );
    expect(screen.getByText(/falta/i)).toBeInTheDocument();
    expect(screen.getByText('R$ 54,50')).toBeInTheDocument();
  });

  it('não exibe linha "Falta" sem budgetGoal', () => {
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
  it('renderiza nada quando goal é null', () => {
    const { container } = render(<BudgetProgressBar current={50} goal={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('aplica classe danger ao ultrapassar 100%', () => {
    const { container } = render(<BudgetProgressBar current={110} goal={100} />);
    // verificar que a barra tem classe de cor de perigo
    expect(container.querySelector('[data-testid="progress-bar"]'))
      .toHaveClass('bg-danger');
  });
});
```

### Padrão para Componentes com `useLiveQuery`

Componentes que usam hooks de Dexie precisam do banco mockado via `fake-indexeddb`:

```typescript
// tests/unit/components/ItemRow.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { db } from '@/models/db';
import { ItemRow } from '@/components/ItemRow';
import { createListItem } from '@/models/ListItem';

describe('ItemRow', () => {
  beforeEach(() => db.listItems.clear());

  it('exibe nome e total do item', () => {
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
    expect(screen.getByText('R$ 22,99')).toBeInTheDocument();
  });
});
```

---

## O Que Testar em Cada Módulo

### Controllers (cobertura obrigatória ≥ 80%)
- Happy path de cada método público
- Validações: campos obrigatórios, limites min/max (BR-09 a BR-16)
- `recomputeTotals` é chamado após add/update/delete/toggle
- Casos de borda: lista vazia, preço zero, quantidade fracionária

### Utils (cobertura ≥ 90%)
- `formatBRL`: zero, milhar, arredondamento
- `calcPricePerRefUnit`: todas as unidades + retorno null para 'un'/'cx'/'pct'
- `validateListName`: vazio, muito curto, muito longo, com trim
- `generateUUID`: formato UUID v4

### Models (cobertura ≥ 85%)
- Factory cria todos os campos obrigatórios
- `lineTotal` = `quantity * unitPrice`
- `id` é UUID v4
- `createdAt` e `updatedAt` são timestamps recentes

### Componentes (críticos do V0)
- `StickyTotalFooter`: exibe valores corretos, linha "Falta" condicional
- `BudgetProgressBar`: cores nos thresholds corretos, oculta sem goal
- `ItemRow`: renderiza nome, preço, linha total; botão de check acessível
- `ItemFormSheet`: validação inline, preview de lineTotal em tempo real

---

## E2E — Playwright (V1+)

### Fluxos Obrigatórios

```typescript
// tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test('fluxo completo: criar lista → adicionar item → marcar → verificar total', async ({ page }) => {
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

  await expect(page.getByText('R$ 22,99')).toBeVisible();  // linha total
  await expect(page.getByText('Total')).toBeVisible();           // footer

  // marcar o item
  await page.getByRole('button', { name: 'Marcar como no carrinho' }).click();
  await expect(page.getByText('No carrinho')).toBeVisible();
});
```

---

## Estrutura de Diretórios

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

## Regras de Teste

1. **Nunca mockar IndexedDB** — usar `fake-indexeddb`
2. **Nunca mockar Controllers nos testes de componente** — testar a integração real
3. **`beforeEach` limpa o banco** — cada teste começa do zero
4. Nomear em PT-BR: `it('cria lista com nome e retorna id')`
5. Um assert de comportamento por `it` (múltiplos valores do mesmo comportamento são ok)
6. Não testar implementação interna — se precisar acessar estado interno para testar, o design está errado

---

## Cobertura Mínima Obrigatória

| Camada | Linhas | Funções | Branches |
|--------|--------|---------|----------|
| `src/controllers/` | 80% | 80% | 70% |
| `src/utils/` | 90% | 90% | 85% |
| `src/models/` | 85% | 85% | 75% |
| `src/hooks/` | 70% | 70% | — |
| `src/components/` | — | — | — (não medido no V0) |

---

## Comandos

```bash
npm test                # todos os unitários
npm run test:coverage   # com relatório de cobertura
npm run test:watch      # modo watch durante desenvolvimento
npm run test:e2e        # E2E com Playwright (V1+)
```
