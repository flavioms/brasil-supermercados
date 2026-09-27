# Competitive Analysis

---

## Complete Competitor Map

### Global Apps

| App | Users | Key Strength | Critical Weakness | Offline? | RT Total? | BR Pricing? |
|-----|----------|----------------|-----------------|----------|-----------|-----------|
| **Bring!** | > 50M | Visual UI, collaborative, PT-BR available | No price tracking | Partial | ❌ | ❌ |
| **Listonic** | > 20M | Sync, automatic categorization | Ads during shopping, disappearing items | ✅ | ❌ | ❌ |
| **OurGroceries** | > 5M | Fastest real-time sync, Apple Watch, barcode | Price tracking requested by users for 3+ years, no response | ✅ | ❌ | ❌ |
| **AnyList** | Paid | Recipes, import from cooking blogs | 100% manual pricing, no automation | ✅ | ❌ | ❌ |
| **Groceries Tracker** | Niche | Paid price history, receipt AI | Complex UI, no native mobile | Partial | ✅ | ❌ |
| **Basket** | US | Store comparison before shopping | Doesn't work during shopping, US data | ❌ | ❌ | ❌ |
| **Flipp** | North America | Digital flyers, weekly coupons | Pre-shopping only, not a list | ❌ | ❌ | ❌ |
| **Out of Milk** | Medium | Household inventory management | Dated UI, no pricing | ✅ | ❌ | ❌ |

### Brazilian Apps

| App | Status | Key Strength | Critical Weakness | Relevance |
|-----|--------|----------------|-----------------|------------|
| **BoaLista** | ⚠️ Inactive (~2018) | Barcode + local price comparison + offline | No continuity, apparently discontinued | High (validated proof of concept in Brazil) |
| **iFood** | ✅ Active, dominant | 83% of food delivery in Brazil | Focused on delivery, doesn't track in-store shopping | Low (different market) |
| **Rappi** | ✅ Active | Super app (food + grocery + pharma + fintech) | Focused on delivery, not physical stores | Low |
| **Mercado Livre** | ✅ Active | Largest e-commerce in Latin America | Focused on e-commerce, not physical stores | Low |
| **Minhas Economias** | ✅ Active (finance) | Personal financial management | Not specific to grocery shopping | Low |

---

## Detailed Analysis of Key Competitors

### Bring!

**What works well:**
- Visual interface with product icons — reduces reading in noisy environments
- Real-time collaboration for shared lists
- Available in PT-BR with good localization
- Clean, modern design

**What fails:**
- Prices completely absent — the most demanded feature
- No running total during shopping
- Limited offline mode (assets load, but sync fails)

**Lesson for Supermercado Brasil:** The visual UI with product icons is a pattern that
works well. However, prices and totals are the gap that Bring! never filled.

---

### Listonic

**What works well:**
- 20M+ user base validates demand for collaborative lists
- Automatic categorization by product type
- Functional offline mode for local lists

**What fails (straight from user reviews):**
- Ads appear during the shopping session (notably: a Shein ad in the middle of a grocery list)
- Daily privacy consent pop-ups that ignore previous responses
- Items disappear from lists without warning
- Duplicate items appear spontaneously
- No visible running total

**Lesson for Supermercado Brasil:** Ad monetization within the usage context (inside the
store) is an anti-pattern that destroys trust. The model must be different from the start.

---

### OurGroceries

**What works well:**
- Fastest cross-device sync on the market
- Apple Watch and Alexa integration
- Barcode scanner (for adding items, not price comparison)
- Customizable aisle organization

**What fails:**
- Users have requested price tracking for more than 3 years on support forums
- The developer has never responded to this request
- No visible running total during shopping

**Lesson for Supermercado Brasil:** There is enormous unmet demand for price tracking
in shopping list apps. This is literally the feature the leading competitor refused
to build.

---

### BoaLista (Brazil, ~2015–2018)

**History:** Startup from Rio de Janeiro that received R$ 1 million in angel investment.
It was the closest app to what Supermercado Brasil proposes.

**What it did right:**
- Barcode scanning to compare prices across local stores
- Functional offline mode
- User-submitted prices (crowd-sourcing)
- Online vs. in-store comparison
- Purchase history

**Why it failed (hypothesis):**
- Crowd-sourced pricing is hard to scale — data becomes outdated
- Didn't use NF-e for automatic price updates (the law requiring QR codes was only
  fully implemented after 2015–2017)
- May have lacked focus on single-use UX (in-store, one-handed)

**Lesson for Supermercado Brasil:** BoaLista proves there is real demand in Brazil.
The difference now is that the NF-e infrastructure is mature, which solves the problem
of outdated price data — without relying on users manually typing in prices.

---

## Main User Complaints (cross-app)

Gathered from app store reviews and support forums:

### Functional Bugs (most critical)
1. **Items disappearing** during the shopping session — catastrophic in this context
2. **Duplicate items** appearing spontaneously
3. **Sync failures** after updates — carefully organized lists get destroyed
4. **Can't bulk-delete checked items** — must delete one at a time

### Monetization Friction
5. **Ads during shopping** — the moment of peak user concentration
6. **Daily consent pop-ups** ignoring previous responses
7. **Paywall on basic features** like sync and sharing

### Universally Requested Features (delivered by none)
8. **Real-time total** visible while shopping — the most frequent request
9. **Price variation tracking** per product
10. **Split must-have vs. optional** within the list

### UX
11. **Critical actions at the top of the screen** — unreachable one-handed
12. **Deep menu hierarchy** — hinders use while on the move
13. **No offline mode** in apps that depend on network access

---

## Opportunity Map

### What No App Does (specifically in Brazil)

```
                    Works offline?
                    ┌──────YES──────┬──────NO───────┐
                    │               │               │
          YES       │  ★ OUR        │  Basket       │
Real-time           │    SPACE      │  (pre-shop    │
total?              │               │  only)        │
          ──────────┼───────────────┼───────────────┤
          NO        │  Listonic     │  Bring!       │
                    │  OurGroceries │  iFood        │
                    │  BoaLista†    │  Rappi        │
                    └───────────────┴───────────────┘
                    † Inactive
```

### Five Cumulative Differentiators

| # | Differentiator | Complexity | Impact |
|---|-------------|-------------|---------|
| 1 | Guaranteed offline-first | Low | High |
| 2 | Real-time total (sticky footer) | Low | High |
| 3 | One-handed UX | Medium | High |
| 4 | Barcode scanning + price history | Medium | Very High |
| 5 | **NF-e QR code** → automatic receipt import | High | **Exclusive in the market** |

### The NF-e Differentiator (exclusive to Brazil)

Every Brazilian supermarket is **legally required** to issue an NFC-e (Electronic Consumer
Invoice) with a QR code on the receipt. This QR code points to a SEFAZ (State Treasury
Department) endpoint that returns all purchased items, quantities, and prices paid in
structured format.

**Impact:** The user scans the receipt's QR code when leaving the store → the app
automatically imports the entire purchase with real prices → the price history per
product per store builds itself, with no manual entry required.

No Brazilian shopping list app uses this infrastructure. It is the project's biggest
window of opportunity for differentiation.

---

## Strategic Conclusion

The Brazilian in-store shopping app market has a clear vacuum:
- **BoaLista** was the right bet but appears inactive
- **Listonic/Bring/OurGroceries** solve the list, not the price
- **iFood/Rappi/Mercado Livre** solve delivery, not physical shopping

Supermercado Brasil enters this vacuum with:
1. A direct, relevant proposition for the context of inflation
2. Brazil's fiscal infrastructure (NF-e) as an exclusive technical differentiator
3. UX built from the ground up for one-handed use in the store aisle
