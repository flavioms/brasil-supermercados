# Padrões de Código

Stack: **Next.js 15 + TypeScript 5 + Tailwind CSS 4 + Dexie.js 4**

---

## TypeScript

### Configuração (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Regras de TypeScript

- **Zero `any`** — usar `unknown` + type guard quando o tipo é incerto
- **Zero asserções de tipo desnecessárias (`as`)** — tipar na origem, não no uso
- Interfaces para shapes de objetos; `type` para unions, interseções e aliases de primitivos
- `readonly` em arrays e objetos que não devem ser mutados fora do módulo
- Enums não são usados — preferir `as const` para mapas de constantes

```typescript
// BOM
const STATUS = { ACTIVE: 'active', ARCHIVED: 'archived' } as const;
type ListStatus = typeof STATUS[keyof typeof STATUS]; // 'active' | 'archived'

// RUIM
enum ListStatus { ACTIVE = 'active', ARCHIVED = 'archived' }
```

---

## Nomenclatura

| Contexto | Padrão | Exemplo |
|----------|--------|---------|
| Variáveis e funções | `camelCase` | `totalCost`, `recomputeTotals` |
| Interfaces e Types | `PascalCase` | `ShoppingList`, `ListItem` |
| Componentes React | `PascalCase` | `ItemRow`, `BottomSheet` |
| Arquivos de componente | `PascalCase.tsx` | `ItemRow.tsx`, `BottomSheet.tsx` |
| Arquivos de hook | `camelCase.ts` com prefixo `use` | `useListItems.ts` |
| Arquivos de controller | `PascalCase.ts` | `ShoppingListController.ts` |
| Arquivos de model | `PascalCase.ts` | `ShoppingList.ts` |
| Constantes de módulo | `UPPER_SNAKE_CASE` | `ITEM_PRECO_MAX`, `UNIDADES_VALIDAS` |
| Páginas Next.js | `page.tsx` (obrigatório pelo framework) | `app/lista/[id]/page.tsx` |

---

## Models (interfaces + factory functions)

```typescript
// src/models/ShoppingList.ts

export interface ShoppingList {
  id: string;
  name: string;
  budgetGoal: number | null;
  status: 'active' | 'archived';
  totalCost: number;
  checkedTotal: number;
  colorTag: string | null;
  createdAt: number;
  updatedAt: number;
}

export function createShoppingList(
  input: Pick<ShoppingList, 'name'> & { budgetGoal?: number | null }
): ShoppingList {
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    budgetGoal: input.budgetGoal ?? null,
    status: 'active',
    totalCost: 0,
    checkedTotal: 0,
    colorTag: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
```

```typescript
// src/models/ListItem.ts

export type PriceSource = 'manual' | 'barcode' | 'nfe';
export type ItemUnit = 'un' | 'kg' | 'g' | 'L' | 'ml' | 'cx' | 'pct';

export interface ListItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  lineTotal: number;
  pricePerRefUnit: number | null;
  isChecked: boolean;
  position: number;
  categoryId: string | null;
  barcodeEan: string | null;
  priceSource: PriceSource;
  createdAt: number;
  updatedAt: number;
}

export function createListItem(
  input: Pick<ListItem, 'listId' | 'name' | 'quantity' | 'unit' | 'unitPrice' | 'position'>
    & { priceSource?: PriceSource }
): ListItem {
  const lineTotal = parseFloat((input.quantity * input.unitPrice).toFixed(2));
  return {
    id: crypto.randomUUID(),
    ...input,
    lineTotal,
    pricePerRefUnit: null,
    isChecked: false,
    categoryId: null,
    barcodeEan: null,
    priceSource: input.priceSource ?? 'manual',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
```

### Regras dos Models
- Interface define o shape completo
- Factory function recebe apenas os campos obrigatórios que o usuário fornece
- `id`, `createdAt`, `updatedAt` são sempre gerados pelo factory
- Zero lógica de negócio além de computar `lineTotal`

---

## Controllers

```typescript
// src/controllers/ListItemController.ts

import { db } from '@/models/db';
import { createListItem, type ListItem } from '@/models/ListItem';
import { ShoppingListController } from './ShoppingListController';
import {
  ITEM_NOME_MAX, ITEM_NOME_MIN,
  ITEM_QUANTIDADE_MAX, ITEM_QUANTIDADE_MIN,
  ITEM_PRECO_MAX, ITEM_PRECO_MIN,
  UNIDADES_VALIDAS,
} from '@/utils/validation';

type AddItemInput = Pick<ListItem, 'listId' | 'name' | 'quantity' | 'unit' | 'unitPrice'>;

export const ListItemController = {

  async addItem(input: AddItemInput): Promise<string> {
    const name = input.name.trim();
    if (name.length < ITEM_NOME_MIN || name.length > ITEM_NOME_MAX) {
      throw new Error(`Nome deve ter entre ${ITEM_NOME_MIN} e ${ITEM_NOME_MAX} caracteres`);
    }
    if (input.quantity < ITEM_QUANTIDADE_MIN || input.quantity > ITEM_QUANTIDADE_MAX) {
      throw new Error(`Quantidade inválida`);
    }
    if (input.unitPrice < ITEM_PRECO_MIN || input.unitPrice > ITEM_PRECO_MAX) {
      throw new Error(`Preço inválido`);
    }
    if (!UNIDADES_VALIDAS.includes(input.unit)) {
      throw new Error(`Unidade inválida`);
    }

    const position = await this._nextPosition(input.listId);
    const item = createListItem({ ...input, name, position });
    await db.listItems.add(item);
    await ShoppingListController.recomputeTotals(input.listId);
    return item.id;
  },

  async toggleCheck(itemId: string): Promise<void> {
    const item = await db.listItems.get(itemId);
    if (!item) return;
    await db.listItems.update(itemId, {
      isChecked: !item.isChecked,
      updatedAt: Date.now(),
    });
    await ShoppingListController.recomputeTotals(item.listId);
  },

  async deleteItem(itemId: string): Promise<void> {
    const item = await db.listItems.get(itemId);
    if (!item) return;
    await db.listItems.delete(itemId);
    await ShoppingListController.recomputeTotals(item.listId);
  },

  async _nextPosition(listId: string): Promise<number> {
    const last = await db.listItems
      .where('listId').equals(listId)
      .sortBy('position');
    return last.length === 0 ? 1000 : (last[last.length - 1]?.position ?? 0) + 1000;
  },
};
```

### Regras dos Controllers
- Objetos literais (singletons exportados), não classes
- Métodos sempre `async` — operações de banco são assíncronas
- Validação antes de qualquer escrita
- `recomputeTotals` chamado após toda mutação de `ListItem` (BR-17)
- Nunca acessar DOM ou React
- Prefixo `_` para métodos internos não exportados

---

## Hooks (Dexie + React)

```typescript
// src/hooks/useListItems.ts
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/models/db';
import type { ListItem } from '@/models/ListItem';

export function useListItems(listId: string): ListItem[] {
  return useLiveQuery(
    () => db.listItems.where('listId').equals(listId).sortBy('position'),
    [listId],
    []
  ) ?? [];
}
```

```typescript
// src/hooks/useShoppingList.ts
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/models/db';
import type { ShoppingList } from '@/models/ShoppingList';

export function useShoppingList(listId: string): ShoppingList | undefined {
  return useLiveQuery(() => db.shoppingLists.get(listId), [listId]);
}
```

### Regras dos Hooks
- Arquivo começa com `'use client'`
- Nome sempre começa com `use`
- Retorna o dado ou valor padrão seguro (nunca `undefined` para arrays)
- Nunca contém lógica de negócio — apenas wrappers de `useLiveQuery`
- Lógica de negócio pertence ao Controller

---

## Componentes React

### Estrutura Obrigatória

```tsx
// src/components/ItemRow.tsx
'use client';

import { ListItemController } from '@/controllers/ListItemController';
import { formatBRL } from '@/utils/currency';
import type { ListItem } from '@/models/ListItem';

interface ItemRowProps {
  item: ListItem;
}

export function ItemRow({ item }: ItemRowProps) {
  async function handleCheck() {
    await ListItemController.toggleCheck(item.id);
  }

  async function handleDelete() {
    await ListItemController.deleteItem(item.id);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={handleCheck}
        className="min-w-[48px] min-h-[48px] flex items-center justify-center"
        aria-label={item.isChecked ? 'Desmarcar item' : 'Marcar como no carrinho'}
      >
        {/* ícone de check */}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-base truncate ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {item.name}
        </p>
      </div>
      <span className="text-base font-medium text-gray-900 tabular-nums">
        {formatBRL(item.lineTotal)}
      </span>
    </div>
  );
}
```

### Regras dos Componentes
- Diretiva `'use client'` em todo componente que usa hooks ou eventos
- Props tipadas com interface local
- Handlers assíncronos chamam Controllers diretamente (sem Context para controllers)
- Tailwind para todo estilo — zero `style={}` para valores de design
- Touch targets: `min-w-[48px] min-h-[48px]` em todo elemento clicável
- `aria-label` obrigatório em botões sem texto visível

---

## Tailwind CSS v4

A referência canônica de todos os tokens está em [`docs/design/tokens.md`](../design/tokens.md).
O inventário de componentes está em [`docs/design/atomic-design.md`](../design/atomic-design.md).

### Tokens completos em `globals.css`

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* --- Tipografia --- */
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;

  --font-size-xs:   0.75rem;    /* 12px — caption, preço unitário */
  --font-size-sm:   0.875rem;   /* 14px — subtítulos de card */
  --font-size-base: 1rem;       /* 16px — nome do item */
  --font-size-lg:   1.125rem;   /* 18px — line total */
  --font-size-xl:   1.25rem;    /* 20px — section total */
  --font-size-2xl:  1.5rem;     /* 24px — grand total */

  /* --- Cores --- */
  --color-primary:         #2e7d32;        /* AppBar, FAB, nav ativa */
  --color-primary-light:   #43a047;        /* swipe Marcar, barra 0-79% */
  --color-primary-dark:    #1b5e20;        /* pressed state FAB */
  --color-warning:         #f57c00;        /* barra 80-99%, badge preço */
  --color-warning-surface: #fff3e0;        /* fundo do badge de preço */
  --color-danger:          #c62828;        /* swipe Deletar, barra >=100% */
  --color-surface:         #ffffff;        /* cards, sheet, inputs */
  --color-background:      #f7f8f6;        /* fundo geral da tela */
  --color-text-primary:    #1a1a1a;        /* textos principais */
  --color-text-secondary:  #595959;        /* subtítulos, nav inativa */
  --color-text-disabled:   #9e9e9e;        /* texto riscado de item checked */
  --color-border:          #e0e0e0;        /* bordas, track de progress bar */
  --color-overlay:         rgba(0,0,0,0.50); /* fundo do bottom sheet */

  /* --- Espaçamento (grid 4px) --- */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px — gutter padrão */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */

  /* --- Tamanhos fixos --- */
  --size-touch-min:     3rem;     /* 48px — área mínima de toque WCAG */
  --size-fab:           3.5rem;   /* 56px — diâmetro do FAB */
  --size-app-bar:       3.5rem;   /* 56px */
  --size-bottom-nav:    3.5rem;   /* 56px */
  --size-sticky-footer: 5.5rem;   /* 88px */
  --size-budget-bar:    0.25rem;  /* 4px */
  --size-app-max-w:     30rem;    /* 480px — container máximo */

  /* --- Border radius --- */
  --radius-sm:   0.5rem;    /* 8px — badges */
  --radius-md:   0.75rem;   /* 12px — cards */
  --radius-lg:   1rem;      /* 16px — bottom sheet */
  --radius-full: 9999px;    /* FAB, progress bar */

  /* --- Sombras --- */
  --shadow-card:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-fab:   0 4px 12px rgba(0,0,0,0.20);
  --shadow-sheet: 0 -4px 20px rgba(0,0,0,0.12);

  /* --- Z-index --- */
  --z-content:       0;
  --z-sticky-footer: 10;
  --z-fab:           20;
  --z-bottom-nav:    30;
  --z-overlay:       40;
  --z-bottom-sheet:  50;

  /* --- Breakpoints --- */
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}
```

### Classes Geradas

Tailwind v4 gera classes a partir dos tokens automaticamente. Exemplos:
- Cores: `bg-primary`, `text-primary`, `border-primary`, `bg-danger`, `text-warning`, `bg-background`, `bg-surface`, `text-text-primary`, `text-text-secondary`, `text-text-disabled`
- Tamanhos: `min-h-touch-min`, `min-w-touch-min`, `w-fab`, `h-fab`, `h-app-bar`, `h-bottom-nav`, `max-w-app-max-w`
- Radii: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`
- Sombras: `shadow-card`, `shadow-fab`, `shadow-sheet`
- Tipografia: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`

### Responsividade

O app é **mobile-first**. Em telas maiores, o layout centraliza em coluna única:

```tsx
// src/app/layout.tsx — container obrigatório
<body>
  <div className="mx-auto w-full max-w-[var(--size-app-max-w)] min-h-dvh relative">
    {children}
  </div>
</body>
```

- `max-w-[var(--size-app-max-w)]` (480px) — limita a largura em desktop
- `relative` — contém FAB, footer e outros elementos `absolute`
- Nunca `position: fixed` em elementos de layout — usar `sticky` ou `absolute` dentro do container

### Regras de Tailwind
- Usar classes de token semântico (`text-primary`, `bg-danger`) — nunca cores hardcoded (`text-green-800`, `bg-red-700`)
- Nunca escrever valor hex diretamente em componentes — o hex pertence ao `globals.css`
- Breakpoints: `sm:` (480px+), `md:` (768px+) — sempre partir do mobile
- Variante `motion-reduce:` em toda animação (acessibilidade)
- Valores monetários: sempre `tabular-nums` (`font-variant-numeric: tabular-nums`)
- Não usar `@apply` fora de `globals.css` — classes utilitárias direto no JSX

---

## Segurança

### XSS
```tsx
// PROIBIDO
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// CORRETO — React escapa automaticamente
<p>{item.name}</p>
```

React escapa strings por padrão. O único risco é `dangerouslySetInnerHTML` — nunca usar com dados do usuário.

### Validação
- Todo dado de formulário é validado no Controller
- Constantes de validação em `src/utils/validation.ts`
- `Number()` com fallback para campos numéricos de formulário: `Number(value) || 0`
- `.trim()` em todo campo de texto antes de validar

---

## Formatação de Moeda

```typescript
// src/utils/currency.ts

// Instância criada UMA VEZ no módulo — reutilizada em todas as chamadas
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

export function formatBRL(value: number): string {
  return formatter.format(value);
}
```

**Nunca** usar `value.toFixed(2)` com prefixo `"R$ "` — o formato pt-BR usa vírgula como decimal e ponto como milhar, e `toFixed` não faz isso.

---

## Comentários

- Comentar apenas o **porquê não-óbvio** (workaround de bug, invariante sutil, restrição de browser)
- Nunca comentar o **que** o código faz
- Nunca comentar código desativado — deletar, usar git history

```typescript
// BOM: explica a restrição do browser
// Chrome Android em modo 'resize' não dispara window.resize quando o teclado abre.
// visualViewport.resize é o único evento confiável para isso.
visualViewport?.addEventListener('resize', handleViewportResize);

// RUIM: óbvio pelo código
// Soma quantidade vezes preço
const lineTotal = quantity * unitPrice;
```

---

## Git e Commits (Conventional Commits)

```
feat(item-form): adiciona calculadora de preço por unidade inline
fix(total-footer): corrige checkedTotal ao desmarcar último item
test(ListItemController): cobre toggleCheck em lista vazia
refactor(db): extrai schema para arquivo dedicado
```

**Tipos**: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`

### Branches

```
feat/item-form-sheet
fix/total-footer-sync
refactor/dexie-schema-v1
```

### Pull Requests
- Máximo ~400 linhas modificadas (exceto tasks de setup)
- Descrição: o que mudou, por que, como testar
- PR passa lint + testes antes de merge
