'use client';

import { formatBRL } from '@/utils/currency';

interface PriceBadgeProps {
  pricePerRefUnit: number | null;
  refUnit: string | null;
}

export function PriceBadge({ pricePerRefUnit, refUnit }: PriceBadgeProps) {
  if (pricePerRefUnit === null || refUnit === null) return null;

  return (
    <span className="text-caption text-on-surface-muted rounded bg-gray-100 px-1.5 py-0.5">
      {formatBRL(pricePerRefUnit)}/{refUnit}
    </span>
  );
}
