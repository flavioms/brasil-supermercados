import { generateUUID } from '@/utils/uuid';

export interface Category {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
  sortOrder: number;
}

export function createCategory(input: Omit<Category, 'id'>): Category {
  return {
    id: generateUUID(),
    ...input,
  };
}

export const CATEGORIAS_PADRAO: Omit<Category, 'id'>[] = [
  { name: 'Açougue', icon: '🥩', colorHex: '#c62828', sortOrder: 1 },
  { name: 'Padaria', icon: '🍞', colorHex: '#f57c00', sortOrder: 2 },
  { name: 'Frios/Laticínios', icon: '🧀', colorHex: '#ffd54f', sortOrder: 3 },
  { name: 'Mercearia', icon: '🌾', colorHex: '#8d6e63', sortOrder: 4 },
  { name: 'Hortifruti', icon: '🥦', colorHex: '#4caf50', sortOrder: 5 },
  { name: 'Limpeza', icon: '🧹', colorHex: '#29b6f6', sortOrder: 6 },
  { name: 'Higiene Pessoal', icon: '🧴', colorHex: '#ab47bc', sortOrder: 7 },
  { name: 'Bebidas', icon: '🥤', colorHex: '#42a5f5', sortOrder: 8 },
  { name: 'Congelados', icon: '🧊', colorHex: '#80deea', sortOrder: 9 },
  { name: 'Outros', icon: '📦', colorHex: '#90a4ae', sortOrder: 10 },
];
