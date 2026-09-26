'use client';

import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/organisms/BottomSheet';
import { AutocompleteInput } from '@/components/molecules/AutocompleteInput';
import { ListItemController } from '@/controllers/ListItemController';
import { PriceComparisonController } from '@/controllers/PriceComparisonController';
import { formatBRL } from '@/utils/currency';
import { getRefUnit, WEIGHT_VOLUME_UNITS } from '@/utils/units';
import { db } from '@/models/db';
import type { ItemUnit, ListItem } from '@/models/ListItem';
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
  const [listPeers, setListPeers] = useState<ListItem[]>([]);

  useEffect(() => {
    if (!isOpen || !listId) return;
    db.listItems
      .where('listId')
      .equals(listId)
      .toArray()
      .then((items) => setListPeers(items));
  }, [isOpen, listId]);

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
        <h2 className="text-title text-on-surface mb-4 font-semibold">
          {isEditMode ? 'Editar item' : 'Adicionar item'}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-caption text-on-surface-muted mb-1 block">Nome</label>
            <AutocompleteInput
              value={name}
              onChange={setName}
              onSelect={handleSuggestionSelect}
              placeholder="Ex: Arroz Camil 5kg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption text-on-surface-muted mb-1 block">Quantidade</label>
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
                className="text-body focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-caption text-on-surface-muted mb-1 block">Unidade</label>
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
                className="text-body focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none"
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
            <label
              htmlFor="item-unit-price"
              className="text-caption text-on-surface-muted mb-1 block"
            >
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
              className="text-body focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Preview */}
          {lineTotal > 0 && (
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-caption text-on-surface-muted">Total do item</span>
                <span className="text-title text-primary font-bold">{formatBRL(lineTotal)}</span>
              </div>
              {pricePerUnit && (
                <div className="text-caption text-on-surface-muted mt-0.5 text-right">
                  {formatBRL(pricePerUnit.value)}/{pricePerUnit.refUnit}
                </div>
              )}
              {(() => {
                if (!pricePerUnit || !isWeightVolume) return null;
                const refUnit = getRefUnit(unit);
                if (!refUnit) return null;
                const peers = listPeers.filter(
                  (p) =>
                    p.id !== itemId && p.pricePerRefUnit !== null && getRefUnit(p.unit) === refUnit
                );
                if (peers.length === 0) return null;
                const currentEntry = {
                  id: '__new__',
                  name: name.trim() || 'Este item',
                  pricePerRefUnit: pricePerUnit.value,
                };
                const all = [
                  ...peers.map((p) => ({
                    id: p.id,
                    name: p.name,
                    pricePerRefUnit: p.pricePerRefUnit as number,
                  })),
                  currentEntry,
                ].sort((a, b) => a.pricePerRefUnit - b.pricePerRefUnit);
                const minPrice = Math.min(...all.map((e) => e.pricePerRefUnit));
                return (
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <p className="text-caption text-on-surface-muted mb-1">
                      Comparando por {refUnit} nesta lista:
                    </p>
                    {all.map((entry) => {
                      const isCheapest = entry.pricePerRefUnit <= minPrice + 0.001;
                      const isCurrent = entry.id === '__new__';
                      return (
                        <div key={entry.id} className="flex justify-between py-0.5">
                          <span
                            className={`text-caption ${isCurrent ? 'text-on-surface font-medium' : 'text-on-surface-muted'}`}
                          >
                            {entry.name}
                          </span>
                          <span
                            className={`text-caption ${isCheapest ? 'text-primary font-medium' : 'text-on-surface-muted'}`}
                          >
                            {formatBRL(entry.pricePerRefUnit)}/{refUnit}
                            {isCheapest ? ' ★' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {error && <p className="text-caption text-danger">{error}</p>}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!name.trim() || qty <= 0}
          className="bg-primary text-body mt-4 w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50"
        >
          {isEditMode ? 'Salvar alterações' : 'Adicionar à lista'}
        </button>
      </div>
    </BottomSheet>
  );
}
