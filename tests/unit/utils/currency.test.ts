import { describe, it, expect } from 'vitest';
import { formatBRL } from '@/utils/currency';

describe('formatBRL', () => {
  it('formats integer value', () => {
    expect(formatBRL(10)).toBe('R$ 10,00');
  });

  it('formats decimal value', () => {
    expect(formatBRL(9.99)).toBe('R$ 9,99');
  });

  it('formats zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formats large value', () => {
    const result = formatBRL(1234.56);
    expect(result).toContain('1.234,56');
  });
});
