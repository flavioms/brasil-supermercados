'use client';

import { formatBRL } from '@/utils/currency';

interface PriceBadgeProps {
  pricePerRefUnit: number | null;
  refUnit: string | null;
}

export function PriceBadge({ pricePerRefUnit, refUnit }: PriceBadgeProps) {
  if (pricePerRefUnit === null || refUnit === null) return null;

  return (
    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-caption text-on-surface-muted">
      {formatBRL(pricePerRefUnit)}/{refUnit}
    </span>
  );
}
