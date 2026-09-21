'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/models/db';
import type { ShoppingList } from '@/models/ShoppingList';

export function useShoppingLists(): ShoppingList[] {
  return (
    useLiveQuery(
      () => db.shoppingLists.where('status').equals('active').reverse().sortBy('createdAt'),
      [],
      []
    ) ?? []
  );
}
