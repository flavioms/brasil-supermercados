# Diretrizes de UX/UI

Este documento define as regras de interface do Supermercado Brasil. Toda decisão de design
deve ser validada contra estas diretrizes. O contexto de uso é o fio condutor de cada regra.

---

## Contexto de Uso

O usuário está **dentro de um supermercado**, em movimento, com atenção dividida:

- ✋ Segura produtos, o carrinho ou a cestinha com uma mão
- 👍 Usa o **polegar** da mão que segura o celular para interagir
- 🔊 Ambiente barulhento — não processa texto longo
- 💡 Iluminação artificial forte — lava telas com baixo contraste
- 📶 Conexão de dados potencialmente ruim ou inexistente
- ⏱️ Tempo escasso — cada toque deve ser rápido e preciso

**Implicação central**: Se uma ação exigir mais de 2 toques ou mover o polegar para o
topo da tela, ela vai frustrar o usuário na hora mais crítica.

---

## Zona de Alcance do Polegar

A maioria dos usuários usa o celular com a mão direita. O polegar cobre naturalmente
apenas parte da tela:

```
┌─────────────────────┐
│   ╔═══════════╗     │
│   ║ ZONA      ║     │  ← AÇÕES PROIBIDAS
│   ║ MORTA     ║     │    (acesso difícil/impossível)
│   ╚═══════════╝     │
│                     │
│   ┌─────────────┐   │
│   │ ZONA MÉDIA  │   │  ← Ações secundárias (configurações, etc.)
│   └─────────────┘   │
│                     │
│ ┌───────────────────┐│
│ │  ZONA PRIMÁRIA    ││  ← TODAS AS AÇÕES PRINCIPAIS AQUI
│ │  (40% inferior)   ││    (adicionar, marcar, editar, ver total)
│ └───────────────────┘│
└─────────────────────┘
```

---

## Regras de Touch Target

| ID | Regra |
|----|-------|
| **UX-01** | Todo elemento interativo tem mínimo **48×48dp** (Android) / **44×44pt** (iOS) |
| **UX-02** | Espaçamento mínimo entre alvos interativos adjacentes: **8dp** |
| **UX-03** | Elementos críticos (check, FAB, botão primário) devem ter área de toque maior que o visual sugere |

---

## Navegação

| ID | Regra |
|----|-------|
| **UX-04** | Usar **bottom navigation bar** — nunca hamburger menu (que está sempre na zona morta) |
| **UX-05** | Toda ação central em no máximo **2 toques** a partir de qualquer tela |
| **UX-06** | O botão de "Adicionar Item" é um **FAB** posicionado no centro-baixo da tela |
| **UX-07** | Links e botões de navegação secundária podem estar na parte superior; **nunca** ações primárias |

---

## Lista de Itens

| ID | Regra |
|----|-------|
| **UX-08** | **Swipe para direita** = marcar item como "no carrinho" (ação mais frequente durante a compra) |
| **UX-09** | **Swipe para esquerda** = deletar item (threshold de 50% da largura para confirmar; strip vermelho desliza) |
| **UX-10** | Itens marcados **NÃO desaparecem** da lista — colapsam em seção ao fim |
| **UX-11** | A **área de check** ocupa os 48dp à esquerda do item — zona natural do polegar direito |
| **UX-12** | Itens marcados exibem nome em strikethrough; permanecem legíveis (usuário pode precisar referenciar) |
| **UX-13** | Seção de itens marcados começa colapsada; um toque a expande |

---

## Total em Tempo Real (feature central — inegociável)

| ID | Regra |
|----|-------|
| **UX-14** | **Footer sticky sempre visível** com total geral e subtotal da sessão — nunca some |
| **UX-15** | Ao adicionar ou alterar qualquer item: total anima com **scale pulse** (105%→100%, 150ms) |
| **UX-16** | Altura mínima do footer: **72dp** |
| **UX-17** | Fonte do total geral no footer: **24sp** |
| **UX-18** | Fonte do subtotal da sessão (itens marcados): **20sp** |
| **UX-19** | O footer exibe dois valores: "No carrinho: R$ X,XX" e "Total: R$ X,XX" |
| **UX-20** | Se orçamento definido: o footer também exibe "Falta: R$ X,XX" ou "Passou: R$ X,XX" |

---

## Orçamento e Progresso

| ID | Regra |
|----|-------|
| **UX-21** | Barra de progresso em **3 estágios** de cor: verde (0–70%), âmbar (70–90%), vermelho (90–100%+) |
| **UX-22** | Acima de 100% do orçamento: barra vermelha + **animação de pulso** para chamar atenção |
| **UX-23** | A barra de progresso fica no header da tela de lista, logo abaixo do nome |
| **UX-24** | A transição de cor deve ser gradual (CSS `transition`) para não assustar o usuário |

---

## Formulário de Adição de Item (Bottom Sheet)

| ID | Regra |
|----|-------|
| **UX-25** | O formulário aparece como **bottom sheet** — metade inferior da tela (snap point 50%) |
| **UX-26** | Quando o teclado abre, o sheet expande para **85%** para não cobrir o campo focado |
| **UX-27** | **Preview do total da linha** (qtd × preço) atualiza em tempo real enquanto o usuário digita |
| **UX-28** | Botão "Adicionar" / "Salvar" ocupa **largura total**, altura mínima **56dp** |
| **UX-29** | Campo de preço usa `inputmode="decimal"` — abre teclado numérico no Android/iOS |
| **UX-30** | Campo de preço exibe prefixo `R$` e usa vírgula como separador decimal (locale pt-BR) |
| **UX-31** | O campo de nome recebe foco automático ao abrir o sheet |
| **UX-32** | O seletor de unidade (un/kg/g/L...) é um select nativo — evita componente customizado pesado |

---

## Tipografia e Contraste

| ID | Regra |
|----|-------|
| **UX-33** | Nome do item: **16sp**, peso normal |
| **UX-34** | Total da linha (direita): **18sp** |
| **UX-35** | Total da sessão no footer: **20sp** |
| **UX-36** | Total geral no footer: **24sp**, bold |
| **UX-37** | Contraste mínimo **WCAG AA (4.5:1)** em todos os textos — a iluminação de loja lava telas escuras |
| **UX-38** | Não usar cinza médio para texto — o mínimo é `#595959` em fundo branco |
| **UX-39** | Fonte do sistema (system-ui) — evita carregamento de fonte externa que bloqueia render |

---

## Offline e Conectividade

| ID | Regra |
|----|-------|
| **UX-40** | Indicador **discreto** de status offline na barra superior (ícone + cor) — sem bloquear o uso |
| **UX-41** | **Nunca bloquear uma ação** por falta de rede — UI otimista, persiste localmente e sync depois |
| **UX-42** | Ao reconectar: sync silencioso sem interromper a sessão de compra |
| **UX-43** | Em modo offline: botões de scan de barcode e NF-e ficam desabilitados com tooltip explicativo |

---

## Feedback Háptico

| ID | Regra |
|----|-------|
| **UX-44** | Vibração curta (**10ms**) ao marcar um item — `navigator.vibrate(10)` |
| **UX-45** | Vibração de confirmação (**[50, 30, 50]ms** — dois pulsos) ao completar swipe de deleção |
| **UX-46** | Sempre usar feature detection: `if (navigator.vibrate)` — graceful degradation em iOS |

---

## Micro-interações Específicas

### Swipe para Marcar

```
Estado inicial:
[  ●  Nome do item              R$ 9,99]

Durante swipe direita (até 30% da largura):
[══► ●  Nome do item              R$ 9,99]
     fundo verde começa a aparecer à esquerda

Após threshold (>30%):
[════════════ ✓ MARCADO ═══════════════]
     item desce para seção "No carrinho"
     haptic: vibrate(10)
     footer total anima
```

### Animação de Total

Quando o total muda:
- Scale: `1 → 1.05 → 1` em 150ms
- CSS: `transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)`
- Se cruzar threshold de orçamento: background-color crossfade simultâneo

### Bottom Sheet — Abertura

```
Estado: fechado (height: 0)
     ↓ toque no FAB
Estado: abrindo (translate Y: 100% → 50%, duration: 250ms, ease-out)
     ↓ teclado abre automaticamente
Estado: expandido (translate Y: 50% → 15%, duration: 200ms, ease-out)
```

---

## Design Tokens (CSS Custom Properties)

Tokens que carregam os requisitos de UX para a implementação:

```css
/* Tamanhos mínimos */
--touch-target-min: 48px;
--fab-size: 56px;
--footer-height: 72px;
--sheet-handle-height: 24px;
--button-height: 56px;

/* Tipografia */
--font-size-item-name: 1rem;        /* 16sp */
--font-size-line-total: 1.125rem;   /* 18sp */
--font-size-session-total: 1.25rem; /* 20sp */
--font-size-grand-total: 1.5rem;    /* 24sp */

/* Cores */
--color-success: #2e7d32;   /* verde — 0–70% do orçamento */
--color-warning: #f57c00;   /* âmbar — 70–90% */
--color-danger: #c62828;    /* vermelho — 90%+ */
--color-check: #43a047;     /* verde do swipe de marcação */
--color-delete: #e53935;    /* vermelho do swipe de deleção */

/* Superfícies */
--color-surface: #ffffff;
--color-on-surface: #1a1a1a;        /* alto contraste */
--color-surface-variant: #f5f5f5;
--color-on-surface-secondary: #595959; /* cinza mínimo WCAG AA */

/* Bordas e formas */
--radius-card: 12px;
--radius-sheet: 16px;
--radius-chip: 8px;

/* Animações */
--transition-check: 300ms ease-out;
--transition-total-pulse: 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
--transition-sheet: 250ms ease-out;
--transition-color: 200ms ease;

/* Zones */
--primary-action-zone: 40%;   /* percentual inferior da tela para ações primárias */
```

---

## Anti-patterns (O que NÃO fazer)

| Anti-pattern | Motivo |
|-------------|--------|
| Propagandas durante sessão de compra | Destrói concentração no momento mais crítico |
| Deletar itens marcados automaticamente | Usuário precisa referenciar o que já pegou |
| Confirmações modais para ações rápidas | Torna o check impossível com uma mão |
| Bottom sheet de altura total (100%) | Não parece contextual, parece uma nova tela |
| Ações destrutivas com swipe curto | Muito fácil de acionar acidentalmente |
| Total visível só em tela separada | Remove o valor principal do app |
| Hierarquia de menus com 3+ níveis | Inacessível em movimento |
| Pop-ups de permissão durante compra | Nunca interromper o fluxo principal |
