# Modelo de Dados

---

## Princípios

- Todas as entidades são **POJOs** (plain JavaScript objects) — sem métodos, sem herança
- O IndexedDB via Dexie.js é o único banco de dados
- **Desnormalização intencional**: `lineTotal`, `totalCost` e `checkedTotal` são redundantes,
  mas necessários para performance em dispositivos mid-range (evitam agregações em toda renderização)
- A **fonte da verdade** são sempre os dados atômicos (`unitPrice × quantity`); os campos
  desnormalizados são recomputados pelo Controller após cada mutação

---

## Entidades

### `ShoppingList`

Representa uma viagem ao supermercado.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` (UUID v4) | Sim | Chave primária |
| `name` | `string` | Sim | Nome da lista, ex: "Carrefour 14/09" |
| `budgetGoal` | `number \| null` | Não | Meta de orçamento em BRL; `null` = sem meta |
| `status` | `'active' \| 'archived'` | Sim | Estado da lista |
| `totalCost` | `number` | Sim | **Cache**: soma de todos os `lineTotal` (denorm.) |
| `checkedTotal` | `number` | Sim | **Cache**: soma de `lineTotal` dos itens marcados (denorm.) |
| `colorTag` | `string \| null` | Não | Cor hex para identificação visual (opcional) |
| `createdAt` | `number` | Sim | Unix timestamp em ms |
| `updatedAt` | `number` | Sim | Unix timestamp em ms |

**Índices Dexie**: `status`, `createdAt`

---

### `ListItem`

Representa um produto na lista de compras.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` (UUID v4) | Sim | Chave primária |
| `listId` | `string` | Sim | FK → `ShoppingList.id` |
| `name` | `string` | Sim | Nome do produto, ex: "Arroz Camil 5kg" |
| `quantity` | `number` | Sim | Quantidade (mín: 0,001) |
| `unit` | `'un' \| 'kg' \| 'g' \| 'L' \| 'ml' \| 'cx' \| 'pct'` | Sim | Unidade de medida |
| `unitPrice` | `number` | Sim | Preço por unidade em BRL (mín: 0,00) |
| `lineTotal` | `number` | Sim | **Cache**: `quantity × unitPrice` (denorm.) |
| `pricePerRefUnit` | `number \| null` | Não | **Cache**: preço por unidade de referência (R$/kg, R$/L) para comparativo |
| `isChecked` | `boolean` | Sim | `true` = item está no carrinho |
| `position` | `number` | Sim | Ordem de exibição (gap encoding, múltiplos de 1000) |
| `categoryId` | `string \| null` | Não | FK → `Category.id` (V1+) |
| `barcodeEan` | `string \| null` | Não | EAN-13 ou EAN-8 (V1+) |
| `priceSource` | `'manual' \| 'barcode' \| 'nfe'` | Sim | Origem do preço (auditoria) |
| `createdAt` | `number` | Sim | Unix timestamp em ms |
| `updatedAt` | `number` | Sim | Unix timestamp em ms |

**Índices Dexie**: `listId`, `isChecked`, `position`, `barcodeEan`

**Nota sobre `pricePerRefUnit`**:
Calculado para itens com `unit != 'un'` e `unit != 'cx'`:
- Itens em kg/g → normalizado para R$/kg
- Itens em L/ml → normalizado para R$/L

---

### `Category` (V1+, scaffolded no V0)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | PK |
| `name` | `string` | "Laticínios", "Limpeza", "Carnes" |
| `icon` | `string` | Emoji ou token de ícone |
| `colorHex` | `string` | Cor para diferenciação visual |
| `sortOrder` | `number` | Ordem de exibição |

**Categorias padrão BR**: Açougue, Padaria, Frios/Laticínios, Mercearia, Hortifruti,
Limpeza, Higiene Pessoal, Bebidas, Congelados, Outros

---

### `Product` (V1+)

Cache local do catálogo de produtos por EAN. Populado via Open Food Facts + scan.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | PK |
| `ean` | `string` | EAN-13/EAN-8 (índice único) |
| `name` | `string` | Nome do produto |
| `brand` | `string \| null` | Marca |
| `defaultUnit` | `string` | Unidade padrão do produto |
| `categoryId` | `string \| null` | FK → Category |
| `lastSeenPrice` | `number \| null` | Último preço registrado (denorm.) |
| `lastSeenAt` | `number \| null` | Data do último preço |
| `source` | `'openfoodfacts' \| 'manual' \| 'nfe'` | Origem do dado |

---

### `PriceHistory` (V1+)

Histórico de preços pagos por produto. Base para alertas de variação e comparativos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | PK |
| `ean` | `string` | FK → Product.ean (índice) |
| `listId` | `string` | Qual lista registrou esse preço |
| `price` | `number` | Preço unitário pago |
| `unit` | `string` | Unidade do preço |
| `pricePerRefUnit` | `number \| null` | Preço normalizado (R$/kg ou R$/L) |
| `recordedAt` | `number` | Unix timestamp ms |
| `storeId` | `string \| null` | FK → Store.id (V2) |

---

### `Store` (V2+)

Estabelecimento onde a compra foi realizada.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | PK |
| `name` | `string` | "Carrefour Pinheiros" |
| `cnpj` | `string \| null` | CNPJ do estabelecimento (extraído da NF-e) |
| `chain` | `string \| null` | Rede: "Carrefour", "Atacadão", "Assaí" |
| `address` | `string \| null` | Endereço |
| `city` | `string \| null` | Cidade |
| `state` | `string` | UF (2 caracteres) |

---

### `Receipt` (V2+)

Nota Fiscal Eletrônica importada via QR code do cupom.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | PK |
| `chaveNfe` | `string` | Chave NF-e de 44 dígitos (índice único) |
| `listId` | `string \| null` | Lista vinculada (se o usuário importou) |
| `storeId` | `string \| null` | FK → Store |
| `totalValue` | `number` | Valor total da nota |
| `issuedAt` | `number` | Data de emissão da nota |
| `fetchedAt` | `number` | Data em que o app baixou a nota |
| `status` | `'pending' \| 'fetched' \| 'error'` | Status do fetch |
| `rawJson` | `string \| null` | JSON/XML da nota (armazenado para auditoria local) |

**LGPD**: Este dado **nunca sai do dispositivo** sem consentimento explícito.

---

### `SyncQueueItem` (scaffold V0, ativo V1+)

Fila de mutações para sincronização com servidor remoto (quando um backend existir).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | PK |
| `entityType` | `string` | 'ShoppingList' \| 'ListItem' \| etc. |
| `entityId` | `string` | ID da entidade afetada |
| `operation` | `'create' \| 'update' \| 'delete'` | Tipo de operação |
| `payload` | `string` | JSON do delta |
| `failCount` | `number` | Contagem de falhas de sync |
| `createdAt` | `number` | Unix timestamp ms |

---

## Schema IndexedDB (Dexie)

```javascript
// Versão 1 — V0 MVP
db.version(1).stores({
  shoppingLists: '++id, status, createdAt',
  listItems:     '++id, listId, isChecked, position, barcodeEan',
  categories:    '++id, sortOrder',
});

// Versão 2 — V1 (barcode + histórico)
db.version(2).stores({
  products:      '++id, &ean, categoryId',
  priceHistory:  '++id, ean, listId, recordedAt',
  syncQueue:     '++id, entityType, operation, createdAt',
});

// Versão 3 — V2 (NF-e + comparativo)
db.version(3).stores({
  stores:   '++id, cnpj',
  receipts: '++id, &chaveNfe, listId, status',
});
```

Cada incremento de versão mapeia para um release. O Dexie aplica migrações ao detectar
que o banco está em versão anterior ao código atual.

---

## Política de Dados: Local vs. Sincronizado

| Entidade | V0 | V1 | V2 |
|----------|-----|-----|-----|
| ShoppingList | Só local | Backup opt-in | Backup opt-in |
| ListItem | Só local | Com a lista | Com a lista |
| Category | Local (padrões embutidos) | Local | Local |
| Product (EAN cache) | — | Local | Catálogo crowd compartilhado (opt-in) |
| PriceHistory | — | Local | Contribuição anônima opt-in |
| Store | — | — | Local + crowd |
| Receipt (NF-e) | — | — | **Sempre local** (LGPD: dado fiscal sensível) |
| SyncQueue | Stub (não drena) | Drena para backend | Drena para backend |

---

## Diagrama de Relacionamentos

```
ShoppingList ──────< ListItem
     │                  │
     │                  ├── Category (V1)
     │                  ├── Product [via barcodeEan] (V1)
     │                  └── priceSource: 'manual' | 'barcode' | 'nfe'
     │
     └── Receipt (V2)
              │
              └── Store (V2)

Product ──────< PriceHistory (V1)
                    │
                    └── Store [via storeId] (V2)
```

---

## Conversão de Unidades (Tabela de Referência)

Usada pelo `PriceComparisonController` para normalizar preços:

| Unidade | Categoria | Unidade de Referência | Fator |
|---------|-----------|----------------------|-------|
| `kg` | Peso | R$/kg | ÷ 1 |
| `g` | Peso | R$/kg | ÷ 0,001 |
| `L` | Volume | R$/L | ÷ 1 |
| `ml` | Volume | R$/L | ÷ 0,001 |
| `un` | Unidade | R$/un | ÷ 1 |
| `cx` | Unidade | R$/un | ÷ 1 |
| `pct` | Pacote | R$/pct | ÷ 1 |

**Exemplo prático**:
- Óleo de soja 900ml por R$ 8,99 → `8,99 ÷ 0,9` = **R$ 9,99/L**
- Óleo de soja 2L por R$ 18,00 → `18,00 ÷ 2` = **R$ 9,00/L**
- Destaque: o 2L é R$ 0,99/L mais barato — exibe badge "Melhor valor"
