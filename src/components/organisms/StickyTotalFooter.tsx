'use client';

import { useEffect, useRef, useState } from 'react';
import { formatBRL } from '@/utils/currency';
import { BudgetProgressBar } from '@/components/atoms/ProgressBar';

interface StickyTotalFooterProps {
  totalCost: number;
  checkedTotal: number;
  budgetGoal: number | null;
}

export function StickyTotalFooter({ totalCost, checkedTotal, budgetGoal }: StickyTotalFooterProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const prevTotalRef = useRef(totalCost);

  useEffect(() => {
    if (prevTotalRef.current !== totalCost) {
      prevTotalRef.current = totalCost;
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalCost]);

  const remaining = budgetGoal !== null ? budgetGoal - checkedTotal : null;

  return (
    <footer className="sticky bottom-0 border-t border-gray-200 bg-white px-4 pb-safe-area-inset-bottom pt-3 shadow-[0_-2px_12px_rgba(0,0,0,0.15)]">
      {budgetGoal !== null && (
        <div className="mb-2">
          <BudgetProgressBar current={checkedTotal} goal={budgetGoal} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="text-caption text-on-surface-muted">Total da lista</div>
          <div
            className={`text-title font-bold text-on-surface ${isPulsing ? 'animate-[pulse-quick_0.3s_ease-in-out]' : ''}`}
            data-testid="total-cost"
          >
            {formatBRL(totalCost)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-caption text-on-surface-muted">No carrinho</div>
          <div className="text-title font-semibold text-primary" data-testid="checked-total">
            {formatBRL(checkedTotal)}
          </div>
        </div>
      </div>

      {remaining !== null && (
        <div
          className={`mt-1 text-right text-caption ${remaining < 0 ? 'text-danger' : 'text-on-surface-muted'}`}
          data-testid="remaining"
        >
          {remaining >= 0
            ? `Falta ${formatBRL(remaining)} para a meta`
            : `${formatBRL(Math.abs(remaining))} acima do orçamento`}
        </div>
      )}
    </footer>
  );
}
