# Inventário de Componentes — Atomic Design

Baseado nas telas em `docs/layout/`. Hierarquia: Átomos → Moléculas → Organismos → Templates → Pages.

Para tokens visuais (cores, tamanhos, espaçamentos) consultar [`docs/design/tokens.md`](./tokens.md).
Para padrões de código (props, hooks, controllers) consultar [`docs/engineering/coding-standards.md`](../engineering/coding-standards.md).

---

## Visão Geral

```
ÁTOMOS          → primitivos sem dependências de outros componentes
MOLÉCULAS       → 2+ átomos com uma função coesa
ORGANISMOS      → seções completas com múltiplas moléculas
TEMPLATES       → estrutura da tela sem dados reais
PAGES           → templates com dados via useLiveQuery
```

Estrutura de diretórios:
```
src/components/
├── atoms/
├── molecules/
├── organisms/
└── templates/
```

Pages ficam em `src/app/` (Next.js App Router).

---

## Átomos

Primitivos sem dependências de outros componentes do projeto.

---

### `CheckCircle`

**Arquivo:** `src/components/atoms/CheckCircle.tsx`

Círculo de seleção de item. Dois estados visuais:
- **Idle:** contorno cinza (`--color-border`), sem preenchimento
- **Checked:** fundo verde (`--color-primary`), ícone de check branco

```typescript
interface CheckCircleProps {
  checked: boolean;
  onToggle: () => void;
  label: string; // aria-label obrigatório
}
```

Área de toque: `min-w-[var(--size-touch-min)] min-h-[var(--size-touch-min)]` (48×48px).
Tamanho visual do círculo: 24px com borda de 2px.

---

### `PriceBadge`

**Arquivo:** `src/components/atoms/PriceBadge.tsx`

Pill laranja com preço por unidade de referência. Exibido apenas para itens com unidade pesável/volumétrica (`kg`, `g`, `L`, `ml`).

```typescript
interface PriceBadgeProps {
  pricePerRefUnit: number; // já calculado pelo controller
  unit: 'kg' | 'L';       // unidade de referência normalizada
}
// Exemplo visual: "R$ 9,99/L"
```

Estilo: `bg-[var(--color-warning-surface)] text-[var(--color-warning)] rounded-full px-2 py-0.5 text-xs font-medium`.

---

### `ProgressBar`

**Arquivo:** `src/components/atoms/ProgressBar.tsx`

Barra de progresso de orçamento com cor dinâmica baseada no percentual.

```typescript
interface ProgressBarProps {
  current: number;
  goal: number | null;
}
// Quando goal === null: renderiza null (sem barra)
```

Altura: `var(--size-budget-bar)` (4px). Track cinza (`--color-border`). Fill arredondado (`rounded-full`).

Lógica de cor (ver `docs/design/tokens.md`):
- `< 80%`: `bg-primary-light`
- `80–99%`: `bg-warning`
- `≥ 100%`: `bg-danger`

---

### `FAB`

**Arquivo:** `src/components/atoms/FAB.tsx`

Botão de ação flutuante. Ícone "+" centralizado.

```typescript
interface FABProps {
  onPress: () => void;
  label: string; // "Adicionar item" ou "Nova lista" — para aria-label
}
```

Tamanho: `w-[var(--size-fab)] h-[var(--size-fab)]` (56×56px). Cor: `bg-primary`. Sombra: `shadow-fab`. Ícone: `+` em branco, 24px.
Posicionamento: `absolute bottom-[calc(var(--size-bottom-nav)+var(--spacing-4))] left-1/2 -translate-x-1/2 z-[var(--z-fab)]`.

---

### `SectionLabel`

**Arquivo:** `src/components/atoms/SectionLabel.tsx`

Rótulo de seção em caixa alta. Ex: "LISTAS ATIVAS", "PARA PEGAR (5)", "ARQUIVADAS (3)".

```typescript
interface SectionLabelProps {
  text: string;
  count?: number; // exibido entre parênteses se fornecido
}
```

Estilo: `text-xs font-semibold uppercase tracking-wider text-text-secondary px-4 pt-6 pb-2`.

---

### `IconButton`

**Arquivo:** `src/components/atoms/IconButton.tsx`

Botão de ícone genérico com área de toque mínima garantida.

```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;          // aria-label obrigatório
  variant?: 'default' | 'ghost'; // ghost sem fundo
}
```

Área de toque: `min-w-[var(--size-touch-min)] min-h-[var(--size-touch-min)]` (48×48px).
Usado em: back arrow do AppBar, botão de fechar (×) do bottom sheet, menu de três pontos.

---

### `BottomSheetHandle`

**Arquivo:** `src/components/atoms/BottomSheetHandle.tsx`

Barra cinza de arrastar no topo do bottom sheet. Puramente visual.

```typescript
// Sem props
```

Estilo: `w-[var(--size-sheet-handle-w)] h-[var(--size-sheet-handle-h)] rounded-full bg-border mx-auto mt-3 mb-2`.

---

## Moléculas

Composições de 2+ átomos com uma única função coesa.

---

### `ItemRow`

**Arquivo:** `src/components/molecules/ItemRow.tsx`

Linha de item da lista com suporte a swipe. Componente mais complexo do app.

```typescript
interface ItemRowProps {
  item: ListItem;
  onToggle: () => void;
  onDelete: () => void;
}
```

**Estados visuais:**
- **Idle (não marcado):** `CheckCircle` vazio, nome normal, preço right-aligned
- **Checked (marcado):** `CheckCircle` verde preenchido, nome riscado + `text-text-disabled`, preço riscado
- **Swipe direita (revelar "Marcar"):** fundo verde `bg-primary-light` aparece à esquerda; indicador de swipe no ícone green com ✓
- **Swipe esquerda (revelar "Deletar"):** fundo vermelho `bg-danger` aparece à direita; ícone de lixeira branco

**Composição:**
- `CheckCircle` (left)
- Nome do item (`text-base`) + `PriceBadge` opcional + unidade/preço unitário (`text-xs text-text-secondary`)
- Preço total (`text-lg font-medium tabular-nums`, right-aligned)

**Dependências:** `CheckCircle`, `PriceBadge`

---

### `ListCard`

**Arquivo:** `src/components/molecules/ListCard.tsx`

Card clicável de lista na home screen.

```typescript
interface ListCardProps {
  list: ShoppingList;
  onClick: () => void;
}
```

**Layout:**
```
┌──────────────────────────────────┐
│ Carrefour Semanal      R$ 234,90 │ ← nome (bold) + total (text-primary bold)
│ ████████████░░░░░░░░░░░   hoje > │ ← ProgressBar + data relativa + chevron
│ R$ 234,90 / R$ 300,00      78%  │ ← valores absolutos + percentual
└──────────────────────────────────┘
```

Quando `budgetGoal === null`: omite `ProgressBar` e mostra "Sem meta de orçamento" em `text-text-secondary`.
Estilo do card: `bg-surface rounded-md shadow-card px-5 py-4`.

**Dependências:** `ProgressBar`

---

### `BudgetBarHeader`

**Arquivo:** `src/components/molecules/BudgetBarHeader.tsx`

Barra de orçamento colada imediatamente abaixo do AppBar na tela de sessão de compra.

```typescript
interface BudgetBarHeaderProps {
  current: number;
  goal: number;
}
// Exibido apenas quando goal > 0
```

**Layout:**
```
[████████████████░░░░]  R$ 487,50 / R$ 600,00
```

`ProgressBar` (4px) + label right-aligned `text-xs text-text-secondary tabular-nums`.

**Dependências:** `ProgressBar`

---

### `FooterRow`

**Arquivo:** `src/components/molecules/FooterRow.tsx`

Uma linha do rodapé de totais.

```typescript
interface FooterRowProps {
  label: string;
  value: number;
  variant: 'default' | 'highlight' | 'total';
}
// default:    text-sm text-text-secondary + valor text-sm text-text-secondary
// highlight:  text-sm text-text-secondary + valor text-base font-medium text-primary
// total:      text-base text-text-primary  + valor text-2xl font-bold text-text-primary
```

Exemplos:
- `variant="highlight"` → "No carrinho" / "R$ 30,49" (verde)
- `variant="total"` → "Total geral" / "R$ 70,97" (bold grande)
- `variant="default"` → "Falta para a meta" / "R$ 529,03"

---

### `AutocompleteOption`

**Arquivo:** `src/components/molecules/AutocompleteOption.tsx`

Uma sugestão no dropdown de autocomplete do formulário de item.

```typescript
interface AutocompleteOptionProps {
  text: string;
  type: 'history' | 'suggestion';
  onSelect: (text: string) => void;
}
// history:    ícone de relógio (últimos adicionados)
// suggestion: ícone de lupa (do catálogo produtos-br.json)
```

Área de toque mínima: 48px de altura. Item selecionado recebe `bg-background`.

---

### `NavItem`

**Arquivo:** `src/components/molecules/NavItem.tsx`

Uma aba da navegação inferior.

```typescript
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
}
// Ativo: ícone e label em text-primary
// Inativo: ícone e label em text-text-secondary
```

Ícones das 3 abas:
- **Listas** (ativa na home/sessão): ícone de lista com check
- **Analíticos**: ícone de gráfico de barras
- **Config**: ícone de engrenagem

---

## Organismos

Seções completas da UI compostas por múltiplas moléculas.

---

### `AppBar`

**Arquivo:** `src/components/organisms/AppBar.tsx`

Barra superior de navegação. Duas variantes:

```typescript
interface AppBarProps {
  variant: 'home' | 'session';
  title: string;
  // home: apenas título + ícone offline
  // session: back arrow + título + menu de 3 pontos
  onBack?: () => void;       // variant='session'
  onMenu?: () => void;       // variant='session'
  offlineIndicator?: boolean; // variant='home'
}
```

Estilo: `bg-primary text-white h-[var(--size-app-bar)] px-4 flex items-center`.
Ícone offline: círculo vazio no canto direito (indica status da conexão).

**Dependências:** `IconButton`

---

### `ListSection`

**Arquivo:** `src/components/organisms/ListSection.tsx`

Seção de listas ativas + seção colapsável de arquivadas.

```typescript
interface ListSectionProps {
  lists: ShoppingList[];
  archivedCount: number;
  onListClick: (id: string) => void;
}
```

**Layout:**
```
LISTAS ATIVAS
[ListCard]
[ListCard]
[ListCard]
ARQUIVADAS (3) ↓   ← colapsável
```

**Dependências:** `SectionLabel`, `ListCard`

---

### `ItemSection`

**Arquivo:** `src/components/organisms/ItemSection.tsx`

Seção de itens com título e lista de `ItemRow`.

```typescript
interface ItemSectionProps {
  title: string;         // "PARA PEGAR (5)" ou "NO CARRINHO (2)"
  items: ListItem[];
  collapsible?: boolean; // "NO CARRINHO" pode ser colapsado
  defaultCollapsed?: boolean;
}
```

**Dependências:** `SectionLabel`, `ItemRow`

---

### `StickyTotalFooter`

**Arquivo:** `src/components/organisms/StickyTotalFooter.tsx`

Barra de rodapé sticky com totais da sessão de compra.

```typescript
interface StickyTotalFooterProps {
  totalCost: number;
  checkedTotal: number;
  budgetGoal: number | null;
}
// Quando budgetGoal === null: omite a linha "Falta para a meta"
```

**Layout:**
```
No carrinho              R$ 30,49   ← FooterRow variant="highlight"
Total geral              R$ 70,97   ← FooterRow variant="total"
Falta para a meta        R$ 529,03  ← FooterRow variant="default" (condicional)
```

Posicionamento: `sticky bottom-0 z-[var(--z-sticky-footer)] bg-surface border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-4 py-3`.

**Dependências:** `FooterRow`

---

### `BottomNav`

**Arquivo:** `src/components/organisms/BottomNav.tsx`

Navegação inferior com 3 abas. Detecta rota ativa via `usePathname()`.

```typescript
// Sem props — as rotas e ícones são fixos
```

Posicionamento: `sticky bottom-0 z-[var(--z-bottom-nav)] bg-surface border-t border-border`.
Altura: `h-[var(--size-bottom-nav)]`.

**Dependências:** `NavItem`

---

### `ItemFormSheet`

**Arquivo:** `src/components/organisms/ItemFormSheet.tsx`

Bottom sheet de adição/edição de item. Contém o formulário completo.

```typescript
interface ItemFormSheetProps {
  listId: string;
  onClose: () => void;
  editItemId?: string; // se definido, modo de edição
}
```

**Campos:**
1. **Nome do produto** — input text + `AutocompleteOption` dropdown
2. **Quantidade** — input numérico
3. **Unidade** — select (`un | kg | g | L | ml | cx | pct`)
4. **Preço** — input numérico com prefixo "R$"
5. **Preview de total** — `lineTotal` calculado em tempo real (verde)
6. **Botão de ação** — "Adicionar" / "Salvar" (full width, `bg-primary`)

Keyboard Android visível abaixo do sheet — campos de formulário devem scrollar acima do teclado.
Overlay escuro atrás: `bg-[var(--color-overlay)] z-[var(--z-overlay)]`.

**Dependências:** `BottomSheetHandle`, `IconButton`, `AutocompleteOption`
**Controller:** `ListItemController.addItem()` / `ListItemController.updateItem()`

---

## Templates

Estrutura da tela sem dados reais. Compõem os organismos no layout correto.

---

### `HomeTemplate`

**Arquivo:** `src/components/templates/HomeTemplate.tsx`

```typescript
interface HomeTemplateProps {
  lists: ShoppingList[];
  archivedCount: number;
  onListClick: (id: string) => void;
  onNewList: () => void;
}
```

**Estrutura:**
```
AppBar (variant="home", title="Supermercado Brasil")
─────────────────────────────────────────────────
[scrollable content]
  ListSection
─────────────────────────────────────────────────
FAB ("Nova lista", onPress=onNewList)
BottomNav (active="listas")
```

**Responsividade:**
- Mobile: layout full-width
- Desktop: container com `max-w-[var(--size-app-max-w)] mx-auto`

---

### `BuyingSessionTemplate`

**Arquivo:** `src/components/templates/BuyingSessionTemplate.tsx`

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

**Estrutura:**
```
AppBar (variant="session", title=list.name)
BudgetBarHeader (quando budgetGoal !== null)
─────────────────────────────────────────────────
[scrollable content]
  ItemSection ("PARA PEGAR", pendingItems)
  ItemSection ("NO CARRINHO", checkedItems, collapsible)
─────────────────────────────────────────────────
StickyTotalFooter
FAB ("Adicionar item", onPress=onAddItem)
BottomNav (active="listas")
[ItemFormSheet — condicional, quando FAB pressionado]
```

---

## Pages

Templates conectados aos dados reais via `useLiveQuery`.

---

### `app/page.tsx` — Home

```typescript
'use client';
// Conecta: useShoppingLists() → HomeTemplate
// Exibe: listas ativas + contagem de arquivadas
// Navega: router.push('/lista/[id]') ao clicar no card
```

---

### `app/lista/[id]/page.tsx` — Sessão de Compra

```typescript
'use client';
// Conecta: useShoppingList(id) + useListItems(id) → BuyingSessionTemplate
// generateStaticParams: retorna [] (id lido no cliente via useParams)
// Separa: itens em pendingItems (isChecked=false) e checkedItems (isChecked=true)
```

---

## Tabela de Componentes × Telas

| Componente | Home | Sessão | Formulário |
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
