# CLAUDE.md — Guia Obrigatório para Agentes

Este arquivo é lido automaticamente por todo agente Claude Code ao iniciar uma sessão neste projeto.
Toda instrução aqui tem precedência sobre comportamentos padrão do agente.

---

## Contexto do Produto

PWA offline-first para brasileiros controlarem gastos no supermercado em tempo real.
**Problema central**: famílias brasileiras não sabem o total antes do caixa.
**Persona primária**: "A Maria" — mãe de família, Android mid-range (Moto G), Atacadão, R$ 600/semana, medo de devolver item no caixa.

**Teste de relevância de toda feature**: "isso ajuda o usuário a economizar?"

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | **Next.js** (`output: 'export'`) | 15.x |
| Linguagem | **TypeScript** strict | 5.x |
| CSS | **Tailwind CSS** | 4.x |
| Storage | **Dexie.js** + `useLiveQuery` | 4.x |
| Service Worker | **next-pwa** (Workbox) | latest |
| Deploy | **Cloudflare Pages** (estático) | — |

**`output: 'export'`** é obrigatório — gera HTML estático puro sem servidor Node.js.
Isso significa: sem Server Components com fetch, sem API Routes, sem Server Actions no V0/V1.
Todo acesso a dados é client-side via Dexie.js.

---

## Regras Absolutas da Stack (NÃO VIOLAR)

1. **`'use client'` em todo componente que usa Dexie** — `useLiveQuery` é client-only
2. **Zero `useState` para dados persistidos** — dados do IndexedDB vêm exclusivamente via `useLiveQuery`
3. **Zero acesso direto ao banco fora de hooks** — componentes chamam controllers; controllers acessam Dexie
4. **Zero `any` em TypeScript** — usar `unknown` + type guard se o tipo for incerto
5. **Tailwind via classes utilitárias + design tokens** — sem `style={}` inline para valores de design
6. **CSS Custom Properties para tokens** — definidos no `globals.css` com `@theme` do Tailwind v4; reutilizados nos componentes via classes Tailwind
7. **`Intl.NumberFormat`** para moeda — nunca `toFixed(2)` com `"R$ "` manual
8. **Dexie.js** é a única forma de persistir dados (exceto `localStorage` para preferências simples)
9. **Toda alteração visual deve ser validada com Playwright ao final da task** — rodar `npm run test:e2e` e confirmar que a tela renderiza corretamente em viewport mobile (375×812) antes de considerar a task concluída

---

## Estrutura de Arquivos (seguir estritamente)

```
src/
├── app/                    ← Next.js App Router
│   ├── layout.tsx          ← RootLayout: providers, fonts, metadata PWA
│   ├── page.tsx            ← lists-screen (home)
│   ├── lista/
│   │   └── [id]/
│   │       └── page.tsx    ← list-detail-screen
│   ├── configuracoes/
│   │   └── page.tsx        ← settings-screen
│   └── globals.css         ← Tailwind @import + @theme tokens
│
├── components/             ← Componentes React (Atomic Design)
│   ├── atoms/              ← Primitivos: CheckCircle, PriceBadge, ProgressBar,
│   │                       │   FAB, SectionLabel, IconButton, BottomSheetHandle
│   ├── molecules/          ← Composições: ItemRow, ListCard, BudgetBarHeader,
│   │                       │   FooterRow, AutocompleteOption, NavItem
│   ├── organisms/          ← Seções: AppBar, ListSection, ItemSection,
│   │                       │   StickyTotalFooter, BottomNav, ItemFormSheet
│   └── templates/          ← Layouts: HomeTemplate, BuyingSessionTemplate
│
├── controllers/            ← Lógica de negócio (módulos TS puros)
│   ├── ShoppingListController.ts
│   ├── ListItemController.ts
│   ├── AutocompleteController.ts
│   ├── PriceComparisonController.ts
│   └── OfflineQueueController.ts
│
├── hooks/                  ← Custom hooks (Dexie liveQuery wrappers)
│   ├── useShoppingLists.ts
│   ├── useListItems.ts
│   ├── useListTotal.ts
│   └── useAutocomplete.ts
│
├── models/                 ← Tipos TypeScript + factory functions + schema Dexie
│   ├── db.ts
│   ├── ShoppingList.ts
│   ├── ListItem.ts
│   └── Category.ts
│
├── utils/                  ← Funções puras sem side effects
│   ├── currency.ts
│   ├── uuid.ts
│   ├── validation.ts
│   ├── units.ts
│   └── haptics.ts
│
└── data/
    └── produtos-br.json    ← catálogo offline ~5k produtos BR
```

---

## Fluxo de Dados (unidirecional, sem exceção)

```
Componente → Controller → IndexedDB (Dexie) → useLiveQuery → Componente
```

- Componentes **nunca** escrevem diretamente no banco
- Dados do banco **sempre** chegam via `useLiveQuery` (nunca via props drilling do banco)
- Controllers são funções puras assíncronas — sem estado próprio, sem acesso ao DOM

---

## Padrão de Hook (obrigatório)

```typescript
// src/hooks/useListItems.ts
'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/models/db';

export function useListItems(listId: string) {
  return useLiveQuery(
    () => db.listItems.where('listId').equals(listId).sortBy('position'),
    [listId],
    []  // valor inicial enquanto carrega
  );
}
```

---

## Padrão de Controller (obrigatório)

```typescript
// src/controllers/ShoppingListController.ts
import { db } from '@/models/db';
import { createShoppingList } from '@/models/ShoppingList';
import { LISTA_NOME_MAX, LISTA_NOME_MIN } from '@/utils/validation';

export const ShoppingListController = {
  async createList(name: string, budgetGoal: number | null = null): Promise<string> {
    const trimmed = name.trim();
    if (trimmed.length < LISTA_NOME_MIN || trimmed.length > LISTA_NOME_MAX) {
      throw new Error(`Nome deve ter entre ${LISTA_NOME_MIN} e ${LISTA_NOME_MAX} caracteres`);
    }
    const list = createShoppingList({ name: trimmed, budgetGoal });
    await db.shoppingLists.add(list);
    return list.id;
  },
};
```

---

## Padrão de Componente (obrigatório)

```tsx
// src/components/StickyTotalFooter.tsx
'use client';
import { formatBRL } from '@/utils/currency';

interface Props {
  totalCost: number;
  checkedTotal: number;
  budgetGoal: number | null;
}

export function StickyTotalFooter({ totalCost, checkedTotal, budgetGoal }: Props) {
  return (
    <footer className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.15)]">
      <div className="flex justify-between text-sm text-gray-600">
        <span>No carrinho</span>
        <span className="font-medium">{formatBRL(checkedTotal)}</span>
      </div>
      {/* ... */}
    </footer>
  );
}
```

---

## Tailwind e Design Tokens

Design tokens são definidos como CSS Custom Properties no `globals.css` via `@theme` do Tailwind v4:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary:   #2e7d32;
  --color-danger:    #c62828;
  --color-warning:   #f57c00;

  --font-size-caption: 12px;
  --font-size-body:    16px;
  --font-size-title:   18px;

  --spacing-touch: 48px;  /* touch target mínimo WCAG */
}
```

Usar via classes Tailwind geradas: `text-primary`, `bg-danger`, `min-h-touch`.

---

## Regras de Negócio — Onde Estão

Fonte da verdade: [`docs/business-rules.md`](docs/business-rules.md)
Constantes de validação: `src/utils/validation.ts`

---

## Testes

Ver [`docs/engineering/testing-strategy.md`](docs/engineering/testing-strategy.md).

Resumo:
- Controllers e utils: **Vitest** (obrigatório no V0)
- Componentes: **React Testing Library** + Vitest (V0+)
- E2E: **Playwright** (V0+ para validação visual)
- IndexedDB: **fake-indexeddb** (nunca mockar)

### Validação visual obrigatória (Regra #9)

Toda task que altere qualquer componente, layout ou token visual **deve** ser encerrada com:

```bash
npm run test:e2e
```

O agente deve:
1. Rodar o build estático (`npm run build`) para gerar o `out/`
2. Servir localmente e rodar Playwright no perfil mobile (375×812, Pixel 5)
3. Verificar que a tela afetada renderiza sem erros visuais e sem regressão nas demais
4. Somente marcar a task como concluída após os testes passarem

Não é suficiente que TypeScript compile e Vitest passe — a validação visual via Playwright é obrigatória para qualquer mudança de UI.

---

## Lint e Formatação

```bash
npm run lint     # ESLint + TypeScript check
npm run test     # Vitest
```

CI bloqueia merge se qualquer um falhar.

---

## Responsividade

O app é **mobile-first** (375–430px). Em desktop, o layout permanece em coluna única centralizada — nunca quebrar em múltiplas colunas.

**Regra do container** (aplicar em `app/layout.tsx`):

```tsx
// app/layout.tsx
<body>
  <div className="mx-auto w-full max-w-[var(--size-app-max-w)] min-h-dvh relative">
    {children}
  </div>
</body>
```

- `max-w-[var(--size-app-max-w)]` = 480px — limita em desktop
- `relative` — contém os elementos `absolute` (FAB, footer)
- Nunca usar `position: fixed` puro em elementos de layout — usar `sticky` ou `absolute` dentro do container para não vazar nas margens desktop

---

## O Que Nunca Fazer

- Não usar `any` — TypeScript strict está ativado
- Não usar `useState` para dados do banco — usar `useLiveQuery`
- Não fazer fetch direto para SEFAZ no cliente (CORS + LGPD)
- Não usar `dangerouslySetInnerHTML` com dados do usuário (XSS)
- Não criar Server Components que acessam banco — `output: 'export'` não suporta
- Não armazenar CPF, e-mail ou nome real no IndexedDB no V0/V1
- Não comentar código óbvio — comentar apenas o "porquê" não-óbvio
- Não instalar dependências sem justificativa — verificar se API nativa resolve

---

## Referências Rápidas

| Documento | Descrição |
|-----------|-----------|
| [`docs/business-rules.md`](docs/business-rules.md) | Regras de negócio BR-01 a BR-42 |
| [`docs/architecture/data-model.md`](docs/architecture/data-model.md) | Schema completo do banco |
| [`docs/architecture/mvc-overview.md`](docs/architecture/mvc-overview.md) | Arquitetura, controllers, fluxos |
| [`docs/architecture/technical-stack.md`](docs/architecture/technical-stack.md) | Stack e justificativas |
| [`docs/roadmap.md`](docs/roadmap.md) | Features por versão (V0/V1/V2) |
| [`docs/engineering/task-backlog-v0.md`](docs/engineering/task-backlog-v0.md) | Backlog detalhado do V0 |
| [`docs/engineering/coding-standards.md`](docs/engineering/coding-standards.md) | Padrões completos de código |
| [`docs/engineering/testing-strategy.md`](docs/engineering/testing-strategy.md) | Estratégia de testes |
| [`docs/engineering/setup-tooling.md`](docs/engineering/setup-tooling.md) | Configuração de lint, CI, deploy |
| [`docs/engineering/architecture-decisions.md`](docs/engineering/architecture-decisions.md) | Por que cada decisão foi tomada |
| [`docs/design/tokens.md`](docs/design/tokens.md) | Design tokens: cores, tipografia, espaçamento, tamanhos |
| [`docs/design/atomic-design.md`](docs/design/atomic-design.md) | Inventário de componentes (Atomic Design) |
