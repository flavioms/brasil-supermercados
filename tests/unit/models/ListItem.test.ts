import { describe, it, expect } from 'vitest';
import { createListItem } from '@/models/ListItem';

describe('createListItem', () => {
  it('creates a count-based item with correct lineTotal', () => {
    const item = createListItem({
      listId: 'list-1',
      name: 'Iogurte',
      quantity: 2,
      unit: 'un',
      unitPrice: 7.5,
    });
    expect(item.lineTotal).toBe(15);
  });

  it('defaults packageCount to 1 for a single weight/volume package', () => {
    const item = createListItem({
      listId: 'list-1',
      name: 'Arroz 2kg',
      quantity: 2,
      unit: 'kg',
      unitPrice: 7.5,
    });
    expect(item.packageCount).toBe(1);
    expect(item.lineTotal).toBe(7.5);
  });

  it('multiplies by packageCount when buying several weight/volume packages', () => {
    // 4 packages of 1kg flour at R$4.50 each = R$18 total
    const item = createListItem({
      listId: 'list-1',
      name: 'Farinha de Trigo 1kg',
      quantity: 1,
      unit: 'kg',
      unitPrice: 4.5,
      packageCount: 4,
    });
    expect(item.lineTotal).toBe(18);
    expect(item.pricePerRefUnit).toBeCloseTo(4.5); // R$/kg unaffected by packageCount
  });

  it('sets default values', () => {
    const item = createListItem({
      listId: 'list-1',
      name: 'Iogurte',
      quantity: 1,
      unit: 'un',
      unitPrice: 8,
    });
    expect(item.isChecked).toBe(false);
    expect(item.position).toBe(1000);
    expect(item.priceSource).toBe('manual');
    expect(item.categoryId).toBeNull();
    expect(item.barcodeEan).toBeNull();
    expect(item.pricePerRefUnit).toBeNull();
  });

  it('generates unique uuid', () => {
    const a = createListItem({ listId: 'l', name: 'A', quantity: 1, unit: 'un', unitPrice: 1 });
    const b = createListItem({ listId: 'l', name: 'B', quantity: 1, unit: 'un', unitPrice: 1 });
    expect(a.id).not.toBe(b.id);
  });
});
