'use client';

import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { AutocompleteInput } from '@/components/molecules/AutocompleteInput';
import { ListItemController } from '@/controllers/ListItemController';
import { PriceComparisonController } from '@/controllers/PriceComparisonController';
import { formatBRL } from '@/utils/currency';
import { WEIGHT_VOLUME_UNITS } from '@/utils/units';
import { db } from '@/models/db';
import type { ItemUnit } from '@/models/ListItem';
import type { Suggestion } from '@/controllers/AutocompleteController';

const UNITS: ItemUnit[] = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct'];
const INTEGER_UNITS: ItemUnit[] = ['un', 'cx', 'pct'];

interface ItemFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  itemId?: string;
}

export function ItemFormSheet({ isOpen, onClose, listId, itemId }: ItemFormSheetProps) {
  const isEditMode = Boolean(itemId);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<ItemUnit>('un');
  const [unitPrice, setUnitPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (itemId) {
      db.listItems.get(itemId).then((item) => {
        if (item) {
          setName(item.name);
          setQuantity(String(item.quantity));
          setUnit(item.unit);
          setUnitPrice(String(item.unitPrice));
        }
      });
    } else {
      setName('');
      setQuantity('1');
      setUnit('un');
      setUnitPrice('');
      setError(null);
    }
  }, [isOpen, itemId]);

  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;
  const isWeightVolume = WEIGHT_VOLUME_UNITS.includes(unit);
  // For weight/volume: price IS the total (e.g. R$30 for a 2kg package)
  const lineTotal = isWeightVolume ? price : qty * price;
  const pricePerUnit = PriceComparisonController.calcPricePerUnit(price, qty, unit);

  const handleSuggestionSelect = (s: Suggestion) => {
    setName(s.name);
    setUnit(s.unit);
    if (s.lastPrice !== undefined) setUnitPrice(String(s.lastPrice));
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      if (isEditMode && itemId) {
        await ListItemController.updateItem(itemId, {
          name,
          quantity: qty,
          unit,
          unitPrice: price,
        });
      } else {
        await ListItemController.addItem({ listId, name, quantity: qty, unit, unitPrice: price });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      label={isEditMode ? 'Editar item' : 'Adicionar item'}
    >
      <div className="px-4 pb-6">
        <h2 className="mb-4 text-title font-semibold text-on-surface">
          {isEditMode ? 'Editar item' : 'Adicionar item'}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-caption text-on-surface-muted">Nome</label>
            <AutocompleteInput
              value={name}
              onChange={setName}
              onSelect={handleSuggestionSelect}
              placeholder="Ex: Arroz Camil 5kg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-caption text-on-surface-muted">Quantidade</label>
              <input
                type="number"
                inputMode={INTEGER_UNITS.includes(unit) ? 'numeric' : 'decimal'}
                min={INTEGER_UNITS.includes(unit) ? '1' : '0.01'}
                step={INTEGER_UNITS.includes(unit) ? '1' : '0.01'}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={(e) => {
                  const num = parseFloat(e.target.value);
                  if (isNaN(num) || num <= 0) {
                    setQuantity(INTEGER_UNITS.includes(unit) ? '1' : '0.01');
                  } else if (INTEGER_UNITS.includes(unit)) {
                    setQuantity(String(Math.round(num)));
                  } else {
                    setQuantity(String(Math.round(num * 100) / 100));
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-caption text-on-surface-muted">Unidade</label>
              <select
                value={unit}
                onChange={(e) => {
                  const newUnit = e.target.value as ItemUnit;
                  setUnit(newUnit);
                  if (INTEGER_UNITS.includes(newUnit)) {
                    const num = parseFloat(quantity);
                    setQuantity(String(Math.max(1, isNaN(num) ? 1 : Math.round(num))));
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="item-unit-price" className="mb-1 block text-caption text-on-surface-muted">
              {isWeightVolume ? 'Preço da embalagem (R$)' : 'Preço unitário (R$)'}
            </label>
            <input
              id="item-unit-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Preview */}
          {lineTotal > 0 && (
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-caption text-on-surface-muted">Total do item</span>
                <span className="text-title font-bold text-primary">{formatBRL(lineTotal)}</span>
              </div>
              {pricePerUnit && (
                <div className="mt-0.5 text-right text-caption text-on-surface-muted">
                  {formatBRL(pricePerUnit.value)}/{pricePerUnit.refUnit}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-caption text-danger">{error}</p>}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!name.trim() || qty <= 0}
          className="mt-4 w-full rounded-xl bg-primary py-3 text-body font-semibold text-white disabled:opacity-50"
        >
          {isEditMode ? 'Salvar alterações' : 'Adicionar à lista'}
        </button>
      </div>
    </BottomSheet>
  );
}
