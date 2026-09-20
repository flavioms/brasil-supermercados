import { describe, it, expect } from 'vitest';
import { createListItem } from '@/models/ListItem';

describe('createListItem', () => {
  it('creates an item with correct lineTotal', () => {
    const item = createListItem({
      listId: 'list-1',
      name: 'Arroz',
      quantity: 2,
      unit: 'kg',
      unitPrice: 7.5,
    });
    expect(item.lineTotal).toBe(15);
  });

  it('sets default values', () => {
    const item = createListItem({
      listId: 'list-1',
      name: 'Feijão',
      quantity: 1,
      unit: 'kg',
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
