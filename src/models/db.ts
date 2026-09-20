import Dexie, { type Table } from 'dexie';
import type { ShoppingList } from './ShoppingList';
import type { ListItem } from './ListItem';
import type { Category } from './Category';

class SupermercadoDB extends Dexie {
  shoppingLists!: Table<ShoppingList>;
  listItems!: Table<ListItem>;
  categories!: Table<Category>;

  constructor() {
    super('supermercado-brasil');

    this.version(1).stores({
      shoppingLists: '++id, status, createdAt',
      listItems: '++id, listId, isChecked, position, barcodeEan',
      categories: '++id, sortOrder',
    });
  }
}

export const db = new SupermercadoDB();
