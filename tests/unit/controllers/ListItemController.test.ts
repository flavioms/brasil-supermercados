import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/models/db';
import { ShoppingListController } from '@/controllers/ShoppingListController';
import { ListItemController } from '@/controllers/ListItemController';

beforeEach(async () => {
  await db.shoppingLists.clear();
  await db.listItems.clear();
});

describe('ListItemController', () => {
  describe('addItem', () => {
    it('adds item and recomputes totals', async () => {
      const listId = await ShoppingListController.createList('Test');
      // For weight/volume: unitPrice = total package price (R$15 for a 2kg bag)
      const itemId = await ListItemController.addItem({
        listId,
        name: 'Arroz',
        quantity: 2,
        unit: 'kg',
        unitPrice: 15,
      });

      const item = await db.listItems.get(itemId);
      expect(item?.name).toBe('Arroz');
      expect(item?.lineTotal).toBe(15);

      const list = await db.shoppingLists.get(listId);
      expect(list?.totalCost).toBe(15);
    });

    it('adds count item with per-unit price', async () => {
      const listId = await ShoppingListController.createList('Test');
      const itemId = await ListItemController.addItem({
        listId, name: 'Iogurte', quantity: 3, unit: 'un', unitPrice: 4,
      });
      const item = await db.listItems.get(itemId);
      expect(item?.lineTotal).toBe(12); // 3 × R$4
    });

    it('multiplies by packageCount when buying several weight/volume packages', async () => {
      const listId = await ShoppingListController.createList('Test');
      // 4 packages of 1kg flour at R$4.50 each = R$18 total, but still R$4.50/kg
      const itemId = await ListItemController.addItem({
        listId,
        name: 'Farinha de Trigo 1kg',
        quantity: 1,
        unit: 'kg',
        unitPrice: 4.5,
        packageCount: 4,
      });
      const item = await db.listItems.get(itemId);
      expect(item?.lineTotal).toBe(18);
      expect(item?.pricePerRefUnit).toBeCloseTo(4.5);

      const list = await db.shoppingLists.get(listId);
      expect(list?.totalCost).toBe(18);
    });

    it('sets pricePerRefUnit for kg items', async () => {
      const listId = await ShoppingListController.createList('Test');
      const itemId = await ListItemController.addItem({
        listId,
        name: 'Arroz',
        quantity: 5,
        unit: 'kg',
        unitPrice: 25,
      });
      const item = await db.listItems.get(itemId);
      expect(item?.pricePerRefUnit).toBeCloseTo(5); // R$5/kg
    });

    it('rejects invalid name', async () => {
      const listId = await ShoppingListController.createList('Test');
      await expect(
        ListItemController.addItem({ listId, name: 'A', quantity: 1, unit: 'un', unitPrice: 1 })
      ).rejects.toThrow();
    });

    it('assigns gap-encoded positions', async () => {
      const listId = await ShoppingListController.createList('Test');
      const id1 = await ListItemController.addItem({
        listId, name: 'Item 1', quantity: 1, unit: 'un', unitPrice: 1,
      });
      const id2 = await ListItemController.addItem({
        listId, name: 'Item 2', quantity: 1, unit: 'un', unitPrice: 1,
      });
      const item1 = await db.listItems.get(id1);
      const item2 = await db.listItems.get(id2);
      expect(item1?.position).toBe(1000);
      expect(item2?.position).toBe(2000);
    });
  });

  describe('toggleCheck', () => {
    it('toggles isChecked and recomputes totals', async () => {
      const listId = await ShoppingListController.createList('Test');
      const itemId = await ListItemController.addItem({
        listId, name: 'Leite', quantity: 1, unit: 'L', unitPrice: 5,
      });

      await ListItemController.toggleCheck(itemId);
      const item = await db.listItems.get(itemId);
      expect(item?.isChecked).toBe(true);

      const list = await db.shoppingLists.get(listId);
      expect(list?.checkedTotal).toBe(5);
    });
  });

  describe('updateItem', () => {
    it('recalculates lineTotal', async () => {
      const listId = await ShoppingListController.createList('Test');
      const itemId = await ListItemController.addItem({
        listId, name: 'Feijão', quantity: 1, unit: 'kg', unitPrice: 8,
      });
      await ListItemController.updateItem(itemId, { unitPrice: 10 });
      const item = await db.listItems.get(itemId);
      expect(item?.lineTotal).toBe(10);
    });

    it('recalculates lineTotal when packageCount changes', async () => {
      const listId = await ShoppingListController.createList('Test');
      const itemId = await ListItemController.addItem({
        listId, name: 'Feijão 5kg', quantity: 5, unit: 'kg', unitPrice: 25,
      });
      await ListItemController.updateItem(itemId, { packageCount: 2 });
      const item = await db.listItems.get(itemId);
      expect(item?.lineTotal).toBe(50); // 2 packages of 5kg at R$25 each
      expect(item?.pricePerRefUnit).toBeCloseTo(5); // still R$5/kg
    });
  });

  describe('deleteItem', () => {
    it('removes item and recomputes totals', async () => {
      const listId = await ShoppingListController.createList('Test');
      const itemId = await ListItemController.addItem({
        listId, name: 'Óleo', quantity: 1, unit: 'L', unitPrice: 9,
      });
      await ListItemController.deleteItem(itemId);
      expect(await db.listItems.get(itemId)).toBeUndefined();
      const list = await db.shoppingLists.get(listId);
      expect(list?.totalCost).toBe(0);
    });
  });
});
