# Data Model

---

## Principles

- All entities are **POJOs** (plain JavaScript objects) — no methods, no inheritance
- IndexedDB via Dexie.js is the only database
- **Intentional denormalization**: `lineTotal`, `totalCost`, and `checkedTotal` are redundant,
  but necessary for performance on mid-range devices (they avoid aggregations on every render)
- The **source of truth** is always the atomic data (`unitPrice × quantity`); the
  denormalized fields are recomputed by the Controller after each mutation

---

## Entities

### `ShoppingList`

Represents a trip to the supermarket.

| Field | Type | Required | Description |
|-------|------|-------------|-----------|
| `id` | `string` (UUID v4) | Yes | Primary key |
| `name` | `string` | Yes | List name, e.g., "Carrefour 09/14" |
| `budgetGoal` | `number \| null` | No | Budget goal in BRL; `null` = no goal |
| `status` | `'active' \| 'archived'` | Yes | List state |
| `totalCost` | `number` | Yes | **Cache**: sum of all `lineTotal` (denorm.) |
| `checkedTotal` | `number` | Yes | **Cache**: sum of `lineTotal` for checked items (denorm.) |
| `colorTag` | `string \| null` | No | Hex color for visual identification (optional) |
| `createdAt` | `number` | Yes | Unix timestamp in ms |
| `updatedAt` | `number` | Yes | Unix timestamp in ms |

**Dexie indexes**: `status`, `createdAt`

---

### `ListItem`

Represents a product in the shopping list.

| Field | Type | Required | Description |
|-------|------|-------------|-----------|
| `id` | `string` (UUID v4) | Yes | Primary key |
| `listId` | `string` | Yes | FK → `ShoppingList.id` |
| `name` | `string` | Yes | Product name, e.g., "Camil Rice 5kg" |
| `quantity` | `number` | Yes | Quantity (min: 0.001) |
| `unit` | `'un' \| 'kg' \| 'g' \| 'L' \| 'ml' \| 'cx' \| 'pct'` | Yes | Unit of measure |
| `unitPrice` | `number` | Yes | Price per unit in BRL (min: 0.00) |
| `lineTotal` | `number` | Yes | **Cache**: `quantity × unitPrice` (denorm.) |
| `pricePerRefUnit` | `number \| null` | No | **Cache**: price per reference unit (R$/kg, R$/L) for comparison |
| `isChecked` | `boolean` | Yes | `true` = item is in the cart |
| `position` | `number` | Yes | Display order (gap encoding, multiples of 1000) |
| `categoryId` | `string \| null` | No | FK → `Category.id` (V1+) |
| `barcodeEan` | `string \| null` | No | EAN-13 or EAN-8 (V1+) |
| `priceSource` | `'manual' \| 'barcode' \| 'nfe'` | Yes | Price origin (audit) |
| `createdAt` | `number` | Yes | Unix timestamp in ms |
| `updatedAt` | `number` | Yes | Unix timestamp in ms |

**Dexie indexes**: `listId`, `isChecked`, `position`, `barcodeEan`

**Note on `pricePerRefUnit`**:
Calculated for items with `unit != 'un'` and `unit != 'cx'`:
- Items in kg/g → normalized to R$/kg
- Items in L/ml → normalized to R$/L

---

### `Category` (V1+, scaffolded in V0)

| Field | Type | Description |
|-------|------|-----------|
| `id` | `string` | PK |
| `name` | `string` | "Dairy", "Cleaning", "Meat" |
| `icon` | `string` | Emoji or icon token |
| `colorHex` | `string` | Color for visual differentiation |
| `sortOrder` | `number` | Display order |

**Default BR categories**: Butcher, Bakery, Deli/Dairy, Grocery, Produce,
Cleaning, Personal Hygiene, Beverages, Frozen, Other

---

### `Product` (V1+)

Local cache of the product catalog by EAN. Populated via Open Food Facts + scan.

| Field | Type | Description |
|-------|------|-----------|
| `id` | `string` | PK |
| `ean` | `string` | EAN-13/EAN-8 (unique index) |
| `name` | `string` | Product name |
| `brand` | `string \| null` | Brand |
| `defaultUnit` | `string` | Default unit for the product |
| `categoryId` | `string \| null` | FK → Category |
| `lastSeenPrice` | `number \| null` | Last recorded price (denorm.) |
| `lastSeenAt` | `number \| null` | Date of the last price |
| `source` | `'openfoodfacts' \| 'manual' \| 'nfe'` | Data origin |

---

### `PriceHistory` (V1+)

History of prices paid per product. Basis for variation alerts and comparisons.

| Field | Type | Description |
|-------|------|-----------|
| `id` | `string` | PK |
| `ean` | `string` | FK → Product.ean (index) |
| `listId` | `string` | Which list recorded this price |
| `price` | `number` | Unit price paid |
| `unit` | `string` | Price unit |
| `pricePerRefUnit` | `number \| null` | Normalized price (R$/kg or R$/L) |
| `recordedAt` | `number` | Unix timestamp ms |
| `storeId` | `string \| null` | FK → Store.id (V2) |

---

### `Store` (V2+)

Establishment where the purchase was made.

| Field | Type | Description |
|-------|------|-----------|
| `id` | `string` | PK |
| `name` | `string` | "Carrefour Pinheiros" |
| `cnpj` | `string \| null` | Establishment's CNPJ (extracted from the NF-e) |
| `chain` | `string \| null` | Chain: "Carrefour", "Atacadão", "Assaí" |
| `address` | `string \| null` | Address |
| `city` | `string \| null` | City |
| `state` | `string` | State abbreviation (2 characters) |

---

### `Receipt` (V2+)

Electronic Invoice (NF-e) imported via the receipt's QR code.

| Field | Type | Description |
|-------|------|-----------|
| `id` | `string` | PK |
| `chaveNfe` | `string` | 44-digit NF-e key (unique index) |
| `listId` | `string \| null` | Linked list (if the user imported it) |
| `storeId` | `string \| null` | FK → Store |
| `totalValue` | `number` | Invoice total value |
| `issuedAt` | `number` | Invoice issue date |
| `fetchedAt` | `number` | Date the app downloaded the invoice |
| `status` | `'pending' \| 'fetched' \| 'error'` | Fetch status |
| `rawJson` | `string \| null` | Invoice JSON/XML (stored for local audit) |

**LGPD**: This data **never leaves the device** without explicit consent.

---

### `SyncQueueItem` (scaffold V0, active V1+)

Queue of mutations for synchronization with a remote server (once a backend exists).

| Field | Type | Description |
|-------|------|-----------|
| `id` | `string` | PK |
| `entityType` | `string` | 'ShoppingList' \| 'ListItem' \| etc. |
| `entityId` | `string` | ID of the affected entity |
| `operation` | `'create' \| 'update' \| 'delete'` | Operation type |
| `payload` | `string` | JSON of the delta |
| `failCount` | `number` | Sync failure count |
| `createdAt` | `number` | Unix timestamp ms |

---

## IndexedDB Schema (Dexie)

```javascript
// Version 1 — V0 MVP
db.version(1).stores({
  shoppingLists: '++id, status, createdAt',
  listItems:     '++id, listId, isChecked, position, barcodeEan',
  categories:    '++id, sortOrder',
});

// Version 2 — V1 (barcode + history)
db.version(2).stores({
  products:      '++id, &ean, categoryId',
  priceHistory:  '++id, ean, listId, recordedAt',
  syncQueue:     '++id, entityType, operation, createdAt',
});

// Version 3 — V2 (NF-e + comparison)
db.version(3).stores({
  stores:   '++id, cnpj',
  receipts: '++id, &chaveNfe, listId, status',
});
```

Each version increment maps to a release. Dexie applies migrations when it detects
that the database is at a version earlier than the current code.

---

## Data Policy: Local vs. Synced

| Entity | V0 | V1 | V2 |
|----------|-----|-----|-----|
| ShoppingList | Local only | Opt-in backup | Opt-in backup |
| ListItem | Local only | With the list | With the list |
| Category | Local (built-in defaults) | Local | Local |
| Product (EAN cache) | — | Local | Shared crowd catalog (opt-in) |
| PriceHistory | — | Local | Opt-in anonymous contribution |
| Store | — | — | Local + crowd |
| Receipt (NF-e) | — | — | **Always local** (LGPD: sensitive fiscal data) |
| SyncQueue | Stub (does not drain) | Drains to backend | Drains to backend |

---

## Relationship Diagram

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

## Unit Conversion (Reference Table)

Used by `PriceComparisonController` to normalize prices:

| Unit | Category | Reference Unit | Factor |
|---------|-----------|----------------------|-------|
| `kg` | Weight | R$/kg | ÷ 1 |
| `g` | Weight | R$/kg | ÷ 0.001 |
| `L` | Volume | R$/L | ÷ 1 |
| `ml` | Volume | R$/L | ÷ 0.001 |
| `un` | Unit | R$/un | ÷ 1 |
| `cx` | Unit | R$/un | ÷ 1 |
| `pct` | Package | R$/pct | ÷ 1 |

**Practical example**:
- Soybean oil 900ml for R$ 8.99 → `8.99 ÷ 0.9` = **R$ 9.99/L**
- Soybean oil 2L for R$ 18.00 → `18.00 ÷ 2` = **R$ 9.00/L**
- Highlight: the 2L is R$ 0.99/L cheaper — displays a "Best value" badge
