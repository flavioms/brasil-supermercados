import { describe, it, expect, vi } from 'vitest';
import { generateUUID } from '@/utils/uuid';

describe('generateUUID', () => {
  it('returns a valid UUID v4 format', () => {
    const id = generateUUID();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateUUID()));
    expect(ids.size).toBe(20);
  });

  it('uses fallback when crypto.randomUUID is unavailable', () => {
    const original = crypto.randomUUID;
    // @ts-expect-error — simulating missing API
    crypto.randomUUID = undefined;
    const id = generateUUID();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    crypto.randomUUID = original;
  });
});
