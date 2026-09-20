import { describe, it, expect } from 'vitest';
import { createShoppingList } from '@/models/ShoppingList';

describe('createShoppingList', () => {
  it('creates a list with required fields', () => {
    const list = createShoppingList({ name: 'Atacadão' });
    expect(list.id).toBeTruthy();
    expect(list.name).toBe('Atacadão');
    expect(list.status).toBe('active');
    expect(list.totalCost).toBe(0);
    expect(list.checkedTotal).toBe(0);
    expect(list.budgetGoal).toBeNull();
    expect(list.colorTag).toBeNull();
    expect(list.createdAt).toBeTypeOf('number');
    expect(list.updatedAt).toBeTypeOf('number');
  });

  it('sets budgetGoal when provided', () => {
    const list = createShoppingList({ name: 'Semana', budgetGoal: 500 });
    expect(list.budgetGoal).toBe(500);
  });

  it('generates unique ids', () => {
    const a = createShoppingList({ name: 'A' });
    const b = createShoppingList({ name: 'B' });
    expect(a.id).not.toBe(b.id);
  });
});
