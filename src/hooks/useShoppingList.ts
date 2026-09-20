'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/models/db';
import type { ShoppingList } from '@/models/ShoppingList';

export function useShoppingList(listId: string): ShoppingList | undefined {
  return useLiveQuery(() => db.shoppingLists.get(listId), [listId]);
}
