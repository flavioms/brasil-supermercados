import { describe, it, expect } from 'vitest';
import { generateUUID } from '@/utils/uuid';

describe('generateUUID', () => {
  it('returns a string', () => {
    expect(typeof generateUUID()).toBe('string');
  });

  it('generates unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUUID()));
    expect(ids.size).toBe(100);
  });

  it('matches UUID v4 format', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
