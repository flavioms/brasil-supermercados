import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/models/db';
import { ShoppingListController } from '@/controllers/ShoppingListController';
import { createListItem } from '@/models/ListItem';

beforeEach(async () => {
  await db.shoppingLists.clear();
  await db.listItems.clear();
});

describe('ShoppingListController', () => {
  describe('createList', () => {
    it('creates a list and returns id', async () => {
      const id = await ShoppingListController.createList('Atacadão');
      const list = await db.shoppingLists.get(id);
      expect(list?.name).toBe('Atacadão');
      expect(list?.status).toBe('active');
    });

    it('rejects too-short name', async () => {
      await expect(ShoppingListController.createList('A')).rejects.toThrow();
    });

    it('sets budgetGoal', async () => {
      const id = await ShoppingListController.createList('Semana', 600);
      const list = await db.shoppingLists.get(id);
      expect(list?.budgetGoal).toBe(600);
    });
  });

  describe('renameList', () => {
    it('renames a list', async () => {
      const id = await ShoppingListController.createList('Old Name');
      await ShoppingListController.renameList(id, 'New Name');
      const list = await db.shoppingLists.get(id);
      expect(list?.name).toBe('New Name');
    });

    it('rejects too-short name', async () => {
      const id = await ShoppingListController.createList('Valid Name');
      await expect(ShoppingListController.renameList(id, 'X')).rejects.toThrow();
    });
  });

  describe('setBudgetGoal', () => {
    it('sets a numeric budget goal', async () => {
      const id = await ShoppingListController.createList('Budget Test');
      await ShoppingListController.setBudgetGoal(id, 500);
      const list = await db.shoppingLists.get(id);
      expect(list?.budgetGoal).toBe(500);
    });

    it('clears budget goal to null', async () => {
      const id = await ShoppingListController.createList('Budget Test', 300);
      await ShoppingListController.setBudgetGoal(id, null);
      const list = await db.shoppingLists.get(id);
      expect(list?.budgetGoal).toBeNull();
    });
  });

  describe('archiveList / restoreList', () => {
    it('archives and restores', async () => {
      const id = await ShoppingListController.createList('Test');
      await ShoppingListController.archiveList(id);
      let list = await db.shoppingLists.get(id);
      expect(list?.status).toBe('archived');

      await ShoppingListController.restoreList(id);
      list = await db.shoppingLists.get(id);
      expect(list?.status).toBe('active');
    });
  });

  describe('deleteList', () => {
    it('deletes list and cascade items', async () => {
      const id = await ShoppingListController.createList('To Delete');
      const item = createListItem({ listId: id, name: 'Arroz', quantity: 1, unit: 'kg', unitPrice: 5 });
      await db.listItems.add(item);

      await ShoppingListController.deleteList(id);
      expect(await db.shoppingLists.get(id)).toBeUndefined();
      const items = await db.listItems.where('listId').equals(id).toArray();
      expect(items).toHaveLength(0);
    });
  });

  describe('recomputeTotals', () => {
    it('computes totalCost and checkedTotal from items', async () => {
      const id = await ShoppingListController.createList('Recompute Test');

      const item1 = createListItem({ listId: id, name: 'Arroz', quantity: 2, unit: 'kg', unitPrice: 7.5 });
      const item2 = createListItem({ listId: id, name: 'Feijão', quantity: 1, unit: 'kg', unitPrice: 10 });
      item2.isChecked = true;

      await db.listItems.bulkAdd([item1, item2]);
      await ShoppingListController.recomputeTotals(id);

      const list = await db.shoppingLists.get(id);
      expect(list?.totalCost).toBe(25);
      expect(list?.checkedTotal).toBe(10);
    });

    it('sets totals to zero when no items', async () => {
      const id = await ShoppingListController.createList('Empty');
      await ShoppingListController.recomputeTotals(id);
      const list = await db.shoppingLists.get(id);
      expect(list?.totalCost).toBe(0);
      expect(list?.checkedTotal).toBe(0);
    });
  });
});
