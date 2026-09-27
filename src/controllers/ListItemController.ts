import { db } from '@/models/db';
import { createListItem, calcLineTotal } from '@/models/ListItem';
import type { ItemUnit } from '@/models/ListItem';
import { ShoppingListController } from './ShoppingListController';
import { validateItemFields } from '@/utils/validation';
import { calcPricePerRefUnit } from '@/utils/units';
import { analytics } from '@/lib/analytics';

export interface AddItemInput {
  listId: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  packageCount?: number;
  categoryId?: string | null;
}

export const ListItemController = {
  async addItem(input: AddItemInput): Promise<string> {
    const packageCount = input.packageCount ?? 1;
    const validation = validateItemFields({
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      unitPrice: input.unitPrice,
      packageCount,
    });
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Dados inválidos');
    }

    const lastItem = await db.listItems
      .where('listId')
      .equals(input.listId)
      .reverse()
      .sortBy('position')
      .then((items) => items[0]);

    const position = lastItem ? lastItem.position + 1000 : 1000;

    const item = createListItem({
      listId: input.listId,
      name: input.name.trim(),
      quantity: input.quantity,
      unit: input.unit,
      unitPrice: input.unitPrice,
      packageCount,
      position,
      categoryId: input.categoryId ?? null,
    });

    await db.listItems.add(item);
    await ShoppingListController.recomputeTotals(input.listId);
    analytics.capture('item_added', {
      hasPrice: input.unitPrice > 0,
      unit: input.unit,
      hasCategory: !!input.categoryId,
    });
    return item.id;
  },

  async updateItem(
    itemId: string,
    changes: Partial<
      Pick<AddItemInput, 'name' | 'quantity' | 'unit' | 'unitPrice' | 'packageCount' | 'categoryId'>
    >
  ): Promise<void> {
    const existing = await db.listItems.get(itemId);
    if (!existing) throw new Error('Item não encontrado');

    const updated = {
      ...existing,
      ...changes,
      name: changes.name !== undefined ? changes.name.trim() : existing.name,
    };

    if (
      changes.name !== undefined ||
      changes.quantity !== undefined ||
      changes.unitPrice !== undefined ||
      changes.packageCount !== undefined
    ) {
      const validation = validateItemFields({
        name: updated.name,
        quantity: updated.quantity,
        unit: updated.unit,
        unitPrice: updated.unitPrice,
        packageCount: updated.packageCount,
      });
      if (!validation.valid) {
        throw new Error(validation.error ?? 'Dados inválidos');
      }
    }

    const lineTotal = calcLineTotal(
      updated.quantity,
      updated.unit,
      updated.unitPrice,
      updated.packageCount
    );
    const pricePerRefUnit = calcPricePerRefUnit(updated.unitPrice, updated.quantity, updated.unit);

    await db.listItems.update(itemId, {
      ...changes,
      name: updated.name,
      lineTotal,
      pricePerRefUnit,
      updatedAt: Date.now(),
    });

    await ShoppingListController.recomputeTotals(existing.listId);
  },

  async toggleCheck(itemId: string): Promise<void> {
    const item = await db.listItems.get(itemId);
    if (!item) throw new Error('Item não encontrado');

    const newChecked = !item.isChecked;
    await db.listItems.update(itemId, {
      isChecked: newChecked,
      updatedAt: Date.now(),
    });

    await ShoppingListController.recomputeTotals(item.listId);
    analytics.capture(newChecked ? 'item_checked' : 'item_unchecked');
  },

  async deleteItem(itemId: string): Promise<void> {
    const item = await db.listItems.get(itemId);
    if (!item) throw new Error('Item não encontrado');

    await db.listItems.delete(itemId);
    await ShoppingListController.recomputeTotals(item.listId);
  },

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    await ListItemController.updateItem(itemId, { quantity });
  },
};
