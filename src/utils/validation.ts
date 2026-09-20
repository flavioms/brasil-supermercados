import type { ItemUnit } from '@/models/ListItem';

export const LISTA_NOME_MIN = 2;
export const LISTA_NOME_MAX = 60;

export const ITEM_NOME_MIN = 2;
export const ITEM_NOME_MAX = 80;

export const ITEM_QUANTIDADE_MIN = 0.001;
export const ITEM_QUANTIDADE_MAX = 9999;

export const ITEM_PRECO_MIN = 0;
export const ITEM_PRECO_MAX = 99999.99;

export const UNIDADES_VALIDAS: ItemUnit[] = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct'];

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateListName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (trimmed.length < LISTA_NOME_MIN) {
    return { valid: false, error: `Nome deve ter pelo menos ${LISTA_NOME_MIN} caracteres` };
  }
  if (trimmed.length > LISTA_NOME_MAX) {
    return { valid: false, error: `Nome deve ter no máximo ${LISTA_NOME_MAX} caracteres` };
  }
  return { valid: true, error: null };
}

export interface ItemFields {
  name: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
}

export function validateItemFields(fields: ItemFields): ValidationResult {
  const trimmedName = fields.name.trim();
  if (trimmedName.length < ITEM_NOME_MIN) {
    return { valid: false, error: `Nome deve ter pelo menos ${ITEM_NOME_MIN} caracteres` };
  }
  if (trimmedName.length > ITEM_NOME_MAX) {
    return { valid: false, error: `Nome deve ter no máximo ${ITEM_NOME_MAX} caracteres` };
  }
  if (fields.quantity < ITEM_QUANTIDADE_MIN || fields.quantity > ITEM_QUANTIDADE_MAX) {
    return {
      valid: false,
      error: `Quantidade deve estar entre ${ITEM_QUANTIDADE_MIN} e ${ITEM_QUANTIDADE_MAX}`,
    };
  }
  if (!UNIDADES_VALIDAS.includes(fields.unit)) {
    return { valid: false, error: `Unidade inválida: ${fields.unit}` };
  }
  if (fields.unitPrice < ITEM_PRECO_MIN || fields.unitPrice > ITEM_PRECO_MAX) {
    return {
      valid: false,
      error: `Preço deve estar entre R$ ${ITEM_PRECO_MIN} e R$ ${ITEM_PRECO_MAX}`,
    };
  }
  return { valid: true, error: null };
}
