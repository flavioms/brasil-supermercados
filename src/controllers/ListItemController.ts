import { db } from '@/models/db';
import { createListItem } from '@/models/ListItem';
import type { ItemUnit } from '@/models/ListItem';
import { ShoppingListController } from './ShoppingListController';
import { validateItemFields } from '@/utils/validation';
import { calcPricePerRefUnit, WEIGHT_VOLUME_UNITS } from '@/utils/units';

export interface AddItemInput {
  listId: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  categoryId?: string | null;
}

export const ListItemController = {
  async addItem(input: AddItemInput): Promise<string> {
    const validation = validateItemFields({
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      unitPrice: input.unitPrice,
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
    const pricePerRefUnit = calcPricePerRefUnit(input.unitPrice, input.quantity, input.unit);
    // For weight/volume packages, unitPrice = total package price (shown on shelf label)
    const lineTotal = WEIGHT_VOLUME_UNITS.includes(input.unit)
      ? input.unitPrice
      : input.quantity * input.unitPrice;

    const item = createListItem({
      listId: input.listId,
      name: input.name.trim(),
      quantity: input.quantity,
      unit: input.unit,
      unitPrice: input.unitPrice,
      position,
      categoryId: input.categoryId ?? null,
    });

    item.pricePerRefUnit = pricePerRefUnit;
    item.lineTotal = lineTotal;

    await db.listItems.add(item);
    await ShoppingListController.recomputeTotals(input.listId);
    return item.id;
  },

  async updateItem(
    itemId: string,
    changes: Partial<Pick<AddItemInput, 'name' | 'quantity' | 'unit' | 'unitPrice' | 'categoryId'>>
  ): Promise<void> {
    const existing = await db.listItems.get(itemId);
    if (!existing) throw new Error('Item não encontrado');

    const updated = {
      ...existing,
      ...changes,
      name: changes.name !== undefined ? changes.name.trim() : existing.name,
    };

    if (changes.name !== undefined || changes.quantity !== undefined || changes.unitPrice !== undefined) {
      const validation = validateItemFields({
        name: updated.name,
        quantity: updated.quantity,
        unit: updated.unit,
        unitPrice: updated.unitPrice,
      });
      if (!validation.valid) {
        throw new Error(validation.error ?? 'Dados inválidos');
      }
    }

    const lineTotal = WEIGHT_VOLUME_UNITS.includes(updated.unit)
      ? updated.unitPrice
      : updated.quantity * updated.unitPrice;
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

    await db.listItems.update(itemId, {
      isChecked: !item.isChecked,
      updatedAt: Date.now(),
    });

    await ShoppingListController.recomputeTotals(item.listId);
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
