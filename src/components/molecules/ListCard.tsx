'use client';

import { BudgetProgressBar } from '@/components/atoms/ProgressBar';
import { formatBRL } from '@/utils/currency';
import type { ShoppingList } from '@/models/ShoppingList';

interface ListCardProps {
  list: ShoppingList;
  onClick: () => void;
}

function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

export function ListCard({ list, onClick }: ListCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-title font-semibold text-on-surface">{list.name}</h3>
          <span className="text-caption text-on-surface-muted">{formatRelativeDate(list.updatedAt)}</span>
        </div>
        <div className="text-right">
          <div className="text-title font-bold text-on-surface">{formatBRL(list.totalCost)}</div>
          {list.budgetGoal !== null && (
            <div className="text-caption text-on-surface-muted">
              meta: {formatBRL(list.budgetGoal)}
            </div>
          )}
        </div>
      </div>

      {list.budgetGoal !== null && (
        <div className="mt-3">
          <BudgetProgressBar current={list.checkedTotal} goal={list.budgetGoal} />
        </div>
      )}
    </button>
  );
}
