import { db } from '@/models/db';
import { createShoppingList } from '@/models/ShoppingList';
import { validateListName } from '@/utils/validation';

export const ShoppingListController = {
  async createList(name: string, budgetGoal: number | null = null): Promise<string> {
    const validation = validateListName(name);
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Nome inválido');
    }
    const list = createShoppingList({ name: name.trim(), budgetGoal });
    await db.shoppingLists.add(list);
    return list.id;
  },

  async renameList(listId: string, newName: string): Promise<void> {
    const validation = validateListName(newName);
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Nome inválido');
    }
    await db.shoppingLists.update(listId, {
      name: newName.trim(),
      updatedAt: Date.now(),
    });
  },

  async setBudgetGoal(listId: string, goal: number | null): Promise<void> {
    await db.shoppingLists.update(listId, {
      budgetGoal: goal,
      updatedAt: Date.now(),
    });
  },

  async archiveList(listId: string): Promise<void> {
    await db.shoppingLists.update(listId, {
      status: 'archived',
      updatedAt: Date.now(),
    });
  },

  async restoreList(listId: string): Promise<void> {
    await db.shoppingLists.update(listId, {
      status: 'active',
      updatedAt: Date.now(),
    });
  },

  async deleteList(listId: string): Promise<void> {
    await db.transaction('rw', [db.shoppingLists, db.listItems], async () => {
      await db.listItems.where('listId').equals(listId).delete();
      await db.shoppingLists.delete(listId);
    });
  },

  async recomputeTotals(listId: string): Promise<void> {
    const items = await db.listItems.where('listId').equals(listId).toArray();
    const totalCost = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const checkedTotal = items
      .filter((item) => item.isChecked)
      .reduce((sum, item) => sum + item.lineTotal, 0);
    await db.shoppingLists.update(listId, {
      totalCost,
      checkedTotal,
      updatedAt: Date.now(),
    });
  },
};
