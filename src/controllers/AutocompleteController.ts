import { db } from '@/models/db';
import type { ItemUnit } from '@/models/ListItem';
import catalogData from '@/data/produtos-br.json';

export interface Suggestion {
  name: string;
  unit: ItemUnit;
  lastPrice?: number;
}

interface CatalogEntry {
  name: string;
  unit: string;
  aliases?: string[];
}

interface SuggestionWithTimestamp extends Suggestion {
  _createdAt: number;
}

let localIndex: Suggestion[] | null = null;

const catalogCache: Suggestion[] = (catalogData as CatalogEntry[])
  .filter((entry): entry is CatalogEntry => typeof entry.name === 'string')
  .map((entry) => ({ name: entry.name, unit: (entry.unit as ItemUnit) ?? 'un' }));

export const AutocompleteController = {
  async buildLocalIndex(): Promise<void> {
    const items = await db.listItems.toArray();
    const seen = new Map<string, SuggestionWithTimestamp>();

    for (const item of items) {
      const key = item.name.toLowerCase();
      const existing = seen.get(key);
      if (!existing || item.createdAt > existing._createdAt) {
        seen.set(key, {
          name: item.name,
          unit: item.unit,
          lastPrice: item.unitPrice,
          _createdAt: item.createdAt,
        });
      }
    }

    localIndex = Array.from(seen.values()).map(({ _createdAt: _ts, ...s }) => s);
  },

  async getSuggestions(query: string, limit = 5): Promise<Suggestion[]> {
    if (query.trim().length < 2) return [];

    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    // 1. History first
    if (!localIndex) {
      await AutocompleteController.buildLocalIndex();
    }

    const fromHistory = (localIndex ?? []).filter((s) =>
      normalize(s.name).includes(normalizedQuery)
    );

    if (fromHistory.length >= limit) {
      return fromHistory.slice(0, limit);
    }

    // 2. Bundled catalog (loaded synchronously at module init)
    const historyNames = new Set(fromHistory.map((s) => s.name.toLowerCase()));

    const fromCatalog = (catalogCache ?? [])
      .filter(
        (s) =>
          !historyNames.has(s.name.toLowerCase()) && normalize(s.name).includes(normalizedQuery)
      )
      .slice(0, limit - fromHistory.length);

    return [...fromHistory, ...fromCatalog];
  },
};
