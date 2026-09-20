import { generateUUID } from '@/utils/uuid';

export interface ShoppingList {
  id: string;
  name: string;
  budgetGoal: number | null;
  status: 'active' | 'archived';
  totalCost: number;
  checkedTotal: number;
  colorTag: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateShoppingListInput {
  name: string;
  budgetGoal?: number | null;
  colorTag?: string | null;
}

export function createShoppingList(input: CreateShoppingListInput): ShoppingList {
  const now = Date.now();
  return {
    id: generateUUID(),
    name: input.name,
    budgetGoal: input.budgetGoal ?? null,
    status: 'active',
    totalCost: 0,
    checkedTotal: 0,
    colorTag: input.colorTag ?? null,
    createdAt: now,
    updatedAt: now,
  };
}
