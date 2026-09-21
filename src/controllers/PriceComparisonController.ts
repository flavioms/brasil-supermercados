import type { ListItem } from '@/models/ListItem';
import { calcPricePerRefUnit, getRefUnit } from '@/utils/units';

export interface PricePerUnitResult {
  value: number;
  refUnit: string;
}

export const PriceComparisonController = {
  calcPricePerUnit(
    unitPrice: number,
    quantity: number,
    unit: ListItem['unit']
  ): PricePerUnitResult | null {
    const refUnit = getRefUnit(unit);
    if (!refUnit) return null;

    const value = calcPricePerRefUnit(unitPrice, quantity, unit);
    if (value === null) return null;

    return { value, refUnit };
  },

  comparePrices(items: ListItem[]): string | null {
    const comparableItems = items
      .map((item) => {
        const result = PriceComparisonController.calcPricePerUnit(
          item.unitPrice,
          item.quantity,
          item.unit
        );
        return result
          ? { id: item.id, pricePerRefUnit: result.value, refUnit: result.refUnit }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (comparableItems.length === 0) return null;

    // Group by refUnit and find cheapest in each group
    const byRefUnit = new Map<string, typeof comparableItems>();
    for (const item of comparableItems) {
      const group = byRefUnit.get(item.refUnit) ?? [];
      group.push(item);
      byRefUnit.set(item.refUnit, group);
    }

    let cheapestId: string | null = null;
    let cheapestPrice = Infinity;

    for (const group of byRefUnit.values()) {
      for (const item of group) {
        if (item.pricePerRefUnit < cheapestPrice) {
          cheapestPrice = item.pricePerRefUnit;
          cheapestId = item.id;
        }
      }
    }

    return cheapestId;
  },

  suggestBestValue(
    item: ListItem,
    allItemsInList: ListItem[]
  ): { hasBetter: boolean; betterItemId: string | null } {
    const itemResult = PriceComparisonController.calcPricePerUnit(
      item.unitPrice,
      item.quantity,
      item.unit
    );
    if (!itemResult) return { hasBetter: false, betterItemId: null };

    const sameRefUnit = allItemsInList.filter((other) => {
      if (other.id === item.id) return false;
      const otherResult = PriceComparisonController.calcPricePerUnit(
        other.unitPrice,
        other.quantity,
        other.unit
      );
      return otherResult?.refUnit === itemResult.refUnit;
    });

    for (const other of sameRefUnit) {
      const otherResult = PriceComparisonController.calcPricePerUnit(
        other.unitPrice,
        other.quantity,
        other.unit
      );
      if (otherResult && otherResult.value < itemResult.value) {
        return { hasBetter: true, betterItemId: other.id };
      }
    }

    return { hasBetter: false, betterItemId: null };
  },
};
