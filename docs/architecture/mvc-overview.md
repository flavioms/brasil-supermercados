# Arquitetura MVC — Visão Geral

---

## Princípios Fundamentais

| Camada | Tecnologia | Responsabilidade | Regra de Ouro |
|--------|-----------|-----------------|---------------|
| **Model** | Interfaces TS + Dexie.js | Definição de tipos e schema do IndexedDB | Sem lógica de negócio |
| **View** | Componentes React (Next.js) | Renderização, estados visuais, gestos | Sem acesso direto ao banco |
| **Controller** | Módulos TS singleton | Mutações, validações | Única fonte de mudanças |
| **Hook** | Custom hooks (`useLiveQuery`) | Bridge entre Dexie e componentes React | Apenas wrappers de liveQuery |

**Fluxo unidirecional**:
```
Componente → Controller → IndexedDB (Dexie) → useLiveQuery (hook) → Componente
```

O componente nunca escreve diretamente no banco.
O banco notifica o componente via `useLiveQuery` — o único canal de atualização da View.
Controllers não conhecem React; hooks não conhecem lógica de negócio.

---

## Fluxo Principal — Adicionar um Item

```
[Usuário toca FAB]
        │
        ▼
[View: item-form-sheet abre]         ← animação de bottom sheet
[View: foco automático no campo nome]
[View: suggestions por histórico/catálogo aparecem conforme digita]
        │
        ▼ (usuário preenche nome, qtd, preço)
[View: preview do lineTotal atualiza em tempo real]  ← UI otimista
        │
        ▼ (toque em "Adicionar")
[ItemFormSheet chama: ListItemController.addItem(listId, formData)]
        │
        ▼
[Controller: valida inputs]
[Controller: computa lineTotal = qty × price]
[Controller: atribui position (gap encoding)]
[Controller: escreve no IndexedDB via Dexie]
[Controller: chama ShoppingListController.recomputeTotals(listId)]
        │
        ▼
[ShoppingListController: soma todos os lineTotals]
[ShoppingListController: atualiza totalCost + checkedTotal na lista]
        │
        ▼
[Dexie liveQuery detecta mudança em listItems + shoppingList]
        │
        ▼
[useLiveQuery re-executa → novo snapshot entregue ao componente]
[React re-renderiza: item aparece com fade-in via classe Tailwind]
[StickyTotalFooter re-renderiza com animação de pulso]
[ItemFormSheet: fecha via estado local (useState)]
```

**Por que isso é correto offline**: IndexedDB é sempre local. Não existe nenhum passo
que depende de rede. A View nunca espera por uma resposta de servidor.

---

## Inventário de Telas

| ID | Rota | Descrição | Frequência de uso |
|----|------|-----------|------------------|
| `lists-screen` | `/` | Home: todas as listas ativas | Baixa (1x por visita ao app) |
| `list-detail-screen` | `/lista/:id` | Sessão de compra ativa | **Alta** (uso principal) |
| `item-form-sheet` | modal bottom sheet | Adicionar / editar item | **Altíssima** (por item comprado) |
| `budget-setup-sheet` | modal bottom sheet | Definir meta de orçamento | Baixa |
| `list-settings-sheet` | modal bottom sheet | Renomear, arquivar, deletar | Baixa |
| `analytics-screen` | `/analytics` (V1) | Gráficos de evolução de gastos | Média |
| `settings-screen` | `/configuracoes` | Configurações do app | Baixa |
| `barcode-scan-screen` | `/scanner` (V1) | Câmera + BarcodeDetector | Alta (V1) |
| `nfe-scan-screen` | `/nfe` (V2) | Scan do QR code do cupom fiscal | Média (V2) |

A `list-detail-screen` é onde o usuário passa 90%+ do tempo de uso. Todo investimento
de design e performance vai prioritariamente para esta tela.

---

## Hierarquia de Componentes — Tela Principal

```
<ListDetailScreen>                        ← src/app/lista/[id]/page.tsx
  ├── <ListHeader>
  │     ├── [botão voltar] [nome da lista] [overflow menu]
  │     └── <BudgetProgressBar>           ← visível se orçamento definido
  │
  ├── <ItemList>
  │     ├── <UncheckedSection>
  │     │     └── <ItemRow> × N           ← ordenado por position ASC
  │     └── <CheckedSection>              ← colapsada por padrão
  │           └── <ItemRow checked> × M
  │
  ├── <StickyTotalFooter>                 ← SEMPRE visível, fixo na base
  │     ├── "No carrinho: R$ X,XX"
  │     ├── "Total: R$ X,XX"
  │     └── "Falta: R$ X,XX"             ← se orçamento definido
  │
  └── <FabAddItem>                        ← abre <ItemFormSheet>
```

---

## Componente `<ItemRow>` (mais interativo do app)

```
<ItemRow>
  └── <SwipeContainer>
        ├── [fundo verde — check]     ← aparece no swipe direita
        ├── [fundo vermelho — delete] ← aparece no swipe esquerda
        └── <div> (item-content)
              ├── <button> check-circle  ← min-h/w 48px (zona do polegar)
              ├── <p> item-name          ← text-base, flex-1
              ├── <p> item-unit-price    ← preço/unidade, text-sm text-gray-500
              └── <span> item-line-total ← text-base font-medium, text-right
```

Ao tocar na área de preço/quantidade: abre overlay de edição inline com stepper.
Ao tocar no nome: abre o `<ItemFormSheet>` para edição completa.

---

## Inventário de Controllers

| Controller | Responsabilidade | Métodos Principais |
|------------|-----------------|-------------------|
| `ShoppingListController` | CRUD de listas + totais | `createList`, `renameList`, `setBudgetGoal`, `archiveList`, `deleteList`, `recomputeTotals` |
| `ListItemController` | CRUD de itens + toggleCheck | `addItem`, `updateItem`, `toggleCheck`, `deleteItem`, `updateQuantity` |
| `AutocompleteController` | Sugestões de nomes de produto | `getSuggestions`, `buildLocalIndex`, `loadBundledCatalog` |
| `PriceComparisonController` | Calculadora de melhor preço | `calcPricePerUnit`, `comparePrices`, `suggestBestValue` |
| `OfflineQueueController` | Fila de sync (V0 stub) | `enqueue`, `processQueue`, `clearQueue` |
| `ProductController` | Lookup EAN + Open Food Facts (V1) | `lookupByBarcode`, `recordPriceObservation` |
| `AnalyticsController` | Agregação para gráficos (V1) | `getWeeklyTotals`, `getMonthlyTotals`, `getYearlyTotals`, `getCategoryBreakdown` |
| `NfeController` | Parse + fetch de notas fiscais (V2) | `parseQrCode`, `fetchReceipt`, `importReceiptToList` |

**Nota**: Não existe `AppController` — o bootstrap do Next.js é feito no `layout.tsx` (registro do Service Worker via `useEffect`) e o roteamento é gerenciado pelo App Router nativamente.

---

## Ponto de Extensão V1: Autocomplete

O `AutocompleteController` tem duas fontes de dados, consultadas em cascata:

```
[Usuário digita no campo nome]
         │
         ▼
[1. IndexedDB: items das listas anteriores do usuário]
         │ (mais rápido, offline, personalizado)
         │
         ▼ (se poucas sugestões)
[2. Catálogo embutido: lista de ~5.000 produtos BR em memória]
         │ (zero latência, zero internet, bundlado no app)
         │
         ▼ (V1: se ainda sem match)
[3. Open Food Facts API — busca por nome/texto]
         │ (requer internet, cachea resultado)
```

O catálogo embutido é um JSON comprimido (gzip) com os produtos mais comuns do varejo
brasileiro: arroz, feijão, macarrão, óleos, marcas conhecidas (Boa Vita, Tio João,
Camil, Sadia, Friboi, etc.). Estimativa: ~5k entradas, ~200KB comprimido.

---

## Ponto de Extensão V1: Comparativo de Embalagens

O `PriceComparisonController.calcPricePerUnit()` é chamado sempre que um item tem
`unitPrice > 0` e `unit != 'un'`:

```javascript
// Unidades de referência para normalização
REFERENCIA = {
  kg:  { ref: 'kg',  fator: 1      },
  g:   { ref: 'kg',  fator: 0.001  },  // → R$/kg
  L:   { ref: 'L',   fator: 1      },
  ml:  { ref: 'L',   fator: 0.001  },  // → R$/L
  un:  { ref: 'un',  fator: 1      },
  cx:  { ref: 'un',  fator: 1      },
  pct: { ref: 'pct', fator: 1      },
}

pricePerUnit = unitPrice / (quantity × fator)
```

A View exibe esse valor como texto secundário abaixo do nome do item:
`"Óleo Soja 900ml — R$ 9,99 · R$ 11,10/L"`

---

## Ponto de Extensão V1: Analytics

O `AnalyticsController` agrega dados do IndexedDB sem nenhuma chamada de rede.
Todas as listas arquivadas e ativas são a fonte de verdade para os gráficos.

O `analytics-screen` renderiza os gráficos usando apenas SVG inline (sem biblioteca
de charts pesada) ou, se necessidade de maior riqueza visual, Chart.js via CDN lazy-loaded
apenas quando a tela for aberta.

---

## Ponto de Extensão V2: NF-e

```
[Usuário abre nfe-scan-screen]
         │
         ▼
[BarcodeDetector lê QR code]
         │
         ▼
[NfeController.parseQrCode(qrContent)]
→ extrai chaveNfe (44 dígitos) da URL do QR
→ determina UF a partir dos dígitos 3–4 da chave
         │
         ▼
[NfeController.fetchReceipt(chaveNfe)]
→ chama proxy: https://nfe.supermercadobrasil.app/sefaz/{uf}/{chave}
→ proxy repassa para endpoint SEFAZ da UF correta
→ retorna XML/JSON da nota fiscal
→ persiste em receipts store (IndexedDB)
         │
         ▼
[NfeController.importReceiptToList(receiptId, listId)]
→ parse dos campos NF-e: xProd (nome), qCom (qtd), vUnCom (preço unitário)
→ cria ListItems via ListItemController.addItem() em batch
→ priceSource = 'nfe' em cada item
```

O proxy é o único componente que precisa de servidor no V2. Ele é stateless — não armazena
nada, apenas faz proxy da chamada para a SEFAZ com o cabeçalho CORS correto.

---

## Estrutura de Arquivos

```
src/
├── app/                        ← Next.js App Router
│   ├── layout.tsx              ← RootLayout: providers, metadata PWA
│   ├── page.tsx                ← lists-screen (home)
│   ├── lista/[id]/page.tsx     ← list-detail-screen
│   ├── configuracoes/page.tsx  ← settings-screen
│   └── globals.css             ← Tailwind @import + @theme tokens
│
├── components/                 ← Componentes React reutilizáveis
│   ├── AppHeader.tsx
│   ├── BottomNavBar.tsx
│   ├── ListCard.tsx
│   ├── ItemRow.tsx
│   ├── BudgetProgressBar.tsx
│   ├── StickyTotalFooter.tsx
│   ├── ItemFormSheet.tsx
│   ├── BottomSheet.tsx         ← container genérico reutilizável
│   ├── SwipeContainer.tsx      ← gestos de swipe
│   ├── AutocompleteInput.tsx   ← input com suggestions
│   └── PriceComparisonBadge.tsx ← "R$ 11,10/L"
│
├── controllers/
│   ├── ShoppingListController.ts
│   ├── ListItemController.ts
│   ├── AutocompleteController.ts   ← V0 (histórico local + catálogo)
│   ├── PriceComparisonController.ts ← V0 (cálculo por unidade)
│   ├── OfflineQueueController.ts   ← stub V0, ativo V1+
│   ├── ProductController.ts        ← V1
│   ├── AnalyticsController.ts      ← V1
│   └── NfeController.ts            ← V2
│
├── hooks/                      ← Custom hooks (wrappers de useLiveQuery)
│   ├── useShoppingLists.ts
│   ├── useShoppingList.ts
│   ├── useListItems.ts
│   ├── useListTotal.ts
│   └── useAutocomplete.ts
│
├── models/
│   ├── db.ts                   ← Dexie schema (versões 1, 2, 3)
│   ├── ShoppingList.ts         ← interface + factory function
│   ├── ListItem.ts             ← interface + factory function
│   ├── Category.ts             ← scaffold para V1
│   ├── Product.ts              ← V1
│   ├── PriceHistory.ts         ← V1
│   ├── Receipt.ts              ← V2
│   └── SyncQueueItem.ts        ← scaffold para V1+
│
├── utils/
│   ├── currency.ts             ← Intl.NumberFormat pt-BR
│   ├── uuid.ts                 ← crypto.randomUUID + fallback
│   ├── validation.ts           ← constantes + funções compartilhadas
│   ├── haptics.ts              ← navigator.vibrate wrapper
│   └── units.ts                ← conversão e normalização de unidades
│
└── data/
    └── produtos-br.json        ← catálogo offline ~5k produtos BR (V0)
```

Service Worker gerado automaticamente pelo `@ducanh2912/next-pwa` em `public/sw.js` na build.
Estratégias de cache configuradas em `next.config.ts` via opções do plugin.

---

## Desafios Técnicos Antecipados

### 1. Bottom sheet + teclado Android
Quando o teclado numérico abre, o Chrome em modo `resize` move o viewport. Solução:
usar `interactive-widget=resizes-visual` no `<meta name="viewport">` e escutar
`visualViewport.resize` para reposicionar o sheet independentemente do layout viewport.

### 2. Swipe vs. gesto de voltar do Android
Chrome usa swipe da borda esquerda para navegar. Solução: iniciar detecção de swipe
somente quando `touchstart.clientX > 20px` da borda esquerda.

### 3. IndexedDB em modo privado
Quota limitada agressivamente. Solução: detectar com `navigator.storage.persist()` e
exibir aviso antes do usuário começar a usar o app em modo privado.

### 4. Dexie liveQuery + React
O hook `useLiveQuery` do pacote `dexie-react-hooks` gerencia o ciclo de vida da subscription automaticamente — cancela no unmount do componente. Não é necessário nenhum gerenciamento manual de subscription.

### 5. Catálogo de produtos BR embutido
O JSON de ~5k produtos precisa ser carregado de forma não-bloqueante. Solução: lazy import
do `AutocompleteController`, carregado apenas quando o usuário abre o formulário de adição.
