'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/models/db';

export interface ListTotals {
  totalCost: number;
  checkedTotal: number;
  budgetGoal: number | null;
}

export function useListTotal(listId: string): ListTotals {
  const totals = useLiveQuery(
    async () => {
      const list = await db.shoppingLists.get(listId);
      if (!list) return { totalCost: 0, checkedTotal: 0, budgetGoal: null };
      return {
        totalCost: list.totalCost,
        checkedTotal: list.checkedTotal,
        budgetGoal: list.budgetGoal,
      };
    },
    [listId],
    { totalCost: 0, checkedTotal: 0, budgetGoal: null }
  );

  return totals ?? { totalCost: 0, checkedTotal: 0, budgetGoal: null };
}
