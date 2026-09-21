import { describe, it, expect } from 'vitest';
import { createCategory, CATEGORIAS_PADRAO } from '@/models/Category';

describe('Category', () => {
  it('createCategory generates id and preserves fields', () => {
    const cat = createCategory({ name: 'Teste', icon: '🧪', colorHex: '#fff', sortOrder: 99 });
    expect(cat.id).toBeTruthy();
    expect(cat.name).toBe('Teste');
    expect(cat.icon).toBe('🧪');
    expect(cat.sortOrder).toBe(99);
  });

  it('createCategory generates unique ids', () => {
    const a = createCategory({ name: 'A', icon: '🅰️', colorHex: '#000', sortOrder: 1 });
    const b = createCategory({ name: 'B', icon: '🅱️', colorHex: '#000', sortOrder: 2 });
    expect(a.id).not.toBe(b.id);
  });

  it('CATEGORIAS_PADRAO has 10 categories', () => {
    expect(CATEGORIAS_PADRAO).toHaveLength(10);
  });

  it('all default categories have required fields', () => {
    for (const cat of CATEGORIAS_PADRAO) {
      expect(cat.name).toBeTruthy();
      expect(cat.icon).toBeTruthy();
      expect(cat.colorHex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(cat.sortOrder).toBeGreaterThan(0);
    }
  });
});
