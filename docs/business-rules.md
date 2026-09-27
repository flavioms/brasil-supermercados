# Business Rules

This document is the source of truth for all system rules and validations.
Every implementation must respect these rules. Changes require updating this document first.

---

## V0 — MVP: Price Tracker

### Shopping List

| ID | Rule |
|----|-------|
| **BR-01** | A list has a required name (1–60 characters, not whitespace only) |
| **BR-02** | A list can have an optional budget goal in BRL (minimum value: R$ 0.01) |
| **BR-03** | A list can be in one of two states: `active` or `archived` |
| **BR-04** | Multiple lists can coexist simultaneously (no limit in V0) |
| **BR-05** | Deleting a list removes all of its items in cascade (irreversible operation) |
| **BR-06** | The list's **grand total** = sum of `lineTotal` of **all** items |
| **BR-07** | The **session subtotal** = sum of `lineTotal` of only the items with `isChecked = true` |
| **BR-08** | Archived lists do not appear on the main screen (home), but are accessible via filter |

### List Item

| ID | Rule |
|----|-------|
| **BR-09** | An item has a required name (1–80 characters) |
| **BR-10** | Minimum quantity: `0.001` \| Maximum quantity: `9,999` |
| **BR-11** | Minimum unit price: `R$ 0.00` (a free item is valid) \| Maximum price: `R$ 99,999.99` |
| **BR-12** | Supported units: `un`, `kg`, `g`, `L`, `ml`, `cx`, `pct` |
| **BR-13** | An item can be marked as "in cart" (`isChecked = true`) without being deleted |
| **BR-14** | Checked items **remain visible** in the list — they collapse to the end, but do not disappear |
| **BR-15** | The line total (`lineTotal`) = `quantity × unitPrice` for count-based units (`un`, `cx`, `pct`). For weight/volume units (`kg`, `g`, `L`, `ml`), `unitPrice` is the total shelf price of **one package**, `quantity` is that package's size, and `packageCount` is how many identical packages were bought — so `lineTotal` = `packageCount × unitPrice` (stored for performance) |
| **BR-16** | The item's position in the list is controlled by an integer with gap encoding (multiples of 1000) |
| **BR-16b** | For weight/volume units, `packageCount` is an integer between `1` and `999`, defaulting to `1`. It does not affect `pricePerRefUnit`, which is always derived from a single package's `quantity` and `unitPrice` |

### Totals and Budget

| ID | Rule |
|----|-------|
| **BR-17** | `totalCost` and `checkedTotal` on the list are recomputed after **each** item mutation |
| **BR-18** | Budget progress is calculated based on the **grand total** (not just the checked items) |
| **BR-19** | When exceeding 100% of the budget: distinct visual indicator (red + pulse animation) |
| **BR-20** | The display of price per unit of measure (R$/kg, R$/L) is calculated from `unitPrice` and `unit` |

### Offline and Persistence

| ID | Rule |
|----|-------|
| **BR-21** | Every operation (create, edit, check, delete) works **100% offline** |
| **BR-22** | Data persists across browser sessions via IndexedDB |
| **BR-23** | In private/incognito mode, the app must display a warning about possible data loss when closing the tab |
| **BR-24** | The app does not block any action due to lack of connection — optimistic UI, background sync |

---

## V1 — Barcode Scan + Price History

| ID | Rule |
|----|-------|
| **BR-25** | The scanned EAN is looked up first in the local cache (`products` in IndexedDB), then in the Open Food Facts API |
| **BR-26** | If the product is not found in the catalog, the add form remains open for manual entry |
| **BR-27** | A successful scan pre-fills the name, default unit, and last known price — the user can edit before confirming |
| **BR-28** | Each recorded price (manual or via barcode) is saved to history: `{ ean, price, unit, date, list }` |
| **BR-29** | Price history is stored only locally in V1 |
| **BR-30** | When adding an item already in the local database, the app displays the last recorded price and the variation relative to the current one |
| **BR-31** | Price normalization per unit (R$/kg, R$/100g) is calculated to allow comparison between different packages |
| **BR-32** | If `BarcodeDetector` is not available in the browser, the scan button is hidden; manual entry remains available |

---

## V2 — NF-e + Price Comparison

| ID | Rule |
|----|-------|
| **BR-33** | The receipt's QR code contains the 44-digit NF-e key (or a URL containing that key) |
| **BR-34** | The NF-e key is validated: 44 numeric digits, with check digit verification |
| **BR-35** | The NF-e fetch happens via a serverless proxy (CORS) — the client never accesses SEFAZ directly |
| **BR-36** | Importing an NF-e creates pre-filled items in the active list (or in a new list, if the user prefers) |
| **BR-37** | The `priceSource` of each item imported via NF-e is marked as `'nfe'` |
| **BR-38** | **NF-e data NEVER leaves the device** without the user's explicit consent (LGPD) — fiscal data is sensitive because it contains history linked to the establishment's CNPJ |
| **BR-39** | The price comparison uses anonymous history from multiple users, exclusively opt-in |
| **BR-40** | To contribute to the crowd-sourced comparison, the user must explicitly opt in (opt-in, not opt-out) |
| **BR-41** | Data shared for the comparison is anonymized: no CPF, no NF-e key, no personal data — only `{ ean, cnpj_loja, price, unit, date }` |
| **BR-42** | The ranking of cheapest stores is calculated over the **items in the user's active list** (not a generic list) |

---

## Validations — Shared Constants

These constants are the source of truth for validation across all layers (Model, Controller, View).

```
LISTA_NOME_MIN          = 1
LISTA_NOME_MAX          = 60
LISTA_ORCAMENTO_MIN     = 0.01

ITEM_NOME_MIN           = 1
ITEM_NOME_MAX           = 80
ITEM_QUANTIDADE_MIN     = 0.001
ITEM_QUANTIDADE_MAX     = 9999
ITEM_PRECO_UNITARIO_MIN = 0.00
ITEM_PRECO_UNITARIO_MAX = 99999.99
ITEM_PACOTES_MIN        = 1
ITEM_PACOTES_MAX        = 999

UNIDADES_VALIDAS        = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct']
```

---

## LGPD Rules (Brazilian General Data Protection Law)

The app implicitly collects personal data (shopping lists reveal consumption habits).
The following rules apply:

| ID | Rule |
|----|-------|
| **LGPD-01** | All data stays on the user's device by default (V0 and V1) |
| **LGPD-02** | Any data sharing with external servers requires explicit opt-in with clear language in PT-BR |
| **LGPD-03** | The user can export all of their data at any time (right to portability) |
| **LGPD-04** | The user can delete all of their data with a single action (right to be forgotten) |
| **LGPD-05** | NF-e data (fiscal receipts) is never shared, even with general opt-in |
| **LGPD-06** | The privacy policy must be available in PT-BR before any data collection |

---

## State Rules (State Machine)

### Shopping List

```
         create
[NEW] ──────────→ [ACTIVE]
                      │
                      │ archive
                      ↓
                  [ARCHIVED]
                      │
                      │ restore
                      ↑
                   (back to ACTIVE)
                      │
                      │ delete
                      ↓
                  [DELETED] (irreversible, cascades to items)
```

### List Item

```
         add
[NEW] ──────────→ [PENDING]
                      │         ← position in list = unchecked
                      │ check
                      ↓
                  [IN CART]  ← position in list = collapsed section
                      │
                      │ uncheck
                      ↑
                   (back to PENDING)
                      │
                      │ delete
                      ↓
                  [DELETED] (hard delete from IndexedDB)
```
