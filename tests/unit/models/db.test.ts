import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/models/db';
import { createShoppingList } from '@/models/ShoppingList';

beforeEach(async () => {
  await db.shoppingLists.clear();
  await db.listItems.clear();
});

describe('db schema', () => {
  it('opens and accepts a ShoppingList record', async () => {
    const list = createShoppingList({ name: 'Mercado' });
    await db.shoppingLists.add(list);
    const found = await db.shoppingLists.get(list.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Mercado');
  });

  it('returns correct record by id', async () => {
    const list = createShoppingList({ name: 'Carrefour' });
    await db.shoppingLists.add(list);
    const found = await db.shoppingLists.get(list.id);
    expect(found?.id).toBe(list.id);
    expect(found?.status).toBe('active');
  });
});
