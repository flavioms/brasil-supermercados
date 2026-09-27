# Product Vision — Supermercado Brasil

---

## The Problem

### Economic Context

Brazil is going through a period of persistent food inflation. The food IPCA (consumer
price index) accumulates consecutive increases, with staple products such as rice, beans,
soybean oil, eggs, and meat rising every week. For most Brazilian families, the
supermarket is the largest monthly expense — and with every visit, the same cart costs more.

Products with the greatest historical price variation in Brazil:
- Beef (rump steak, chicken, picanha)
- Produce (tomato, carrot, potato)
- Vegetable oils (soybean, canola, sunflower)
- Eggs
- Ground coffee
- Whole milk

The share of income that low- and middle-income families commit to food is
disproportionately high. For those earning up to 3 minimum wages, the supermarket
represents 30–40% of the monthly budget.

### The Current Experience

- You enter the supermarket with a budget in mind
- You put items in the cart without knowing the accumulated total
- You reach the checkout and the amount is different than expected — almost always higher
- Sometimes you need to put products back in front of the line, an embarrassing situation
- You have no way of knowing, in the aisle, whether the product is more expensive than last week
- You don't know whether it's worth going to the farther Assaí instead of the nearby Carrefour
- No app solves this problem in a simple, offline, one-handed way

---

## Value Proposition

Supermercado Brasil is not a shopping list. It is a **personal savings tool**
for those who cannot afford to spend beyond what they planned.

### What the app offers

| When | What the app does |
|--------|----------------|
| When adding each item | Shows the accumulated total in real time |
| When marking an item as "in cart" | Updates the session subtotal |
| When scanning a product (V1) | Warns if the price has gone up since the last purchase |
| Before leaving home (V2) | Indicates which store is cheapest for your list |
| At the end of the month (V2) | Shows how much you spent and where you saved |

### Mission

> Put the power of price information in the hands of those who most need to save.

---

## Personas

### Primary Persona — "Maria"

**Profile:**
- 35 years old, mother of three children (ages 5, 9, and 13)
- Household income: R$ 3,500/month
- Shops weekly, usually at Atacadão or Assaí
- Weekly food budget: R$ 550–600
- Device: Motorola Moto G (Android 12, 4GB RAM)
- Connectivity inside the store: weak or nonexistent signal

**Pain points:**
- Prices have risen so much she can no longer buy everything she used to
- Needs to make substitutions in the aisle ("do I take the rice or the pasta?") but doesn't know the impact on the total
- Has already experienced returning products at the checkout — traumatic
- Doesn't have time to compare prices across different apps before shopping
- Doesn't want to sign up, doesn't want a tutorial, doesn't want mandatory internet

**What she needs:**
- To know the total before reaching the checkout
- An interface that works with her thumb while the other hand holds products
- To work even when the signal disappears inside the store

---

### Secondary Persona — "João"

**Profile:**
- 28 years old, lives alone, IT analyst
- Income: R$ 4,800/month
- Shops biweekly at Carrefour or Extra
- Biweekly budget: R$ 400 for food
- Device: Samsung Galaxy A54 (Android 13)
- More digitally literate, but wants simplicity while shopping

**Pain points:**
- Notices that the same cart costs more with every visit but has no data to confirm it
- Would like to know whether it's worth going to the farther Assaí instead of the nearby Carrefour
- Wants to track his food spending over time

**What he needs:**
- Price history per product to detect variations
- Store comparison for his specific list
- Export data to a financial control spreadsheet

---

## Positioning Statement

**For** Brazilian families who need to save money at the supermarket amid a scenario of
persistent food inflation,

**Supermercado Brasil** is an offline-first PWA

**that** shows the total in real time, alerts when a price has gone up, and compares which
store is cheapest for your products —

**unlike** apps such as Bring! or Listonic, which are lists without prices; iFood and Rappi,
which solve delivery but completely ignore the experience of those who need to stretch
their budget inside the physical store; and BoaLista, which attempted this but appears
inactive since 2018.

---

## Why PWA (not a native app)

| Criterion | PWA | Native App |
|----------|-----|------------|
| Installation | Zero friction — link or QR code | Download from the app store |
| Update | Instant, silent | Depends on the user updating |
| Offline | Service Worker | Requires native implementation |
| Mid-range Android | Lightweight, no framework overhead | APK can be heavy |
| Deploy cost | Simple web hosting | Apple Developer ($99/year), Play Store |
| Time to first use | Seconds | Minutes (download + installation) |

**Distribution insight**: A QR code at the supermarket entrance or on promotional flyers
can generate immediate adoption at the point of pain — inside the store, at the moment of
purchase. No native app can achieve this kind of frictionless distribution.

---

## What the App Is NOT

- **It is not a delivery app** — iFood and Rappi already solve that
- **It is not an online price comparator** — Buscapé and Google Shopping solve that
- **It is not a recipe app** — Cookpad, TudoGostoso solve that
- **It is not household inventory management** — Out of Milk solves that
- **It is not a complete financial app** — Nubank, Mobills solve that

Supermercado Brasil does one thing extremely well: **it helps you save money inside
the physical supermarket**.
