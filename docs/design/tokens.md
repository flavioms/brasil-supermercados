# Design Tokens

Fonte da verdade extraída de `docs/layout/` (imagens do UXPilot).
Todo agente DEVE usar estes tokens — nunca valores hardcoded em componentes.
Os tokens são declarados em `src/app/globals.css` via `@theme` do Tailwind v4.

---

## Cores

| Token CSS | Valor | Uso semântico |
|---|---|---|
| `--color-primary` | `#2e7d32` | AppBar, FAB, checkmark ativo, aba nav ativa, borda do card ativo |
| `--color-primary-light` | `#43a047` | Swipe "Marcar" (verde), barra de orçamento 0–79% |
| `--color-primary-dark` | `#1b5e20` | Estado pressed do FAB (ripple, focus) |
| `--color-warning` | `#f57c00` | Barra de orçamento 80–99%, badge de preço unitário |
| `--color-warning-surface` | `#fff3e0` | Fundo do badge de preço unitário (pill laranja claro) |
| `--color-danger` | `#c62828` | Swipe "Deletar", barra de orçamento ≥100%, texto de excesso |
| `--color-surface` | `#ffffff` | Fundo de cards, bottom sheet, item rows, inputs |
| `--color-background` | `#f7f8f6` | Fundo geral da tela (off-white esverdeado leve) |
| `--color-text-primary` | `#1a1a1a` | Textos principais: nome do item, totais |
| `--color-text-secondary` | `#595959` | Subtítulos, legendas, ícones de nav inativos |
| `--color-text-disabled` | `#9e9e9e` | Texto riscado de item marcado (checked) |
| `--color-border` | `#e0e0e0` | Bordas de input, track da barra de progresso, divisores |
| `--color-overlay` | `rgba(0,0,0,0.50)` | Fundo escurecido ao abrir bottom sheet |

### Lógica de cor da barra de orçamento

```
0% – 79%   → --color-primary-light  (#43a047) verde
80% – 99%  → --color-warning        (#f57c00) laranja
≥ 100%     → --color-danger         (#c62828) vermelho + label "orçamento excedido"
```

Implementar em `src/components/atoms/ProgressBar.tsx` via função auxiliar:
```typescript
function barColor(pct: number): string {
  if (pct >= 100) return 'bg-danger';
  if (pct >= 80)  return 'bg-warning';
  return 'bg-primary-light';
}
```

---

## Tipografia

Fonte: **Inter** (via Google Fonts) — sans-serif, fiel ao visual do design.
Fallback: `system-ui, -apple-system, sans-serif`

| Token CSS | Tamanho | Peso | Uso |
|---|---|---|---|
| `--font-size-2xl` | `1.5rem` (24px) | 700 bold | Grand total (`R$ 630,97`) |
| `--font-size-xl` | `1.25rem` (20px) | 500 medium | Section total (`R$ 150,20`) |
| `--font-size-lg` | `1.125rem` (18px) | 500 medium | Line total por item (`R$ 22,99`) |
| `--font-size-base` | `1rem` (16px) | 400 regular | Nome do item, título de lista |
| `--font-size-sm` | `0.875rem` (14px) | 400 regular | Subtítulo de card, data de atualização |
| `--font-size-xs` | `0.75rem` (12px) | 400 regular | Legenda, preço unitário (`R$ 9,99/L`), caption |

Pesos utilizados: `400` (regular), `500` (medium), `700` (bold).
Usar `font-variant-numeric: tabular-nums` em todo valor monetário (`tabular-nums` no Tailwind).

---

## Espaçamento (grid de 4px)

| Token CSS | Valor | Uso típico |
|---|---|---|
| `--spacing-1` | `0.25rem` (4px) | Espaço mínimo entre icon e texto no nav |
| `--spacing-2` | `0.5rem` (8px) | Padding interno de badge, gap entre subtítulos |
| `--spacing-3` | `0.75rem` (12px) | Padding vertical de item row |
| `--spacing-4` | `1rem` (16px) | Padding lateral padrão (gutter da tela) |
| `--spacing-5` | `1.25rem` (20px) | Padding interno de card de lista |
| `--spacing-6` | `1.5rem` (24px) | Espaço entre seções de lista |
| `--spacing-8` | `2rem` (32px) | Margem de seção grande |

O gutter lateral padrão (`--spacing-4`, 16px) é aplicado como `px-4` no container principal de cada tela.

---

## Tamanhos Fixos de Componentes

| Token CSS | Valor | Componente |
|---|---|---|
| `--size-touch-min` | `3rem` (48px) | Área mínima de toque (WCAG AA) — todo botão/checkbox |
| `--size-fab` | `3.5rem` (56px) | Diâmetro do FAB |
| `--size-app-bar` | `3.5rem` (56px) | Altura do AppBar |
| `--size-bottom-nav` | `3.5rem` (56px) | Altura da navegação inferior |
| `--size-sticky-footer` | `5.5rem` (88px) | Altura da barra de rodapé (3 linhas) |
| `--size-budget-bar` | `0.25rem` (4px) | Espessura da barra de orçamento |
| `--size-sheet-handle-w` | `2rem` (32px) | Largura do handle do bottom sheet |
| `--size-sheet-handle-h` | `0.25rem` (4px) | Altura do handle do bottom sheet |
| `--size-app-max-w` | `30rem` (480px) | Largura máxima do container da aplicação |

---

## Border Radius

| Token CSS | Valor | Uso |
|---|---|---|
| `--radius-sm` | `0.5rem` (8px) | Badge de preço unitário (pill pequeno) |
| `--radius-md` | `0.75rem` (12px) | Cards de lista, container de item rows |
| `--radius-lg` | `1rem` (16px) | Bottom sheet (top-left e top-right apenas) |
| `--radius-full` | `9999px` | FAB, progress bar track e fill |

---

## Sombras

| Token CSS | Valor CSS | Uso |
|---|---|---|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | Cards de lista, container de item rows |
| `--shadow-fab` | `0 4px 12px rgba(0,0,0,0.20)` | FAB |
| `--shadow-sheet` | `0 -4px 20px rgba(0,0,0,0.12)` | Bottom sheet (sombra para cima) |

---

## Z-index (camadas)

| Token CSS | Valor | Camada |
|---|---|---|
| `--z-content` | `0` | Conteúdo scrollável |
| `--z-sticky-footer` | `10` | Barra de rodapé sticky |
| `--z-fab` | `20` | FAB (acima do footer) |
| `--z-bottom-nav` | `30` | Navegação inferior |
| `--z-overlay` | `40` | Overlay escuro do bottom sheet |
| `--z-bottom-sheet` | `50` | Bottom sheet (acima de tudo) |

---

## Responsividade

O app é **mobile-first** (375–430px). Em telas maiores, o layout se mantém em coluna única centralizada.

| Token CSS | Valor | Contexto |
|---|---|---|
| `--breakpoint-sm` | `480px` | Telefones grandes |
| `--breakpoint-md` | `768px` | Tablets |
| `--breakpoint-lg` | `1024px` | Desktop |

**Estratégia de container:**
- Wrapper root com `max-width: var(--size-app-max-w)` + `margin: 0 auto`
- `position: relative` no wrapper para conter elementos `absolute`
- Em mobile: elementos sticky/fixed com `position: sticky` ou `position: absolute` dentro do wrapper
- Em desktop: nunca usar `position: fixed` puro — o elemento vazaria para fora do container centralizado

```css
/* Padrão de container — aplicado em app/layout.tsx */
.app-container {
  max-width: var(--size-app-max-w);
  margin-inline: auto;
  min-height: 100dvh;
  position: relative;
}
```

---

## Mapeamento para `globals.css`

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* --- Tipografia --- */
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;

  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;

  /* --- Cores --- */
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

  /* --- Espaçamento --- */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* --- Tamanhos fixos --- */
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

  /* --- Sombras --- */
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

As classes Tailwind geradas automaticamente incluem:
`bg-primary`, `text-primary`, `border-primary`, `bg-danger`, `text-warning`,
`bg-background`, `bg-surface`, `text-text-primary`, `text-text-secondary`,
`min-h-touch-min`, `min-w-touch-min`, `w-fab`, `h-fab`,
`rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`,
`shadow-card`, `shadow-fab`, `shadow-sheet`.
