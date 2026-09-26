import { db } from '@/models/db';
import { createShoppingList } from '@/models/ShoppingList';
import { validateListName } from '@/utils/validation';
import { analytics } from '@/lib/analytics';

export const ShoppingListController = {
  async createList(name: string, budgetGoal: number | null = null): Promise<string> {
    const validation = validateListName(name);
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Nome inválido');
    }
    const list = createShoppingList({ name: name.trim(), budgetGoal });
    await db.shoppingLists.add(list);
    analytics.capture('list_created', { budgetSet: budgetGoal !== null });
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
    analytics.capture('budget_set', { hasGoal: goal !== null });
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
    const [items, list] = await Promise.all([
      db.listItems.where('listId').equals(listId).toArray(),
      db.shoppingLists.get(listId),
    ]);
    const totalCost = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const checkedTotal = items
      .filter((item) => item.isChecked)
      .reduce((sum, item) => sum + item.lineTotal, 0);

    if (list?.budgetGoal && list.budgetGoal > 0) {
      const wasUnder = (list.totalCost ?? 0) <= list.budgetGoal;
      const isNowOver = totalCost > list.budgetGoal;
      if (wasUnder && isNowOver) {
        analytics.capture('budget_exceeded', {
          overageAmount: totalCost - list.budgetGoal,
          budgetGoal: list.budgetGoal,
          totalCost,
        });
      }
    }

    await db.shoppingLists.update(listId, {
      totalCost,
      checkedTotal,
      updatedAt: Date.now(),
    });
  },
};
