'use client';

import { SwipeContainer } from '@/components/molecules/SwipeContainer';
import { PriceBadge } from '@/components/atoms/PriceBadge';
import { ListItemController } from '@/controllers/ListItemController';
import { getRefUnit } from '@/utils/units';
import { formatBRL } from '@/utils/currency';
import { hapticFeedback } from '@/utils/haptics';
import type { ListItem } from '@/models/ListItem';

interface ItemRowProps {
  item: ListItem;
  onEditRequest: (itemId: string) => void;
}

export function ItemRow({ item, onEditRequest }: ItemRowProps) {
  const refUnit = getRefUnit(item.unit);

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
      <div
        className={`flex items-center gap-3 px-4 py-3 ${item.isChecked ? 'opacity-60' : ''}`}
      >
        {/* Checkbox visual */}
        <button
          onClick={handleToggle}
          aria-label={item.isChecked ? 'Desmarcar item' : 'Marcar item como no carrinho'}
          className="flex h-[var(--spacing-touch)] w-6 flex-shrink-0 items-center justify-center"
        >
          <div
            className={`h-5 w-5 rounded-full border-2 transition-colors ${
              item.isChecked
                ? 'border-primary bg-primary'
                : 'border-gray-400 bg-white'
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

        {/* Item info */}
        <button
          onClick={() => onEditRequest(item.id)}
          className="min-h-[var(--spacing-touch)] flex-1 text-left"
        >
          <div
            className={`text-body font-medium ${item.isChecked ? 'line-through text-on-surface-muted' : 'text-on-surface'}`}
          >
            {item.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-on-surface-muted">
              {item.quantity} {item.unit} × {formatBRL(item.unitPrice)}
            </span>
            {item.pricePerRefUnit !== null && refUnit !== null && (
              <PriceBadge pricePerRefUnit={item.pricePerRefUnit} refUnit={refUnit} />
            )}
          </div>
        </button>

        {/* Line total */}
        <div className="flex-shrink-0 text-right">
          <div className="text-body font-semibold text-on-surface">{formatBRL(item.lineTotal)}</div>
        </div>
      </div>
    </SwipeContainer>
  );
}
