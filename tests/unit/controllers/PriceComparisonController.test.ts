import { describe, it, expect } from 'vitest';
import { PriceComparisonController } from '@/controllers/PriceComparisonController';
import { createListItem } from '@/models/ListItem';

describe('PriceComparisonController', () => {
  describe('calcPricePerUnit', () => {
    it('returns value and refUnit for L', () => {
      const result = PriceComparisonController.calcPricePerUnit(8.99, 900, 'ml');
      expect(result).not.toBeNull();
      expect(result?.refUnit).toBe('L');
      expect(result?.value).toBeCloseTo(9.988, 2);
    });

    it('normalizes g to kg', () => {
      const result = PriceComparisonController.calcPricePerUnit(1, 100, 'g');
      expect(result?.refUnit).toBe('kg');
      expect(result?.value).toBeCloseTo(10);
    });

    it('returns null for un', () => {
      expect(PriceComparisonController.calcPricePerUnit(5, 1, 'un')).toBeNull();
    });
  });

  describe('comparePrices', () => {
    it('returns id of cheapest item per liter', () => {
      const item1 = createListItem({ listId: 'l', name: 'Óleo 900ml', quantity: 900, unit: 'ml', unitPrice: 8.99 });
      const item2 = createListItem({ listId: 'l', name: 'Óleo 2L', quantity: 2, unit: 'L', unitPrice: 16 });
      const cheapest = PriceComparisonController.comparePrices([item1, item2]);
      // item2: 16/2 = 8/L, item1: 8.99/0.9 ≈ 9.99/L → item2 is cheaper
      expect(cheapest).toBe(item2.id);
    });

    it('returns null for non-comparable items', () => {
      const item = createListItem({ listId: 'l', name: 'Pão', quantity: 1, unit: 'un', unitPrice: 5 });
      expect(PriceComparisonController.comparePrices([item])).toBeNull();
    });
  });

  describe('suggestBestValue', () => {
    it('suggests better item when available', () => {
      const expensive = createListItem({ listId: 'l', name: 'Soja 900ml', quantity: 900, unit: 'ml', unitPrice: 8.99 });
      const cheap = createListItem({ listId: 'l', name: 'Soja 2L', quantity: 2, unit: 'L', unitPrice: 14 });

      const result = PriceComparisonController.suggestBestValue(expensive, [expensive, cheap]);
      expect(result.hasBetter).toBe(true);
      expect(result.betterItemId).toBe(cheap.id);
    });

    it('returns hasBetter false when already cheapest', () => {
      const cheap = createListItem({ listId: 'l', name: 'Soja 2L', quantity: 2, unit: 'L', unitPrice: 14 });
      const expensive = createListItem({ listId: 'l', name: 'Soja 900ml', quantity: 900, unit: 'ml', unitPrice: 8.99 });

      const result = PriceComparisonController.suggestBestValue(cheap, [cheap, expensive]);
      expect(result.hasBetter).toBe(false);
    });
  });
});
