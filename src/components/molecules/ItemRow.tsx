'use client';

import { SwipeContainer } from '@/components/molecules/SwipeContainer';
import { ListItemController } from '@/controllers/ListItemController';
import { getRefUnit, WEIGHT_VOLUME_UNITS } from '@/utils/units';
import { formatBRL } from '@/utils/currency';
import { hapticFeedback } from '@/utils/haptics';
import type { ListItem } from '@/models/ListItem';

interface ItemRowProps {
  item: ListItem;
  allItems: ListItem[];
  onEditRequest: (itemId: string) => void;
}

function PriceComparisonBadge({ item, allItems }: { item: ListItem; allItems: ListItem[] }) {
  if (item.pricePerRefUnit === null) return null;

  const refUnit = getRefUnit(item.unit);
  if (!refUnit) return null;

  // Filter comparable items (same refUnit, different id)
  const comparable = allItems.filter((other) => {
    if (other.id === item.id) return false;
    return getRefUnit(other.unit) === refUnit && other.pricePerRefUnit !== null;
  });

  if (comparable.length === 0) {
    // Solo: just show the normalized price
    return (
      <span className="text-caption text-on-surface-muted rounded bg-gray-100 px-1.5 py-0.5">
        {formatBRL(item.pricePerRefUnit)}/{refUnit}
      </span>
    );
  }

  const cheapestPrice = Math.min(
    item.pricePerRefUnit,
    ...comparable.map((o) => o.pricePerRefUnit as number)
  );

  const isBest = item.pricePerRefUnit <= cheapestPrice + 0.001;

  if (isBest) {
    return (
      <span className="bg-primary/10 text-caption text-primary flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium">
        ★ {formatBRL(item.pricePerRefUnit)}/{refUnit}
      </span>
    );
  }

  return (
    <span className="bg-warning/10 text-warning flex flex-col items-end rounded px-1.5 py-0.5">
      <span className="text-caption font-medium">
        {formatBRL(item.pricePerRefUnit)}/{refUnit}
      </span>
      <span className="text-[10px] tracking-wide uppercase">mais caro</span>
    </span>
  );
}

export function ItemRow({ item, allItems, onEditRequest }: ItemRowProps) {
  const handleToggle = async () => {
    hapticFeedback([10]);
    await ListItemController.toggleCheck(item.id);
  };

  const handleDelete = async () => {
    hapticFeedback([20, 10, 20]);
    await ListItemController.deleteItem(item.id);
  };

  return (
    <SwipeContainer
      onSwipeRight={handleToggle}
      onSwipeLeft={handleDelete}
      rightLabel={item.isChecked ? 'Desmarcar' : 'Marcar'}
      leftLabel="Excluir"
    >
      <div className={`flex items-center gap-3 px-4 py-3 ${item.isChecked ? 'opacity-60' : ''}`}>
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          aria-label={item.isChecked ? 'Desmarcar item' : 'Marcar item como no carrinho'}
          className="flex h-[var(--spacing-touch)] w-6 flex-shrink-0 items-center justify-center"
        >
          <div
            className={`h-5 w-5 rounded-full border-2 transition-colors ${
              item.isChecked ? 'border-primary bg-primary' : 'border-gray-400 bg-white'
            }`}
          >
            {item.isChecked && (
              <svg viewBox="0 0 20 20" className="h-full w-full" fill="white">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </button>

        {/* Info */}
        <button
          onClick={() => onEditRequest(item.id)}
          className="min-h-[var(--spacing-touch)] flex-1 text-left"
        >
          <div
            className={`text-body font-medium ${
              item.isChecked ? 'text-on-surface-muted line-through' : 'text-on-surface'
            }`}
          >
            {item.name}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-caption text-on-surface-muted">
              {WEIGHT_VOLUME_UNITS.includes(item.unit)
                ? `${item.quantity} ${item.unit} por ${formatBRL(item.lineTotal)}`
                : `${item.quantity} ${item.unit} × ${formatBRL(item.unitPrice)}`}
            </span>
            <PriceComparisonBadge item={item} allItems={allItems} />
          </div>
        </button>

        {/* Line total */}
        <div className="flex-shrink-0 text-right">
          <div className="text-body text-on-surface font-semibold">{formatBRL(item.lineTotal)}</div>
        </div>
      </div>
    </SwipeContainer>
  );
}
