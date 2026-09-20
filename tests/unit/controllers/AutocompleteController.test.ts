import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/models/db';
import { AutocompleteController } from '@/controllers/AutocompleteController';
import { createListItem } from '@/models/ListItem';

beforeEach(async () => {
  await db.listItems.clear();
  // Reset module caches between tests
  const ctrl = AutocompleteController as { buildLocalIndex: () => Promise<void> };
  await ctrl.buildLocalIndex();
});

describe('AutocompleteController', () => {
  it('returns empty for query shorter than 2 chars', async () => {
    const results = await AutocompleteController.getSuggestions('a');
    expect(results).toHaveLength(0);
  });

  it('returns suggestions from bundled catalog for "arr"', async () => {
    const results = await AutocompleteController.getSuggestions('arr');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((s) => s.name.toLowerCase().includes('arr'))).toBe(true);
  });

  it('returns suggestions for "ole"', async () => {
    const results = await AutocompleteController.getSuggestions('ole');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns history before catalog', async () => {
    const listId = 'test-list';
    const item = createListItem({ listId, name: 'Arroz Especial', quantity: 1, unit: 'kg', unitPrice: 8 });
    await db.listItems.add(item);
    await AutocompleteController.buildLocalIndex();

    const results = await AutocompleteController.getSuggestions('Arroz Esp');
    expect(results[0]?.name).toBe('Arroz Especial');
  });

  it('limits results to 5 by default', async () => {
    const results = await AutocompleteController.getSuggestions('a');
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
