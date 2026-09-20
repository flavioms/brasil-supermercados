# Backlog V0 — MVP

Cada tarefa é uma unidade de trabalho para um agente. Ordem é importante — respeitar dependências.
Ao iniciar qualquer tarefa, ler [`CLAUDE.md`](../../CLAUDE.md) primeiro.

**Legenda de status**: `[ ]` pendente · `[x]` concluído · `[~]` em progresso

---

## Fase 0: Setup do Projeto

### TASK-001 — Inicializar projeto Next.js + TypeScript + Tailwind
**Estimativa**: 45 min
**Critério de done**: `npm run lint`, `npm run build` e `npm test` passam sem erros
**Referências**: [`setup-tooling.md`](setup-tooling.md)

```bash
npx create-next-app@latest supermercado-brasil \
  --typescript --tailwind --app --src-dir --import-alias "@/*" --no-turbopack
```

Após criar:
- Atualizar `next.config.ts` com `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true` e plugin `@ducanh2912/next-pwa`
- Atualizar `tsconfig.json` com `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `exactOptionalPropertyTypes: true`
- Criar `eslint.config.mjs` conforme `setup-tooling.md`
- Criar `.prettierrc` com `prettier-plugin-tailwindcss`
- Criar `.editorconfig` e `.gitignore`
- Criar `vitest.config.ts` com `environment: 'jsdom'`, plugin React, alias `@/*`
- Criar `tests/setup.ts` com `fake-indexeddb/auto` e `@testing-library/jest-dom`
- Criar estrutura de diretórios: `src/{controllers,hooks,utils,data}` e `tests/unit/{controllers,models,utils,components}`
- Instalar dependências: `dexie`, `dexie-react-hooks`, `@ducanh2912/next-pwa`
- Instalar devDependencies: `vitest`, `@vitest/coverage-v8`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `fake-indexeddb`, `jsdom`, `prettier-plugin-tailwindcss`

---

### TASK-002 — Design tokens e globals.css
**Estimativa**: 30 min
**Critério de done**: Classes `text-primary`, `bg-danger`, `min-h-touch`, `text-body` funcionam no JSX
**Referências**: [`coding-standards.md`](coding-standards.md) — seção Tailwind, [`ux-guidelines.md`](../ux-guidelines.md)

Atualizar `src/app/globals.css`:
- `@import "tailwindcss"`
- Bloco `@theme` com tokens completos: cores (primary, danger, warning, surface), tipografia (caption, body, title, headline), espaçamento (touch: 48px)
- Animação `pulse-quick` para o footer de totais
- Reset mínimo: `box-sizing: border-box`, `font-family: system-ui`, scroll behavior

---

### TASK-003 — PWA: manifest e metadata
**Estimativa**: 20 min
**Critério de done**: Lighthouse PWA — "Installable" ✓ após `npm run build`
**Referências**: [`technical-stack.md`](../architecture/technical-stack.md) — seção Manifest PWA

- Criar `public/manifest.json` com `name`, `short_name`, `display: standalone`, `orientation: portrait`, `theme_color: #2e7d32`, ícones (192, 512, maskable)
- Criar ícones SVG placeholder em `public/icons/`
- Adicionar metadata PWA no `src/app/layout.tsx`: `<link rel="manifest">`, `<meta name="theme-color">`, `viewport` com `interactive-widget=resizes-visual`
- Registrar Service Worker no `layout.tsx` via `useEffect` (client-only)

---

## Fase 1: Models e Banco de Dados

### TASK-004 — Dexie schema (`src/models/db.ts`)
**Estimativa**: 20 min
**Critério de done**: Teste unitário verifica que o banco abre, aceita um registro e retorna o correto
**Referências**: [`data-model.md`](../architecture/data-model.md) — seção Schema IndexedDB

- Criar instância Dexie com `version(1)`: `shoppingLists`, `listItems`, `categories`
- Exportar instância `db` como singleton
- O arquivo `db.ts` é o **único** lugar onde a instância Dexie é criada

---

### TASK-005 — Interfaces e factory functions: ShoppingList e ListItem
**Estimativa**: 30 min
**Critério de done**: Testes cobrem criação, campos padrão, `lineTotal` calculado, UUID gerado
**Referências**: [`data-model.md`](../architecture/data-model.md), [`coding-standards.md`](coding-standards.md) — seção Models

- `src/models/ShoppingList.ts` — interface `ShoppingList` + `createShoppingList()`
- `src/models/ListItem.ts` — interface `ListItem`, tipos `PriceSource`, `ItemUnit` + `createListItem()`
- `src/models/Category.ts` — interface + constante `CATEGORIAS_PADRAO` (10 categorias BR)

Testes em `tests/unit/models/`

---

### TASK-006 — Utils: currency, uuid, validation, units, haptics
**Estimativa**: 45 min
**Critério de done**: Cobertura ≥ 90% em utils
**Referências**: [`business-rules.md`](../business-rules.md) — seção Validações

- `src/utils/currency.ts` — `formatBRL(value: number): string` com `Intl.NumberFormat` instanciado uma vez
- `src/utils/uuid.ts` — `generateUUID(): string` via `crypto.randomUUID()` com fallback
- `src/utils/validation.ts` — constantes `LISTA_NOME_MIN/MAX`, `ITEM_NOME_MIN/MAX`, `ITEM_QUANTIDADE_MIN/MAX`, `ITEM_PRECO_MIN/MAX`, `UNIDADES_VALIDAS`; funções `validateListName()`, `validateItemFields()` retornam `{ valid: boolean; error: string | null }`
- `src/utils/units.ts` — `calcPricePerRefUnit(unitPrice, quantity, unit): number | null`, `getRefUnit(unit): string | null`, `UNIT_CONVERSION_TABLE`
- `src/utils/haptics.ts` — `hapticFeedback(pattern?: number[]): void` com feature detection

Testes em `tests/unit/utils/`

---

## Fase 2: Hooks (bridge Dexie → React)

### TASK-007 — Custom hooks de liveQuery
**Estimativa**: 30 min
**Critério de done**: Hooks retornam dados corretos em teste com React Testing Library + fake-indexeddb
**Referências**: [`coding-standards.md`](coding-standards.md) — seção Hooks

Todos com `'use client'` no topo e valor inicial seguro:

- `src/hooks/useShoppingLists.ts` — listas ativas ordenadas por `createdAt DESC`
- `src/hooks/useShoppingList.ts` — uma lista por id
- `src/hooks/useListItems.ts` — itens de uma lista ordenados por `position ASC`
- `src/hooks/useListTotal.ts` — retorna `{ totalCost, checkedTotal, budgetGoal }` de uma lista

---

## Fase 3: Controllers

### TASK-008 — ShoppingListController
**Estimativa**: 1h
**Critério de done**: Cobertura ≥ 80%; `recomputeTotals` testado com múltiplos itens
**Referências**: [`business-rules.md`](../business-rules.md) BR-01 a BR-08, BR-17 a BR-19

Métodos obrigatórios:
- `createList(name, budgetGoal?)` → `Promise<string>`
- `renameList(listId, newName)` → `Promise<void>`
- `setBudgetGoal(listId, goal)` → `Promise<void>`
- `archiveList(listId)` → `Promise<void>`
- `restoreList(listId)` → `Promise<void>`
- `deleteList(listId)` → `Promise<void>` (cascata em ListItems — BR-05)
- `recomputeTotals(listId)` → `Promise<void>` (BR-17)

Testes em `tests/unit/controllers/ShoppingListController.test.ts`

---

### TASK-009 — ListItemController
**Estimativa**: 1h 30min
**Critério de done**: Cobertura ≥ 80%; `recomputeTotals` chamado após toda mutação
**Referências**: [`business-rules.md`](../business-rules.md) BR-09 a BR-16

Métodos obrigatórios:
- `addItem(input)` → `Promise<string>` — valida, cria, chama `recomputeTotals`
- `updateItem(itemId, changes)` → `Promise<void>` — recalcula `lineTotal`, chama `recomputeTotals`
- `toggleCheck(itemId)` → `Promise<void>` — chama `recomputeTotals`
- `deleteItem(itemId)` → `Promise<void>` — chama `recomputeTotals`
- `updateQuantity(itemId, quantity)` → `Promise<void>` — atalho para stepper

**Gap encoding de posição**:
- Lista vazia: `position = 1000`
- Item novo: `position = último.position + 1000`

Testes em `tests/unit/controllers/ListItemController.test.ts`

---

### TASK-010 — PriceComparisonController
**Estimativa**: 45 min
**Critério de done**: Cobertura ≥ 90%; normalização g→kg, ml→L testados
**Referências**: [`data-model.md`](../architecture/data-model.md) — tabela de conversão

Métodos:
- `calcPricePerUnit(unitPrice, quantity, unit)` → `{ value: number; refUnit: string } | null`
- `comparePrices(items)` → `string | null` (id do item mais barato)
- `suggestBestValue(item, allItemsInList)` → `{ hasBetter: boolean; betterItemId: string | null }`

Testes em `tests/unit/controllers/PriceComparisonController.test.ts`

---

### TASK-011 — AutocompleteController
**Estimativa**: 1h
**Critério de done**: `getSuggestions('arr')` retorna sugestões; catálogo carregado lazy
**Referências**: [`mvc-overview.md`](../architecture/mvc-overview.md) — seção Autocomplete

Métodos:
- `getSuggestions(query, limit?)` → `Promise<Suggestion[]>` — cascata: histórico local → catálogo bundlado
- `buildLocalIndex()` — lê itens distintos do IndexedDB, guarda em memória
- `loadBundledCatalog()` — importa `data/produtos-br.json` lazy (import dinâmico), cacheia em memória

Tipo `Suggestion`: `{ name: string; unit: ItemUnit; lastPrice?: number }`

Testes em `tests/unit/controllers/AutocompleteController.test.ts`

---

### TASK-012 — OfflineQueueController (stub)
**Estimativa**: 15 min
**Critério de done**: Métodos existem, tipados, não lançam erro

```typescript
export const OfflineQueueController = {
  async enqueue(_entityType: string, _entityId: string, _operation: string, _payload: unknown): Promise<void> {},
  async processQueue(): Promise<void> {},
  async clearQueue(): Promise<void> {},
};
```

---

## Fase 4: Service Worker

### TASK-013 — PWA offline via next-pwa
**Estimativa**: 45 min
**Critério de done**: App funcional 100% offline após primeira carga; Lighthouse PWA ≥ 90
**Referências**: [`technical-stack.md`](../architecture/technical-stack.md) — seção Service Worker

Configurar no `next.config.ts` via opções do `@ducanh2912/next-pwa`:

```typescript
// Estratégias de cache a configurar:
// - HTML/JS/CSS do app: StaleWhileRevalidate
// - Imagens/ícones: CacheFirst (30 dias)
// - produtos-br.json: CacheFirst (permanente)
// - Open Food Facts API: NetworkFirst + fallback 24h (V1)
```

Toast de atualização: componente React que detecta `waiting` do SW e exibe "Nova versão disponível" com botão de refresh.

---

## Fase 5: Componentes React

### TASK-014 — `<BottomSheet>` (container genérico)
**Estimativa**: 1h 30min
**Critério de done**: Abre/fecha com `translate-y` via Tailwind; fecha com Escape; reposiciona com teclado Android
**Referências**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Desafio Técnico #1

```tsx
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}
```

- Animação com classes Tailwind: `translate-y-0` (aberto) / `translate-y-full` (fechado) + `transition-transform`
- Overlay com `backdrop-blur-sm` fecha ao clicar fora
- `role="dialog"`, `aria-label={label}`, `aria-modal="true"`
- Escuta `visualViewport.resize` (não `window.resize`) para reposicionar quando teclado Android abre
- `useEffect` com `addEventListener('keydown')` para fechar com Escape

---

### TASK-015 — `<SwipeContainer>` (gestos de swipe)
**Estimativa**: 2h
**Critério de done**: Swipe direita revela ação verde; swipe esquerda revela ação vermelha; não ativa a < 20px da borda
**Referências**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Desafio Técnico #2

```tsx
interface SwipeContainerProps {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  rightLabel: string;
  leftLabel: string;
  children: React.ReactNode;
}
```

Implementação via `useRef` + `touchstart`/`touchmove`/`touchend`:
```tsx
// Ignorar swipes que iniciam a menos de 20px da borda esquerda
if (touchStartX < 20) return;
```

Transform via `style={{ transform: `translateX(${deltaX}px)` }}` — não via Tailwind (valor dinâmico).

---

### TASK-016 — `<PriceComparisonBadge>`
**Estimativa**: 20 min
**Critério de done**: Renderiza "R$ 9,99/L"; oculto quando `pricePerRefUnit` é null

```tsx
interface PriceComparisonBadgeProps {
  pricePerRefUnit: number | null;
  refUnit: string | null;
}
```

---

### TASK-017 — `<BudgetProgressBar>`
**Estimativa**: 30 min
**Critério de done**: Verde < 75%, âmbar ≥ 75%, vermelho ≥ 100%; oculto sem `goal`; testes cobrem thresholds
**Referências**: [`business-rules.md`](../business-rules.md) BR-18/BR-19

```tsx
interface BudgetProgressBarProps {
  current: number;
  goal: number | null;
}
```

Usar `data-testid="progress-bar"` para facilitar seleção nos testes.

---

### TASK-018 — `<StickyTotalFooter>`
**Estimativa**: 45 min
**Critério de done**: Sempre visível; valores formatados com `formatBRL`; linha "Falta" condicional; animação de pulso ao mudar
**Referências**: [`business-rules.md`](../business-rules.md) BR-06/BR-07; [`coding-standards.md`](coding-standards.md)

```tsx
interface StickyTotalFooterProps {
  totalCost: number;
  checkedTotal: number;
  budgetGoal: number | null;
}
```

- `position: sticky; bottom: 0` via `className="sticky bottom-0 ..."`
- Animação de pulso: `useEffect` adiciona classe de animação quando `totalCost` muda, remove após 300ms

Testes em `tests/unit/components/StickyTotalFooter.test.tsx`

---

### TASK-019 — `<AutocompleteInput>`
**Estimativa**: 1h 30min
**Critério de done**: Sugestões após 2 caracteres com debounce 150ms; seleção preenche o campo; dismiss ao tocar fora
**Referências**: [`mvc-overview.md`](../architecture/mvc-overview.md) — seção Autocomplete

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
- Máximo 5 sugestões no dropdown
- `useRef` para detectar clique fora e fechar dropdown

---

### TASK-020 — `<ItemFormSheet>`
**Estimativa**: 3h
**Critério de done**: Formulário valida, preview de `lineTotal` em tempo real; fecha ao confirmar; modo add e edit
**Referências**: [`business-rules.md`](../business-rules.md) BR-09 a BR-16

```tsx
interface ItemFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  itemId?: string;  // undefined = modo add; definido = modo edit
}
```

Campos:
- Nome: `<AutocompleteInput>` — obrigatório
- Quantidade: `<input type="number" inputMode="decimal">` — mín 0.001
- Unidade: `<select>` — un/kg/g/L/ml/cx/pct
- Preço unitário: `<input type="number" inputMode="decimal">` — mín 0

Preview em tempo real:
- `lineTotal` = `qty * price` — atualiza a cada keystroke via `useState` local
- `pricePerRefUnit` — calculado via `PriceComparisonController.calcPricePerUnit()`

Ao confirmar:
- Modo add: chama `ListItemController.addItem()`
- Modo edit: chama `ListItemController.updateItem()`
- Em ambos: fecha o sheet

---

### TASK-021 — `<ItemRow>`
**Estimativa**: 1h 30min
**Critério de done**: Renderiza nome, preço, total; swipe funciona; badge de preço/unidade visível
**Referências**: [`mvc-overview.md`](../architecture/mvc-overview.md) — seção ItemRow

Composição:
- Usa `<SwipeContainer>` — swipe direita = `toggleCheck`, swipe esquerda = `deleteItem`
- Exibe `<PriceComparisonBadge>` se `pricePerRefUnit !== null`
- Ao tocar no nome: chama `onEditRequest(item.id)`

```tsx
interface ItemRowProps {
  item: ListItem;
  onEditRequest: (itemId: string) => void;
}
```

Testes em `tests/unit/components/ItemRow.test.tsx`

---

### TASK-022 — `<ListCard>`
**Estimativa**: 45 min
**Critério de done**: Exibe nome, total, barra de progresso mini, data relativa
**Referências**: [`ux-guidelines.md`](../ux-guidelines.md)

```tsx
interface ListCardProps {
  list: ShoppingList;
  onClick: () => void;
}
```

---

## Fase 6: Telas (Next.js pages)

### TASK-023 — `src/app/page.tsx` (tela home — listas)
**Estimativa**: 1h 30min
**Critério de done**: Exibe listas ativas via `useShoppingLists`; botão "Nova lista" abre sheet de criação; estado vazio com CTA
**Referências**: [`mvc-overview.md`](../architecture/mvc-overview.md) — Inventário de Telas

```
'use client'
→ useShoppingLists() → lista de <ListCard>
→ FAB "+" → BottomSheet com form de nova lista
→ Navegar para /lista/[id] ao clicar em um card
```

Estado vazio: ilustração SVG inline + botão "Criar primeira lista".

---

### TASK-024 — `src/app/lista/[id]/page.tsx` (tela principal)
**Estimativa**: 4h
**Critério de done**: Fluxo completo — adicionar item → marcar → ver total atualizar; footer sempre visível; swipe funcional
**Referências**: [`mvc-overview.md`](../architecture/mvc-overview.md) — hierarquia de componentes

Esta é a tela mais crítica do app. 90% do uso acontece aqui.

```
'use client'
→ useParams() para obter listId
→ useShoppingList(listId) → dados da lista
→ useListItems(listId) → itens separados em checked/unchecked
→ <BudgetProgressBar current={list.totalCost} goal={list.budgetGoal} />
→ seção unchecked: <ItemRow> × N
→ seção checked: colapsada por padrão, toggle para expandir
→ <StickyTotalFooter totalCost checkedTotal budgetGoal />
→ FAB "+" → abre <ItemFormSheet isOpen listId />
```

`generateStaticParams()` retorna `[]` — o id é lido no cliente via `useParams()`.

---

### TASK-025 — `src/app/configuracoes/page.tsx` (configurações)
**Estimativa**: 45 min
**Critério de done**: Toggle de tema funciona (localStorage); "Apagar todos os dados" funciona com confirmação
**Referências**: [`business-rules.md`](../business-rules.md) — LGPD-03/LGPD-04

Funcionalidades mínimas:
- Toggle claro/escuro (salvo em `localStorage`)
- "Apagar todos os dados" — `window.confirm()` → `db.delete()` + redirect para home
- Versão do app (de `package.json`)

---

## Fase 7: Dados

### TASK-026 — Catálogo de produtos BR (subset V0)
**Estimativa**: 1h 30min
**Critério de done**: `getSuggestions('arr')` retorna "Arroz"; `getSuggestions('ole')` retorna "Óleo de Soja"

Criar `src/data/produtos-br.json` com 200–300 entradas cobrindo:
- Grãos: arroz (tipos 1/5kg/10kg), feijão carioca/preto, macarrão, aveia
- Óleos: soja 900ml/2L, azeite, canola
- Laticínios: leite integral/desnatado/sem lactose, queijo mussarela/prato, manteiga, iogurte
- Carnes: peito de frango, carne moída, linguiça calabresa
- Hortifruti: tomate, cebola, alho, batata, cenoura, alface, banana, laranja
- Limpeza: detergente, amaciante, sabão em pó, desinfetante
- Higiene: sabonete, shampoo, condicionador, creme dental, papel higiênico
- Bebidas: refrigerante 2L, suco, água mineral
- Padaria: pão de forma, biscoito cream cracker

Formato:
```json
[{ "name": "Arroz Branco Tipo 1 1kg", "unit": "kg", "aliases": ["arroz", "arroz tipo 1"] }]
```

---

## Fase 8: CI/CD e Qualidade Final

### TASK-027 — GitHub Actions
**Estimativa**: 30 min
**Critério de done**: Push na `main` faz deploy; PR gera URL de preview; lint + tests rodam no CI
**Referências**: [`setup-tooling.md`](setup-tooling.md)

Criar `.github/workflows/ci.yml` exatamente conforme `setup-tooling.md`.

---

### TASK-028 — Checklist PWA + Lighthouse
**Estimativa**: 1h
**Critério de done**: Lighthouse PWA ≥ 90; Performance ≥ 70 no perfil Pixel 5; todos os itens marcados

**PWA**
- [ ] Manifest válido e completo
- [ ] Service Worker registrado e funcional
- [ ] App instalável
- [ ] 100% funcional offline após primeira carga

**Performance**
- [ ] TTI < 3s em perfil Android 4G (Lighthouse DevTools)
- [ ] `produtos-br.json` carregado lazy (não no bundle inicial)
- [ ] Sem bloqueio de renderização no `<head>`

**Acessibilidade**
- [ ] Touch targets ≥ 48px em todos os controles interativos
- [ ] Contraste ≥ 4.5:1 (WCAG AA)
- [ ] `BottomSheet` com `role="dialog"` + `aria-label`
- [ ] Botões sem texto visível têm `aria-label`
- [ ] Funciona com navegação por teclado (Tab, Enter, Escape)

**LGPD**
- [ ] Sem dados pessoais no IndexedDB
- [ ] "Apagar todos os dados" funcional
- [ ] Sem tracking externo de terceiros

**Segurança**
- [ ] Sem `dangerouslySetInnerHTML` com dados do usuário
- [ ] HTTPS ativo no deploy (Cloudflare Pages garante automaticamente)

---

## Ordem de Execução Recomendada

```
TASK-001 → TASK-002 → TASK-003
    ↓
TASK-004 → TASK-005 → TASK-006
    ↓
TASK-007 (hooks — depende dos models)
    ↓
TASK-008 → TASK-009 → TASK-010 → TASK-011 → TASK-012
    ↓
TASK-013 (Service Worker — pode ser paralelo com controllers)
    ↓
TASK-014 → TASK-015 (BottomSheet + SwipeContainer — base dos outros)
    ↓
TASK-016 → TASK-017 → TASK-018 → TASK-019
    ↓
TASK-020 → TASK-021 → TASK-022
    ↓
TASK-023 → TASK-024 → TASK-025
    ↓
TASK-026 (dados — pode ser paralelo com telas)
    ↓
TASK-027 → TASK-028
```

**Dependências críticas**:
- TASK-007 (hooks) depende de TASK-004/005 (models + db)
- TASK-009 (ListItemController) depende de TASK-008 (ShoppingListController)
- TASK-020 (ItemFormSheet) depende de TASK-014 (BottomSheet) e TASK-019 (AutocompleteInput)
- TASK-024 (list-detail-screen) depende de TASK-017, 018, 020, 021
