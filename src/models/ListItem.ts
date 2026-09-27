import { generateUUID } from '@/utils/uuid';
import { WEIGHT_VOLUME_UNITS, calcPricePerRefUnit } from '@/utils/units';

export type ItemUnit = 'un' | 'kg' | 'g' | 'L' | 'ml' | 'cx' | 'pct';
export type PriceSource = 'manual' | 'barcode' | 'nfe';

export interface ListItem {
  id: string;
  listId: string;
  name: string;
  /** For weight/volume units, the size of a single package (e.g. 1 for a 1kg bag). */
  quantity: number;
  unit: ItemUnit;
  /** For weight/volume units, the total shelf price of a single package. */
  unitPrice: number;
  /** How many identical packages were bought. Always 1 for count-based units. */
  packageCount: number;
  lineTotal: number;
  pricePerRefUnit: number | null;
  isChecked: boolean;
  position: number;
  categoryId: string | null;
  barcodeEan: string | null;
  priceSource: PriceSource;
  createdAt: number;
  updatedAt: number;
}

export interface CreateListItemInput {
  listId: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  packageCount?: number;
  position?: number;
  categoryId?: string | null;
  priceSource?: PriceSource;
}

// Weight/volume packages carry a fixed shelf price per package (BR-31), so the
// line total must multiply by how many packages were bought, not by their size.
export function calcLineTotal(
  quantity: number,
  unit: ItemUnit,
  unitPrice: number,
  packageCount: number
): number {
  return WEIGHT_VOLUME_UNITS.includes(unit) ? packageCount * unitPrice : quantity * unitPrice;
}

export function createListItem(input: CreateListItemInput): ListItem {
  const now = Date.now();
  const packageCount = input.packageCount ?? 1;
  const lineTotal = calcLineTotal(input.quantity, input.unit, input.unitPrice, packageCount);
  return {
    id: generateUUID(),
    listId: input.listId,
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    unitPrice: input.unitPrice,
    packageCount,
    lineTotal,
    pricePerRefUnit: calcPricePerRefUnit(input.unitPrice, input.quantity, input.unit),
    isChecked: false,
    position: input.position ?? 1000,
    categoryId: input.categoryId ?? null,
    barcodeEan: null,
    priceSource: input.priceSource ?? 'manual',
    createdAt: now,
    updatedAt: now,
  };
}
