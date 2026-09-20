import { describe, it, expect } from 'vitest';
import { validateListName, validateItemFields } from '@/utils/validation';

describe('validateListName', () => {
  it('accepts valid name', () => {
    expect(validateListName('Semana').valid).toBe(true);
  });

  it('rejects empty name', () => {
    const result = validateListName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('rejects name too short', () => {
    expect(validateListName('A').valid).toBe(false);
  });

  it('rejects name too long', () => {
    expect(validateListName('A'.repeat(61)).valid).toBe(false);
  });

  it('trims before validating', () => {
    expect(validateListName('  OK  ').valid).toBe(true);
  });
});

describe('validateItemFields', () => {
  const valid = { name: 'Arroz', quantity: 1, unit: 'kg' as const, unitPrice: 7.5 };

  it('accepts valid fields', () => {
    expect(validateItemFields(valid).valid).toBe(true);
  });

  it('rejects name too short', () => {
    expect(validateItemFields({ ...valid, name: 'A' }).valid).toBe(false);
  });

  it('rejects quantity below minimum', () => {
    expect(validateItemFields({ ...valid, quantity: 0 }).valid).toBe(false);
  });

  it('rejects negative price', () => {
    expect(validateItemFields({ ...valid, unitPrice: -1 }).valid).toBe(false);
  });
});
