import type { ItemUnit } from '@/models/ListItem';

export interface UnitConversion {
  refUnit: string;
  factor: number; // multiply quantity by this to get reference unit quantity
}

export const UNIT_CONVERSION_TABLE: Partial<Record<ItemUnit, UnitConversion>> = {
  kg: { refUnit: 'kg', factor: 1 },
  g: { refUnit: 'kg', factor: 0.001 },
  L: { refUnit: 'L', factor: 1 },
  ml: { refUnit: 'L', factor: 0.001 },
};

export function getRefUnit(unit: ItemUnit): string | null {
  const conversion = UNIT_CONVERSION_TABLE[unit];
  return conversion ? conversion.refUnit : null;
}

export function calcPricePerRefUnit(
  unitPrice: number,
  quantity: number,
  unit: ItemUnit
): number | null {
  const conversion = UNIT_CONVERSION_TABLE[unit];
  if (!conversion) return null;

  const refQuantity = quantity * conversion.factor;
  if (refQuantity <= 0) return null;

  return unitPrice / refQuantity;
}
