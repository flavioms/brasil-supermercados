'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/models/db';
import type { ListItem } from '@/models/ListItem';

export function useListItems(listId: string): ListItem[] {
  return (
    useLiveQuery(
      () => db.listItems.where('listId').equals(listId).sortBy('position'),
      [listId],
      []
    ) ?? []
  );
}
