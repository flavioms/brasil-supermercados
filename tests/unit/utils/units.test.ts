import { describe, it, expect } from 'vitest';
import { calcPricePerRefUnit, getRefUnit } from '@/utils/units';

describe('calcPricePerRefUnit', () => {
  it('calculates R$/kg for kg unit', () => {
    expect(calcPricePerRefUnit(10, 1, 'kg')).toBeCloseTo(10);
  });

  it('normalizes g to kg', () => {
    // 100g at R$1,00 = R$10,00/kg
    expect(calcPricePerRefUnit(1, 100, 'g')).toBeCloseTo(10);
  });

  it('calculates R$/L for L unit', () => {
    expect(calcPricePerRefUnit(8.99, 1, 'L')).toBeCloseTo(8.99);
  });

  it('normalizes ml to L', () => {
    // 900ml at R$8,99 = ~R$9,99/L
    expect(calcPricePerRefUnit(8.99, 900, 'ml')).toBeCloseTo(9.988, 2);
  });

  it('returns null for un unit', () => {
    expect(calcPricePerRefUnit(5, 1, 'un')).toBeNull();
  });

  it('returns null for cx unit', () => {
    expect(calcPricePerRefUnit(5, 1, 'cx')).toBeNull();
  });
});

describe('getRefUnit', () => {
  it('returns kg for kg', () => {
    expect(getRefUnit('kg')).toBe('kg');
  });

  it('returns kg for g', () => {
    expect(getRefUnit('g')).toBe('kg');
  });

  it('returns L for L', () => {
    expect(getRefUnit('L')).toBe('L');
  });

  it('returns L for ml', () => {
    expect(getRefUnit('ml')).toBe('L');
  });

  it('returns null for un', () => {
    expect(getRefUnit('un')).toBeNull();
  });
});
