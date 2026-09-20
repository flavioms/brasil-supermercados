import { generateUUID } from '@/utils/uuid';

export type ItemUnit = 'un' | 'kg' | 'g' | 'L' | 'ml' | 'cx' | 'pct';
export type PriceSource = 'manual' | 'barcode' | 'nfe';

export interface ListItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
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
  position?: number;
  categoryId?: string | null;
  priceSource?: PriceSource;
}

export function createListItem(input: CreateListItemInput): ListItem {
  const now = Date.now();
  const lineTotal = input.quantity * input.unitPrice;
  return {
    id: generateUUID(),
    listId: input.listId,
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    unitPrice: input.unitPrice,
    lineTotal,
    pricePerRefUnit: null,
    isChecked: false,
    position: input.position ?? 1000,
    categoryId: input.categoryId ?? null,
    barcodeEan: null,
    priceSource: input.priceSource ?? 'manual',
    createdAt: now,
    updatedAt: now,
  };
}
